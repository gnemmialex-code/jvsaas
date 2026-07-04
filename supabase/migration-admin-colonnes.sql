-- ============================================================
-- MIGRATION : colonnes du back-office admin
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor → Run)
-- Réexécutable sans risque (idempotente)
-- ============================================================
-- Le back-office (/admin) utilise ces colonnes en plus de plan_id :
--   notes            — notes internes visibles uniquement par l'admin
--   is_banned        — bannissement d'un compte
--   plan             — libellé du plan posé par l'admin (free/essentiel/pro/ultra)
--   plan_started_at  — date de début du plan posé par l'admin
-- plan_id reste LA colonne de vérité lue par l'application.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;
