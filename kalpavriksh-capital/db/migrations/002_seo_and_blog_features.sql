-- SEO controls, tags, draft preview links and newsletter subscribers.
--
-- Run this ONCE in the Neon SQL editor against every database the site uses (production, and any
-- separate dev/preview database), BEFORE deploying the matching code.
-- It is additive and idempotent: it only adds things, never changes or removes existing data,
-- and re-running it is harmless. The currently deployed code keeps working with these extras present.

-- ── SEO fields ───────────────────────────────────────────────────────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS feature_image_alt TEXT;                    -- alt text for the feature image
ALTER TABLE posts ADD COLUMN IF NOT EXISTS social_image      TEXT;                    -- optional separate image for link previews
ALTER TABLE posts ADD COLUMN IF NOT EXISTS canonical_url     TEXT;                    -- overrides the default canonical URL
ALTER TABLE posts ADD COLUMN IF NOT EXISTS noindex           BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS focus_keyword     TEXT;                    -- used by the editor's SEO checklist

-- ── Tags ─────────────────────────────────────────────────────────────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN (tags);

-- ── Private draft preview links ──────────────────────────────────────────────
-- Added nullable first so every existing row gets its own distinct token, then locked down.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS preview_token TEXT;
UPDATE posts SET preview_token = gen_random_uuid()::text WHERE preview_token IS NULL;
ALTER TABLE posts ALTER COLUMN preview_token SET DEFAULT gen_random_uuid()::text;
ALTER TABLE posts ALTER COLUMN preview_token SET NOT NULL;

-- ── Newsletter subscribers ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  source      TEXT,                                   -- where they signed up, e.g. the post slug
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_idx ON subscribers (lower(email));
