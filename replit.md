# TwentySix Pay & Benefits Dashboard

## Overview

This is a salary benchmarking and market insights dashboard built for HR professionals and organizations. The application provides personalized pay analysis, market comparisons, benefits breakdowns, and strategic recommendations for reward planning.

The dashboard displays market data for job roles, comparing actual salaries against market quartiles (lower quartile, median, upper quartile), identifies pay positioning strengths and risks, and provides guidance on benefits trends and next steps for compensation planning.

## User Preferences

Preferred communication style: Simple, everyday language.

## Comprehensive Website Editor (Admin CMS)

The dashboard includes a full-featured website editor that allows authenticated admins to edit ALL content directly on any page - functioning as a complete content management system.

### How to Enable Edit Mode
1. Click "Edit as Admin" in the sidebar footer or top navigation
2. Log in with your Supabase credentials  
3. Edit mode activates automatically after login

### Edit Mode Features
- **Click to Edit ANY Text**: Every piece of text on every page is editable - titles, paragraphs, list items, stat values, chart labels, navigation labels, and more
- **Edit Sidebar Navigation**: Click any navigation label to rename it
- **Add New Navigation Tabs**: Click "Add New Tab" button to create new pages
- **Add New Sections**: Use the "+ Add Section" button to add new content blocks
- **Drag & Drop**: Reorder dashboard cards and sections by dragging grip handles
- **Delete Sections**: Remove unwanted sections with the trash icon
- **Global Toolbar**: Floating toolbar at bottom with Save, Undo, and Exit buttons
- **Visual Indicators**: Edited fields highlight in amber until saved, pencil icons appear on hover

### Editable Content Types
- Page titles and subtitles
- Section headings (h1-h6)
- Paragraphs and descriptive text
- Stat card values, labels, and notes
- Chart titles
- List items
- Navigation labels
- Callout boxes and alerts
- Sidebar client info (company name, date)

### Supabase Setup Required
Before edit mode works, you must run the database migrations in your Supabase project:
1. Go to your Supabase dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/full_setup.sql`
3. Copy the contents of `supabase/migrations/page_sections.sql`
4. Run the SQL to create tables and policies

### Key Editor Components
- `AuthContext.tsx` - Manages auth state, edit mode, and pending changes
- `PageEditorContext.tsx` - Manages page sections, navigation items
- `EditableText.tsx` - Click-to-edit wrapper for any text element (supports h1-h6, p, span, div)
- `EditableSection.tsx` - Section wrapper with drag/delete controls
- `AddSectionButton.tsx` - Button to add new content sections
- `AddNavButton.tsx` - Dialog to create new navigation tabs
- `GlobalEditToolbar.tsx` - Floating save/undo/exit toolbar
- `siteContent.ts` - Content cache and persistence layer

### Content Key Naming Convention
All editable content uses a unique `contentKey` for persistence:
- Format: `{page}-{element-type}` (e.g., `market-context-title`, `risks-para-1`)
- Stat cards: `stat-{metric}-{value|label|note}` (e.g., `stat-cpi-value`)
- List items: `{page}-{section}-{index}` (e.g., `risks-upper-1`)
- Charts: `chart-{chart-name}` (e.g., `chart-cpi-inflation-trend`)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Charts**: Recharts for data visualization
- **Fonts**: Plus Jakarta Sans (body) and Space Grotesk (display headings)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build**: esbuild for server bundling, Vite for client
- **Static Serving**: Express serves built client assets in production

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains database table definitions
- **Migrations**: Drizzle Kit manages migrations in `/migrations` directory
- **CMS Backend**: Supabase for content management (dashboard sections, page metadata, site content)

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # UI components (shadcn/ui in ui/)
│   ├── contexts/        # React contexts (AuthContext for edit mode)
│   ├── pages/           # Route page components
│   ├── lib/             # Utilities, data, API clients
│   └── hooks/           # Custom React hooks
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route definitions
│   └── storage.ts       # Data storage interface
├── shared/              # Shared code (schema, types)
├── supabase/migrations/ # Supabase SQL migrations
└── migrations/          # Drizzle database migrations
```

### Key Design Patterns
- **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared/
- **Component Architecture**: Page components in `/pages`, reusable UI in `/components`
- **Data Fetching**: Static data in `lib/data.ts`, CMS data via Supabase client
- **Export Features**: html-to-image for exporting charts as PNG images
- **Edit Mode**: Unified pending changes tracked in AuthContext, saved in bulk

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building

### Supabase CMS Tables
- `dashboard_sections` - Navigation cards with title, description, order
- `dashboard_page_meta` - Page headlines and intro text
- `site_content` - Generic key-value content storage for all pages
- `page_sections` - Custom sections per page with type, content, order
- `nav_items` - Custom navigation items with path, label, icon, order

### Key NPM Packages
- **UI**: @radix-ui/* primitives, lucide-react icons, recharts, class-variance-authority
- **Data**: @tanstack/react-query, drizzle-orm, @supabase/supabase-js
- **Utilities**: date-fns, zod for validation, html-to-image for exports
- **Drag & Drop**: @dnd-kit for dashboard card reordering

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required for database features)
- `VITE_SUPABASE_URL`: Supabase project URL (required for CMS)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (required for CMS)
