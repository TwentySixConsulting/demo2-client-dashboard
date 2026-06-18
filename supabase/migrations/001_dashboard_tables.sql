-- =============================================
-- Dashboard CMS Tables for TwentySix Dashboard
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create index for faster queries
CREATE INDEX idx_dashboard_sections_status ON dashboard_sections(status);
CREATE INDEX idx_dashboard_sections_sort ON dashboard_sections(sort_order);

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

-- Create index for faster queries
CREATE INDEX idx_dashboard_page_meta_status ON dashboard_page_meta(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on both tables
ALTER TABLE dashboard_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_page_meta ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES: dashboard_sections
-- =============================================

-- Public can read published content
CREATE POLICY "Public can read published sections"
  ON dashboard_sections
  FOR SELECT
  USING (status = 'published');

-- Authenticated users can read all content (including drafts)
CREATE POLICY "Authenticated users can read all sections"
  ON dashboard_sections
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert draft content
CREATE POLICY "Authenticated users can insert sections"
  ON dashboard_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update content
CREATE POLICY "Authenticated users can update sections"
  ON dashboard_sections
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete draft content
CREATE POLICY "Authenticated users can delete draft sections"
  ON dashboard_sections
  FOR DELETE
  TO authenticated
  USING (status = 'draft');

-- =============================================
-- POLICIES: dashboard_page_meta
-- =============================================

-- Public can read published content
CREATE POLICY "Public can read published page meta"
  ON dashboard_page_meta
  FOR SELECT
  USING (status = 'published');

-- Authenticated users can read all content
CREATE POLICY "Authenticated users can read all page meta"
  ON dashboard_page_meta
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert page meta"
  ON dashboard_page_meta
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update page meta"
  ON dashboard_page_meta
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete drafts
CREATE POLICY "Authenticated users can delete draft page meta"
  ON dashboard_page_meta
  FOR DELETE
  TO authenticated
  USING (status = 'draft');

-- =============================================
-- TRIGGER: Auto-update updated_at timestamp
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_sections_updated_at
  BEFORE UPDATE ON dashboard_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_page_meta_updated_at
  BEFORE UPDATE ON dashboard_page_meta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
