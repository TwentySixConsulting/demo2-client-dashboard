# Supabase Setup Guide

This document explains how to set up Supabase for the TwentySix Dashboard CMS functionality.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization and give your project a name
4. Set a secure database password (save this!)
5. Choose a region close to your users
6. Click "Create new project"

## 2. Run the SQL Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001_dashboard_tables.sql`
3. Click "Run" to execute
4. Then copy and paste `supabase/migrations/002_seed_data.sql`
5. Click "Run" to seed the initial data

## 3. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (safe to use in browser)
   - **service_role key** (keep secret, only for server-side)

## 4. Configure Environment Variables

Add these to your Replit Secrets (or .env file):

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Where to add in Replit:
1. Click the **Secrets** tab (lock icon) in the left sidebar
2. Add each key-value pair:
   - Key: `SUPABASE_URL`, Value: your project URL
   - Key: `SUPABASE_ANON_KEY`, Value: your anon key
   - Key: `SUPABASE_SERVICE_ROLE_KEY`, Value: your service role key

## 5. Authentication Setup (Optional)

For edit mode to work with RLS policies, you need authenticated users:

1. In Supabase, go to **Authentication** > **Providers**
2. Enable your preferred auth method:
   - **Email** (simplest): Users sign up with email/password
   - **Magic Link**: Passwordless email links
   - **Google/GitHub**: OAuth providers

3. For email auth, you may want to disable email confirmation for testing:
   - Go to **Authentication** > **Settings**
   - Under "Email Auth", toggle off "Enable email confirmations"

## 6. RLS Policy Summary

The migrations create these Row Level Security policies:

### dashboard_sections
| Operation | Public (anon) | Authenticated |
|-----------|--------------|---------------|
| SELECT | Only `status = 'published'` | All rows |
| INSERT | ❌ | ✅ |
| UPDATE | ❌ | ✅ |
| DELETE | ❌ | Only `status = 'draft'` |

### dashboard_page_meta
| Operation | Public (anon) | Authenticated |
|-----------|--------------|---------------|
| SELECT | Only `status = 'published'` | All rows |
| INSERT | ❌ | ✅ |
| UPDATE | ❌ | ✅ |
| DELETE | ❌ | Only `status = 'draft'` |

## 7. Testing

After setup, you can test in the Supabase dashboard:

1. Go to **Table Editor**
2. You should see `dashboard_sections` and `dashboard_page_meta` tables
3. Verify the seed data is present (11 published sections, 11 draft sections)

## 8. Troubleshooting

### "permission denied for table"
- Make sure RLS is enabled and policies are created
- Check that you're using the correct API key

### "relation does not exist"
- Run the migrations in order (001 before 002)
- Check the SQL Editor for any errors

### Can't see draft content
- You need to be authenticated to see draft rows
- Use the service_role key for server-side access to all rows
