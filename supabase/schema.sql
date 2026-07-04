-- CelebSwap Ultra HD — Schéma Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 100,
  -- 'free' = compte gratuit (résultats floutés). Les formules payantes
  -- (plan_essentiel / plan_pro / plan_ultra) sont posées par le webhook Stripe.
  plan_id TEXT NOT NULL DEFAULT 'free',
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  snap_rouge_access BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_referral_code_idx ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS users_referred_by_idx   ON public.users(referred_by);

-- Migration: add plan_id to existing installations
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_id TEXT NOT NULL DEFAULT 'plan_essentiel';
-- Migration parrainage + Snap Rouge : voir supabase/migration-parrainage-snap-rouge.sql

-- ============================================================
-- TABLE: generations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.generations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  input_image_url TEXT NOT NULL,
  output_image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  -- Suivi du pipeline asynchrone (/api/generate + /api/generate/poll)
  status TEXT NOT NULL DEFAULT 'done',
  prediction_id TEXT,
  step INTEGER,
  job_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generations_user_id_idx ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS generations_created_at_idx ON public.generations(created_at DESC);

-- ============================================================
-- TABLE: credit_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'use', 'bonus', 'referral')),
  pack_id TEXT,
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- NB : Postgres n'a pas de CREATE POLICY IF NOT EXISTS — on DROP avant de
-- recréer pour que le script soit réexécutable sans erreur (idempotent).

-- users: users can only see/update their own record
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- generations: users can only see/delete their own
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own generations" ON public.generations;
CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own generations" ON public.generations;
CREATE POLICY "Users can update own generations"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generations" ON public.generations;
CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- credit_transactions: read-only for users
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Unique referral code generator (8 chars)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
BEGIN
  LOOP
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = v_code);
  END LOOP;
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user record on signup with 100 free credits (= 1 image)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits, plan_id, referral_code)
  VALUES (NEW.id, NEW.email, 100, 'free', public.generate_referral_code())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply a referral code: referee +100 credits, referrer +200 credits
CREATE OR REPLACE FUNCTION public.apply_referral(p_user_id UUID, p_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user     public.users%ROWTYPE;
  v_referrer public.users%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Utilisateur introuvable');
  END IF;
  IF v_user.referred_by IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Un code de parrainage a déjà été utilisé sur ce compte');
  END IF;
  IF v_user.created_at < NOW() - INTERVAL '7 days' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Le parrainage est réservé aux nouveaux comptes (moins de 7 jours)');
  END IF;

  SELECT * INTO v_referrer FROM public.users WHERE referral_code = upper(trim(p_code));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Code de parrainage invalide');
  END IF;
  IF v_referrer.id = p_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Vous ne pouvez pas utiliser votre propre code');
  END IF;

  UPDATE public.users
  SET referred_by = v_referrer.id, credits = credits + 100, updated_at = NOW()
  WHERE id = p_user_id;

  UPDATE public.users
  SET credits = credits + 200, updated_at = NOW()
  WHERE id = v_referrer.id;

  INSERT INTO public.credit_transactions (user_id, amount, type)
  VALUES (p_user_id, 100, 'referral'),
         (v_referrer.id, 200, 'referral');

  RETURN jsonb_build_object('ok', true, 'referrer_id', v_referrer.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic credit decrement (prevents race conditions)
CREATE OR REPLACE FUNCTION public.decrement_credits(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET credits = credits - 1,
      updated_at = NOW()
  WHERE id = user_id AND credits > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Crédits insuffisants';
  END IF;

  -- Log the usage
  INSERT INTO public.credit_transactions (user_id, amount, type)
  VALUES (user_id, -1, 'use');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic credit add (for purchases)
CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET credits = credits + amount,
      updated_at = NOW()
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABLE: contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages(created_at DESC);

-- Admins read-all via service role; no RLS needed for anonymous inserts
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- TABLE: celebrities
-- ============================================================
CREATE TABLE IF NOT EXISTS public.celebrities (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  aliases     TEXT[] DEFAULT '{}',
  category    TEXT NOT NULL,
  gender      TEXT NOT NULL DEFAULT 'male',
  nationality TEXT NOT NULL DEFAULT 'fr',
  visual_description TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS celebrities_name_idx   ON public.celebrities(name);
CREATE INDEX IF NOT EXISTS celebrities_active_idx ON public.celebrities(active);

-- Read-only for public (search endpoint)
ALTER TABLE public.celebrities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read celebrities" ON public.celebrities;
CREATE POLICY "Anyone can read celebrities"
  ON public.celebrities FOR SELECT
  USING (active = TRUE);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Créer le bucket (à faire via Dashboard ou API Supabase)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('celebswap-images', 'celebswap-images', true);

-- Storage policies (si bucket public)
-- CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'celebswap-images');
-- CREATE POLICY "Authenticated insert" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'celebswap-images' AND auth.role() = 'authenticated');
