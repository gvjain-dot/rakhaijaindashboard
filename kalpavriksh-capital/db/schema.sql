-- Run once in the Neon SQL editor.
CREATE TABLE IF NOT EXISTS posts (
  id               SERIAL PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  excerpt          TEXT NOT NULL,
  feature_image    TEXT,
  content          TEXT NOT NULL DEFAULT '',
  category         TEXT,
  external_url     TEXT,            -- when set, the card links out (LinkedIn, static article) instead of opening a post page
  seo_title        TEXT,
  seo_description  TEXT,
  reading_minutes  INT NOT NULL DEFAULT 1,
  published        BOOLEAN NOT NULL DEFAULT false,
  published_at     TIMESTAMPTZ,     -- a future date on a published post means "scheduled"
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Added by db/migrations/002_seo_and_blog_features.sql (existing databases run that file instead)
  feature_image_alt TEXT,
  social_image      TEXT,
  canonical_url     TEXT,
  noindex           BOOLEAN NOT NULL DEFAULT false,
  focus_keyword     TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  preview_token     TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  -- Added by db/migrations/003_blog_redesign.sql
  featured          BOOLEAN NOT NULL DEFAULT false,
  author_name       TEXT,
  author_bio        TEXT,
  view_count        INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts (category);
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN (tags);
CREATE UNIQUE INDEX IF NOT EXISTS posts_one_featured_idx ON posts (featured) WHERE featured;

CREATE TABLE IF NOT EXISTS post_views (
  id            BIGSERIAL PRIMARY KEY,
  post_id       INT  NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  day           DATE NOT NULL DEFAULT CURRENT_DATE,
  visitor_hash  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, day, visitor_hash)
);
CREATE INDEX IF NOT EXISTS post_views_day_idx ON post_views (day);

CREATE TABLE IF NOT EXISTS subscribers (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  source      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_idx ON subscribers (lower(email));

-- Added by db/migrations/004_taxonomy_terms.sql
CREATE TABLE IF NOT EXISTS taxonomy_terms (
  id          SERIAL PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('category', 'tag')),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS taxonomy_terms_kind_name_idx ON taxonomy_terms (kind, lower(name));
