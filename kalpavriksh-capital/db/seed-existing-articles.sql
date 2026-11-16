-- Imports the four articles that were hardcoded on the old Blogs page.
-- They are "link-out" posts: the card opens external_url instead of a post page.
-- Safe to re-run: existing slugs are left untouched.
INSERT INTO posts (slug, title, excerpt, category, external_url, reading_minutes, published, published_at)
VALUES
  ('what-will-replace-your-salary-in-5-years',
   'What Will Replace Your Salary in 5 Years?',
   'Retirement isn''t about stopping work — it''s about decoupling your lifestyle from your time. Build passive income before you need it.',
   'Retirement Planning',
   'https://www.linkedin.com/pulse/what-replace-your-salary-5-years-rakhi-jain-uyicf/',
   5, true, '2026-02-23T09:00:00Z'),
  ('dont-put-all-your-eggs-in-one-basket',
   'Don''t Put All Your Eggs in One Basket',
   'Why asset allocation — not stock-picking — is the single most powerful decision you''ll make as an investor.',
   'Asset Allocation',
   '/asset-allocation',
   6, true, '2026-02-16T09:00:00Z'),
  ('when-the-world-is-on-fire',
   'When the World Is on Fire: How to Keep Your Investments from Burning',
   'Navigating geopolitical crises as an investor — without letting fear or greed make the decisions for you.',
   'Behavioural Finance',
   'https://www.linkedin.com/pulse/when-world-fire-how-keep-your-investments-from-burning-rakhi-jain-ausgf',
   5, true, '2026-03-09T09:00:00Z'),
  ('the-smart-persons-blind-spot',
   'The Smart Person''s Blind Spot',
   'Why brilliant, disciplined professionals who manage enormous complexity at work quietly let their own financial planning drift.',
   'Financial Planning',
   'https://www.linkedin.com/posts/rakhi-jain-7658328_the-smart-persons-blind-spot-activity-7447508527922937858-J7CC',
   4, true, '2026-04-06T09:00:00Z')
ON CONFLICT (slug) DO NOTHING;
