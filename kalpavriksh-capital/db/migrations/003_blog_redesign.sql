-- Blog redesign: featured post, per-post author, view analytics.
--
-- Run this ONCE in the Neon SQL editor against every database the site uses, BEFORE deploying the
-- matching code. It is additive and idempotent: it only adds things and re-running it is harmless.
-- The currently deployed code keeps working with these extras present.

-- ── Featured post + author ───────────────────────────────────────────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_name TEXT;     -- falls back to "Rakhi Jain" when empty
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_bio  TEXT;

-- Only one post can be featured at a time.
CREATE UNIQUE INDEX IF NOT EXISTS posts_one_featured_idx ON posts (featured) WHERE featured;

-- ── Views (privacy-friendly: no IP, no user agent, no cookies) ───────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS post_views (
  id            BIGSERIAL PRIMARY KEY,
  post_id       INT  NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  day           DATE NOT NULL DEFAULT CURRENT_DATE,
  visitor_hash  TEXT NOT NULL,                  -- sha256(ip + ua + daily-rotating salt); cannot be reversed
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, day, visitor_hash)           -- one counted view per visitor per post per day
);
CREATE INDEX IF NOT EXISTS post_views_day_idx ON post_views (day);
