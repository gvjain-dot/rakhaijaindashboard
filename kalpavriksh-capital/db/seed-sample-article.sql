-- Sample article for testing the blog list, article page and "In this article" contents list.
-- Run in the Neon SQL editor AFTER db/migrations/003_blog_redesign.sql. Safe to re-run (updates the same slug).
-- Delete it later from the admin dashboard, or: DELETE FROM posts WHERE slug = 'business-wealth-and-family-wealth';

INSERT INTO posts (slug, title, excerpt, category, tags, reading_minutes, published, published_at, author_name, author_bio, seo_title, seo_description, content)
VALUES (
  'business-wealth-and-family-wealth',
  'When Business Wealth and Family Wealth Become the Same Thing',
  'For many founders, the company is the family''s largest asset, its main source of income and its most important legacy, all at once. That concentration deserves deliberate attention.',
  'Business Owners & Entrepreneurs',
  ARRAY['business owners', 'succession', 'wealth planning'],
  6,
  true,
  now() - interval '1 hour',
  'Rakhi Jain',
  'Chartered Accountant and founder of Kalpvriksh Global, helping families build clarity around wealth, life and legacy.',
  'When Business Wealth and Family Wealth Become the Same Thing | Kalpvriksh Global',
  'Why founders should separate business wealth from family wealth gradually, and the signals that show it is time to start the conversation.',
  $content$
For many founders, the company is the family's largest asset, its main source of income and its most important legacy, all at once. This is rarely a decision anyone made. It happened gradually, one good year at a time.

## The overlap no one designed

Early on, the business and the household share everything: the same bank balance, the same risks and the same hopes. That works while the company is small and growing. It becomes fragile when the company is large and the family depends on it entirely.

The question is not whether the business is a good one. It is whether the family's security should rest on a single asset, however good.

## Three ways the overlap shows up

### Concentration

Most of the family's net worth sits in one company, in one industry, in one set of customers. A downturn there is a downturn everywhere.

### Income dependence

Salary, dividends, loans to the company and personal expenses often flow through the same accounts. If the business slows, household spending has no buffer of its own.

### Identity and control

The founder's role, the family's status and the next generation's expectations are tied to the company. Decisions about money quickly become decisions about belonging, which makes them harder to take calmly.

## Mapping the two balance sheets

Begin by writing down two balance sheets side by side: the business's and the family's. List what each owns, what each owes and what each depends on the other for.

- Personal guarantees given to lenders
- Property held inside the company versus outside it
- Family members on the payroll, and what they would do without it
- Insurance and liquid savings that exist independently of the business

Seeing both on one page usually answers the question of how exposed the family really is.

## A framework for gradual separation

Separation does not mean selling the company. It means building a second foundation so the family is not standing on one.

1. **Pay yourself on a schedule.** A fixed, reasonable draw makes household cash flow predictable.
2. **Move surplus out regularly.** Each year, shift a defined share of profits into diversified investments held in the family's name.
3. **Hold key assets personally.** Where it is legally and tax-wise sensible, keep the home and long-term investments outside the company.
4. **Protect against the downside.** Adequate life and health cover, and a clear plan for what happens if the founder is unavailable.
5. **Document the intent.** A short written plan removes guesswork for everyone involved.

> Wealth that depends on one asset is a bet. Wealth that is spread across several is a plan.

## When the conversation should begin

Earlier than most people expect. The best time is when the business is doing well, because choices made under no pressure are almost always better ones.

### Signals worth noticing

- A single customer or product accounts for most revenue
- Personal borrowing is secured against business assets
- No one else in the family understands how the company is financed
- The next generation has not been asked what they want

## Bringing it together

Business wealth and family wealth will always be connected. The aim is not to cut the link but to make sure each can stand if the other has a difficult year. A calm, early conversation is the first step.
$content$
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, category = EXCLUDED.category, tags = EXCLUDED.tags,
  reading_minutes = EXCLUDED.reading_minutes, published = true, published_at = EXCLUDED.published_at,
  author_name = EXCLUDED.author_name, author_bio = EXCLUDED.author_bio, seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description, content = EXCLUDED.content, updated_at = now();
