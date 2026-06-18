-- =============================================
-- TwentySix Dashboard - Complete Database Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- FUNCTION: update_updated_at_column
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLE: dashboard_sections
-- Stores navigation sections and their metadata
-- =============================================
CREATE TABLE IF NOT EXISTS dashboard_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  route TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_dashboard_sections_status ON dashboard_sections(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_sections_sort ON dashboard_sections(sort_order);

-- =============================================
-- TABLE: dashboard_page_meta
-- Stores page-level metadata (headlines, intro text)
-- =============================================
CREATE TABLE IF NOT EXISTS dashboard_page_meta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL DEFAULT 'home',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  headline TEXT,
  subheadline TEXT,
  intro TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_dashboard_page_meta_status ON dashboard_page_meta(status);

-- =============================================
-- TABLE: site_content
-- Stores all editable text content across the site
-- =============================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_key TEXT UNIQUE NOT NULL,
  content_value TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',
  page TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(content_key);
CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE dashboard_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_page_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- POLICIES: dashboard_sections
DROP POLICY IF EXISTS "Public can read published sections" ON dashboard_sections;
CREATE POLICY "Public can read published sections"
  ON dashboard_sections FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can read all sections" ON dashboard_sections;
CREATE POLICY "Authenticated users can read all sections"
  ON dashboard_sections FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert sections" ON dashboard_sections;
CREATE POLICY "Authenticated users can insert sections"
  ON dashboard_sections FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update sections" ON dashboard_sections;
CREATE POLICY "Authenticated users can update sections"
  ON dashboard_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete draft sections" ON dashboard_sections;
CREATE POLICY "Authenticated users can delete draft sections"
  ON dashboard_sections FOR DELETE TO authenticated USING (status = 'draft');

-- POLICIES: dashboard_page_meta
DROP POLICY IF EXISTS "Public can read published page meta" ON dashboard_page_meta;
CREATE POLICY "Public can read published page meta"
  ON dashboard_page_meta FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can read all page meta" ON dashboard_page_meta;
CREATE POLICY "Authenticated users can read all page meta"
  ON dashboard_page_meta FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert page meta" ON dashboard_page_meta;
CREATE POLICY "Authenticated users can insert page meta"
  ON dashboard_page_meta FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update page meta" ON dashboard_page_meta;
CREATE POLICY "Authenticated users can update page meta"
  ON dashboard_page_meta FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete draft page meta" ON dashboard_page_meta;
CREATE POLICY "Authenticated users can delete draft page meta"
  ON dashboard_page_meta FOR DELETE TO authenticated USING (status = 'draft');

-- POLICIES: site_content
DROP POLICY IF EXISTS "Public can read site content" ON site_content;
CREATE POLICY "Public can read site content"
  ON site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert site content" ON site_content;
CREATE POLICY "Authenticated users can insert site content"
  ON site_content FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update site content" ON site_content;
CREATE POLICY "Authenticated users can update site content"
  ON site_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete site content" ON site_content;
CREATE POLICY "Authenticated users can delete site content"
  ON site_content FOR DELETE TO authenticated USING (true);

-- =============================================
-- TRIGGERS
-- =============================================
DROP TRIGGER IF EXISTS update_dashboard_sections_updated_at ON dashboard_sections;
CREATE TRIGGER update_dashboard_sections_updated_at
  BEFORE UPDATE ON dashboard_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_page_meta_updated_at ON dashboard_page_meta;
CREATE TRIGGER update_dashboard_page_meta_updated_at
  BEFORE UPDATE ON dashboard_page_meta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA: Dashboard Sections
-- =============================================
INSERT INTO dashboard_sections (slug, title, description, icon, route, status, sort_order)
VALUES 
  ('market-context', 'Market Context', 'Explore the housing association sector landscape, regional trends, and benchmark organisations.', 'trendingUp', '/market-context', 'published', 1),
  ('market-data', 'Market Data Results', 'View your full pay benchmarking results across all roles with 5 quartile market analysis.', 'barChart', '/market-data', 'published', 2),
  ('role-details', 'Role-by-Role Detail', 'Examine detailed breakdowns for each role including pay ranges and positioning.', 'users', '/role-details', 'published', 3),
  ('risks', 'Strengths & Risks', 'Identify pay positioning strengths and areas of potential risk requiring attention.', 'alertTriangle', '/risks', 'published', 4),
  ('market-comparison', 'Market Comparison', 'Compare your organisation''s pay levels against sector peers with visual charts.', 'lineChart', '/market-comparison', 'published', 5),
  ('bonus', 'Bonus Potential', 'Analyse bonus and incentive structures across the sector and your organisation.', 'percent', '/bonus', 'published', 6),
  ('benefits', 'Benefits', 'Review your benefits package against market standards and best practices.', 'gift', '/benefits', 'published', 7),
  ('benefits-trends', 'Benefits Trends & Ideas', 'Discover emerging benefits trends and innovative ideas for your organisation.', 'lightbulb', '/benefits-trends', 'published', 8),
  ('next-steps', 'Next Steps', 'Get actionable recommendations and strategic guidance for your reward planning.', 'arrowRight', '/next-steps', 'published', 9),
  ('data-sources', 'Data Sources', 'View the methodology and data sources used in this analysis.', 'database', '/data-sources', 'published', 10)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  route = EXCLUDED.route,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order;

-- Seed published page meta
INSERT INTO dashboard_page_meta (page_key, status, headline, subheadline, intro)
VALUES ('home', 'published', 'Use Your Dashboard', 'How to interpret pay ranges', 'Your personalised pay benchmarking dashboard provides comprehensive market insights.')
ON CONFLICT (page_key) DO UPDATE SET
  headline = EXCLUDED.headline,
  subheadline = EXCLUDED.subheadline,
  intro = EXCLUDED.intro,
  status = EXCLUDED.status;
