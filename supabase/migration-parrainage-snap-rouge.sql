-- ============================================================
-- MIGRATION : Parrainage + Snap Rouge
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor → Run)
-- Réexécutable sans risque (idempotente)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Table credit_transactions (créée si absente de votre base) ──
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  pack_id TEXT,
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ── Types de transaction autorisés (inclut 'referral') ──
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('purchase', 'use', 'bonus', 'referral'));

-- ── Nouvelles colonnes sur users ──
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS snap_rouge_access BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS users_referral_code_idx ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS users_referred_by_idx   ON public.users(referred_by);

-- ── Générateur de code parrain unique (8 caractères) ──
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

-- ── Backfill : un code pour chaque utilisateur existant ──
UPDATE public.users
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

-- ── Trigger inscription : 100 crédits offerts (exactement) + code parrain ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits, referral_code)
  VALUES (NEW.id, NEW.email, 100, public.generate_referral_code())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Application d'un code parrain ──
-- Filleul : +100 crédits bonus / Parrain : +200 crédits
-- Protections : 1 seule fois, pas son propre code, compte < 7 jours
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

  -- Filleul : +100 crédits
  UPDATE public.users
  SET referred_by = v_referrer.id, credits = credits + 100, updated_at = NOW()
  WHERE id = p_user_id;

  -- Parrain : +200 crédits
  UPDATE public.users
  SET credits = credits + 200, updated_at = NOW()
  WHERE id = v_referrer.id;

  INSERT INTO public.credit_transactions (user_id, amount, type)
  VALUES (p_user_id, 100, 'referral'),
         (v_referrer.id, 200, 'referral');

  RETURN jsonb_build_object('ok', true, 'referrer_id', v_referrer.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
