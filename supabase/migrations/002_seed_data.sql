-- =============================================
-- SEED DATA: Initial Dashboard Sections
-- Run this after 001_dashboard_tables.sql
-- =============================================

-- Insert PUBLISHED sections (visible to public)
INSERT INTO dashboard_sections (slug, title, description, icon, route, status, sort_order) VALUES
  ('dashboard', 'Dashboard', 'Your dashboard starting point', 'home', '/', 'published', 1),
  ('market-context', 'Market Context', 'Economic trends and market analysis', 'trendingUp', '/market-context', 'published', 2),
  ('market-data', 'Market Data Results', 'Detailed pay data and comparisons', 'barChart', '/market-data', 'published', 3),
  ('role-details', 'Role-by-Role Detail', 'Individual role analysis', 'users', '/role-details', 'published', 4),
  ('risks', 'Strengths & Risks', 'Position distribution and outlier analysis', 'alertTriangle', '/risks', 'published', 5),
  ('market-comparison', 'Market Comparison', 'Visual comparison charts', 'lineChart', '/market-comparison', 'published', 6),
  ('bonus', 'Bonus Potential', 'Bonus and incentive analysis', 'percent', '/bonus', 'published', 7),
  ('benefits', 'Benefits Breakdown', 'Market provision of key benefits', 'gift', '/benefits', 'published', 8),
  ('benefits-trends', 'Benefits Trends & Ideas', 'Emerging themes and ideas', 'lightbulb', '/benefits-trends', 'published', 9),
  ('next-steps', 'Next Steps', 'Recommendations and actions', 'arrowRight', '/next-steps', 'published', 10),
  ('data-sources', 'Data Sources', 'Methodology and sources', 'database', '/data-sources', 'published', 11);

-- Insert DRAFT sections (same content, for editing)
INSERT INTO dashboard_sections (slug, title, description, icon, route, status, sort_order) VALUES
  ('dashboard-draft', 'Dashboard', 'Your dashboard starting point', 'home', '/', 'draft', 1),
  ('market-context-draft', 'Market Context', 'Economic trends and market analysis', 'trendingUp', '/market-context', 'draft', 2),
  ('market-data-draft', 'Market Data Results', 'Detailed pay data and comparisons', 'barChart', '/market-data', 'draft', 3),
  ('role-details-draft', 'Role-by-Role Detail', 'Individual role analysis', 'users', '/role-details', 'draft', 4),
  ('risks-draft', 'Strengths & Risks', 'Position distribution and outlier analysis', 'alertTriangle', '/risks', 'draft', 5),
  ('market-comparison-draft', 'Market Comparison', 'Visual comparison charts', 'lineChart', '/market-comparison', 'draft', 6),
  ('bonus-draft', 'Bonus Potential', 'Bonus and incentive analysis', 'percent', '/bonus', 'draft', 7),
  ('benefits-draft', 'Benefits Breakdown', 'Market provision of key benefits', 'gift', '/benefits', 'draft', 8),
  ('benefits-trends-draft', 'Benefits Trends & Ideas', 'Emerging themes and ideas', 'lightbulb', '/benefits-trends', 'draft', 9),
  ('next-steps-draft', 'Next Steps', 'Recommendations and actions', 'arrowRight', '/next-steps', 'draft', 10),
  ('data-sources-draft', 'Data Sources', 'Methodology and sources', 'database', '/data-sources', 'draft', 11);

-- =============================================
-- SEED DATA: Dashboard Page Meta
-- =============================================

-- Insert PUBLISHED page meta
INSERT INTO dashboard_page_meta (page_key, status, headline, subheadline, intro) VALUES
  ('home', 'published', 
   'Use Your Dashboard', 
   'How to interpret pay ranges',
   'Welcome to your salary benchmarking dashboard. Use the sections below to explore market data, identify strengths and risks, and plan your reward strategy.');

-- Insert DRAFT page meta (same content, for editing)
INSERT INTO dashboard_page_meta (page_key, status, headline, subheadline, intro) VALUES
  ('home-draft', 'draft', 
   'Use Your Dashboard', 
   'How to interpret pay ranges',
   'Welcome to your salary benchmarking dashboard. Use the sections below to explore market data, identify strengths and risks, and plan your reward strategy.');
