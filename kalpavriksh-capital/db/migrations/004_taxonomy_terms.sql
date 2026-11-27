-- Saved categories and tags, so a name can exist before any article uses it (Categories & tags tab > Add).
-- Run once in the Neon SQL editor. Safe to re-run.
CREATE TABLE IF NOT EXISTS taxonomy_terms (
  id          SERIAL PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('category', 'tag')),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS taxonomy_terms_kind_name_idx ON taxonomy_terms (kind, lower(name));
