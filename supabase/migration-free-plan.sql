-- ============================================================
-- Migration : comptes gratuits = plan 'free' (résultats floutés)
-- À exécuter UNE FOIS dans l'éditeur SQL de Supabase.
-- ============================================================

-- 1) Les nouveaux comptes ont par défaut le plan 'free'
ALTER TABLE public.users ALTER COLUMN plan_id SET DEFAULT 'free';

-- 2) Le trigger d'inscription pose explicitement plan_id = 'free'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits, plan_id, referral_code)
  VALUES (NEW.id, NEW.email, 100, 'free', public.generate_referral_code())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) (OPTIONNEL) Basculer les comptes encore sur l'ancien défaut 'plan_essentiel'
--    vers 'free'. À n'exécuter QUE si tu n'as pas encore de véritables abonnés
--    Essentiel (sinon tu re-flouterais leurs images).
-- UPDATE public.users SET plan_id = 'free' WHERE plan_id = 'plan_essentiel';
