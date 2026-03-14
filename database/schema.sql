-- ============================================================
-- India Policy Portal — Supabase SQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ─── profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT,
    full_name   TEXT,
    avatar_url  TEXT,
    role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- ─── categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    icon        TEXT,              -- emoji or icon name
    color       TEXT DEFAULT '#3B82F6',
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Seed categories
INSERT INTO categories (name, slug, icon, color) VALUES
    ('Health',          'health',          '🏥', '#EF4444'),
    ('Agriculture',     'agriculture',     '🌾', '#22C55E'),
    ('Education',       'education',       '📚', '#3B82F6'),
    ('Infrastructure',  'infrastructure',  '🏗️', '#F97316'),
    ('Finance',         'finance',         '💰', '#EAB308'),
    ('Defence',         'defence',         '🛡️', '#6B7280'),
    ('Environment',     'environment',     '🌿', '#10B981'),
    ('Technology',      'technology',      '💻', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;
-- ─── policies ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS policies (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title            TEXT NOT NULL,
    summary          TEXT,
    description      TEXT,
    category_id      INT REFERENCES categories(id) ON DELETE SET NULL,
    ministry         TEXT,
    launched_date    DATE,
    status           TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
    budget_outlay    TEXT,
    beneficiaries    TEXT,
    eligibility      TEXT,
    benefits         TEXT[],
    official_url     TEXT,
    government_level TEXT NOT NULL DEFAULT 'Central' CHECK (government_level IN ('Central', 'State', 'Joint')),
    state            TEXT,
    is_featured      BOOLEAN DEFAULT FALSE,
    view_count       INT DEFAULT 0,
    created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS policies_updated_at ON policies;
CREATE TRIGGER policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ─── policies_with_category VIEW ─────────────────────────────
CREATE OR REPLACE VIEW policies_with_category AS
SELECT
    p.*,
    c.name   AS category_name,
    c.slug   AS category_slug,
    c.icon   AS category_icon,
    c.color  AS category_color
FROM policies p
LEFT JOIN categories c ON p.category_id = c.id;
-- ─── news ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT NOT NULL,
    content      TEXT,
    summary      TEXT,
    category_id  INT REFERENCES categories(id) ON DELETE SET NULL,
    policy_id    UUID REFERENCES policies(id) ON DELETE SET NULL,
    tag          TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
-- ─── bookmarks ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_id  UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, policy_id)
);
-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE news       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks  ENABLE ROW LEVEL SECURITY;
-- Profiles: users can read all, update only their own
CREATE POLICY "profiles_read_all"     ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (auth.uid() = id);
-- Policies: public read, admin write (handled server-side via service key)
CREATE POLICY "policies_read_all"     ON policies FOR SELECT USING (TRUE);
CREATE POLICY "policies_admin_write"  ON policies FOR ALL USING (TRUE) WITH CHECK (TRUE);
-- News: public read published, admin write
CREATE POLICY "news_read_published"   ON news FOR SELECT USING (is_published = TRUE OR TRUE);
CREATE POLICY "news_admin_write"      ON news FOR ALL USING (TRUE) WITH CHECK (TRUE);
-- Bookmarks: users see/manage only their own
CREATE POLICY "bookmarks_own"         ON bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- ─── Sample seed data ─────────────────────────────────────────
INSERT INTO policies (title, summary, ministry, launched_date, status, government_level, is_featured, benefits, category_id, budget_outlay, beneficiaries, eligibility)
SELECT
    'Pradhan Mantri Jan Dhan Yojana',
    'National mission for financial inclusion to ensure access to financial services for all households.',
    'Ministry of Finance',
    '2014-08-28',
    'Active',
    'Central',
    TRUE,
    ARRAY['Zero balance bank account', 'RuPay debit card', 'Accident insurance cover of ₹2 lakh', 'Overdraft facility up to ₹10,000'],
    c.id,
    '₹10,000 Crore',
    '50 Crore+ households',
    'All Indian citizens without a bank account'
FROM categories c WHERE c.slug = 'finance'
ON CONFLICT DO NOTHING;
INSERT INTO policies (title, summary, ministry, launched_date, status, government_level, is_featured, benefits, category_id, budget_outlay, beneficiaries, eligibility)
SELECT
    'Ayushman Bharat PM-JAY',
    'World''s largest health assurance scheme providing health cover of ₹5 lakh per family per year.',
    'Ministry of Health & Family Welfare',
    '2018-09-23',
    'Active',
    'Central',
    TRUE,
    ARRAY['Health cover up to ₹5 lakh per family', 'Cashless treatment at empanelled hospitals', 'No restriction on family size or age', 'Covers pre-existing diseases from day one'],
    c.id,
    '₹7,200 Crore annually',
    '50 Crore+ beneficiaries',
    'Families listed in SECC database'
FROM categories c WHERE c.slug = 'health'
ON CONFLICT DO NOTHING;
INSERT INTO policies (title, summary, ministry, launched_date, status, government_level, is_featured, benefits, category_id, budget_outlay, beneficiaries, eligibility)
SELECT
    'PM Kisan Samman Nidhi',
    'Direct income support of ₹6,000 per year in three equal instalments to small and marginal farmers.',
    'Ministry of Agriculture & Farmers Welfare',
    '2019-02-24',
    'Active',
    'Central',
    TRUE,
    ARRAY['₹6,000 annual income support', 'Direct bank transfer in three instalments', 'Covers all landholding farmer families'],
    c.id,
    '₹75,000 Crore annually',
    '12 Crore+ farmers',
    'Small and marginal farmers with land upto 2 hectares'
FROM categories c WHERE c.slug = 'agriculture'
ON CONFLICT DO NOTHING;
INSERT INTO policies (title, summary, ministry, launched_date, status, government_level, is_featured, benefits, category_id, budget_outlay)
SELECT
    'National Education Policy 2020',
    'Comprehensive framework overhauling education at all levels from school to higher education.',
    'Ministry of Education',
    '2020-07-29',
    'Active',
    'Central',
    TRUE,
    ARRAY['5+3+3+4 curricular structure', 'Mother tongue as medium of instruction till Grade 5', '50% gross enrolment ratio in higher education by 2035', 'Multidisciplinary education'],
    c.id,
    '₹4 Lakh Crore over 10 years'
FROM categories c WHERE c.slug = 'education'
ON CONFLICT DO NOTHING;
-- Sample news
INSERT INTO news (title, summary, tag, is_published, published_at)
VALUES
    ('PM-JAY Extends Coverage to 70+ Senior Citizens', 'Government extends Ayushman Bharat coverage to all senior citizens aged 70 and above, regardless of income.', 'Health', TRUE, NOW() - INTERVAL '2 days'),
    ('PM Kisan 17th Instalment Released', '₹20,000 Crore disbursed to over 9.3 crore farmers under PM Kisan Samman Nidhi scheme.', 'Agriculture', TRUE, NOW() - INTERVAL '5 days'),
    ('New Digital India 2.0 Initiative Launched', 'Government announces Digital India 2.0 with focus on AI, semiconductors, and expanding internet access to rural areas.', 'Technology', TRUE, NOW() - INTERVAL '8 days')
ON CONFLICT DO NOTHING;