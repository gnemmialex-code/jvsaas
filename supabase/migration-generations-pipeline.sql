-- ============================================================
-- MIGRATION : colonnes du pipeline de génération asynchrone
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor → Run)
-- Réexécutable sans risque (idempotente)
-- ============================================================
-- Corrige "Could not find the 'job_config' column of 'generations'" :
-- le pipeline (/api/generate + /api/generate/poll) suit chaque job en base
-- avec ces colonnes :
--   status        — 'pending' | 'done' | 'error'
--   prediction_id — id de la prédiction Replicate en cours
--   step          — étape courante du pipeline multi-modèles
--   job_config    — configuration du job (JSON), purgée à la fin

-- Les lignes existantes sont des générations terminées → défaut 'done'
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'done';
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS prediction_id TEXT;
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS step INTEGER;
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS job_config JSONB;

CREATE INDEX IF NOT EXISTS generations_user_status_idx ON public.generations(user_id, status);

-- Le polling met à jour le job (status/step/prediction_id) avec la session
-- de l'utilisateur : sans policy UPDATE, RLS bloque silencieusement et la
-- génération resterait "pending" pour toujours.
DROP POLICY IF EXISTS "Users can update own generations" ON public.generations;
CREATE POLICY "Users can update own generations"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id);
