-- Page sections table for storing editable sections per page
CREATE TABLE IF NOT EXISTS page_sections (
  id TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'card',
  title TEXT NOT NULL DEFAULT '',
  content JSONB DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation items table for customizable sidebar
CREATE TABLE IF NOT EXISTS nav_items (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'FileText',
  "order" INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections("order");
CREATE INDEX IF NOT EXISTS idx_nav_items_order ON nav_items("order");

-- Enable Row Level Security
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;

-- Policies for page_sections - allow read for all, write for authenticated
CREATE POLICY "Allow read access for all users on page_sections"
  ON page_sections FOR SELECT
  USING (true);

CREATE POLICY "Allow write access for authenticated users on page_sections"
  ON page_sections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policies for nav_items - allow read for all, write for authenticated
CREATE POLICY "Allow read access for all users on nav_items"
  ON nav_items FOR SELECT
  USING (true);

CREATE POLICY "Allow write access for authenticated users on nav_items"
  ON nav_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
