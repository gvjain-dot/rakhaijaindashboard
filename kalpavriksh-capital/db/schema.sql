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
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts (category);
