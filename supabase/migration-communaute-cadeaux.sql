-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : cadeaux « crédits » de la Communauté (espace « Cadeau »)
-- À exécuter dans le SQL Editor de Supabase.
--
-- community_credit_claims : enregistre chaque cadeau « 200 crédits » récupéré
-- par un membre. La contrainte d'unicité (claim_key, user_id) garantit qu'un
-- même cadeau ne peut être réclamé qu'une seule fois par utilisateur.
--
-- Les cadeaux eux-mêmes ne sont PAS stockés : ils sont générés à la volée par
-- le site (lib/community-bots.ts), 5 jours par semaine, dans la fenêtre 7h–23h.
-- La clé (claim_key) identifie de façon déterministe le cadeau d'un jour
-- (ex. « giftcred:20657 » = un jour précis). Un cadeau n'est réclamable que
-- pendant sa journée : à la réinitialisation de 7h, il n'est plus valable.
--
-- Tout passe par les routes API (clé service role) qui vérifient l'abonnement
-- Ultimate — la RLS bloque donc tout accès direct.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.community_credit_claims (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_key  TEXT NOT NULL,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (claim_key, user_id)
);

CREATE INDEX IF NOT EXISTS community_credit_claims_user_idx
  ON public.community_credit_claims (user_id);

ALTER TABLE public.community_credit_claims ENABLE ROW LEVEL SECURITY;
