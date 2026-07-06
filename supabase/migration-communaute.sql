-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : partie "Communauté" (réservée à l'abonnement Ultimate)
-- À exécuter dans le SQL Editor de Supabase.
--
-- • community_topics   : les discussions (titre + description). Trois
--   discussions par défaut sont créées : Général, Mise à jour, Cadeau.
--   "Mise à jour" et "Cadeau" sont en admin_only : seul l'administrateur
--   peut y écrire (les membres lisent).
-- • community_messages : les messages d'une discussion (texte et/ou image).
--   text_size permet à l'admin de publier des textes de différentes tailles
--   (small / normal / large / title).
--
-- Tout l'accès passe par les routes API du site (clé service role), qui
-- vérifient l'abonnement Ultimate — la RLS bloque donc tout accès direct.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.community_topics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '',
  admin_only  BOOLEAN NOT NULL DEFAULT FALSE,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    UUID NOT NULL REFERENCES public.community_topics(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '',
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  content     TEXT NOT NULL DEFAULT '',
  image_url   TEXT,
  text_size   TEXT NOT NULL DEFAULT 'normal', -- small / normal / large / title
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_messages_topic_idx
  ON public.community_messages (topic_id, created_at);

-- RLS verrouillée : aucun accès direct avec la clé anon, tout passe par l'API
ALTER TABLE public.community_topics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Les 3 discussions par défaut (créées seulement si absentes)
INSERT INTO public.community_topics (title, description, author_name, admin_only, is_default)
SELECT 'Général', 'Discutez librement entre membres Ultimate : partagez vos créations, vos astuces et vos idées.', 'High Like It', FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.community_topics WHERE is_default AND title = 'Général');

INSERT INTO public.community_topics (title, description, author_name, admin_only, is_default)
SELECT 'Mise à jour', 'Les annonces officielles et les nouveautés du site. Seul l''administrateur peut écrire ici.', 'High Like It', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.community_topics WHERE is_default AND title = 'Mise à jour');

INSERT INTO public.community_topics (title, description, author_name, admin_only, is_default)
SELECT 'Cadeau', 'Cadeaux, surprises et avantages exclusifs réservés aux membres Ultimate. Seul l''administrateur peut écrire ici.', 'High Like It', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.community_topics WHERE is_default AND title = 'Cadeau');
