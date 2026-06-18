import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn('Supabase credentials not configured. CMS features will be disabled.');
}

export const supabase: SupabaseClient = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export const isSupabaseConfigured = isConfigured;

export interface DashboardSection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  route: string;
  status: 'draft' | 'published';
  sort_order: number;
  updated_at: string;
  updated_by: string | null;
}

export interface DashboardPageMeta {
  id: string;
  page_key: string;
  status: 'draft' | 'published';
  headline: string | null;
  subheadline: string | null;
  intro: string | null;
  updated_at: string;
  updated_by: string | null;
}

export async function getPublishedSections(): Promise<DashboardSection[]> {
  const { data, error } = await supabase
    .from('dashboard_sections')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching sections:', error);
    return [];
  }

  return data || [];
}

export async function getDraftSections(): Promise<DashboardSection[]> {
  const { data, error } = await supabase
    .from('dashboard_sections')
    .select('*')
    .eq('status', 'draft')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching draft sections:', error);
    return [];
  }

  return data || [];
}

export async function updateSection(id: string, updates: Partial<DashboardSection>): Promise<boolean> {
  const { error } = await supabase
    .from('dashboard_sections')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating section:', error);
    return false;
  }

  return true;
}

export async function getPublishedPageMeta(pageKey: string = 'home'): Promise<DashboardPageMeta | null> {
  const { data, error } = await supabase
    .from('dashboard_page_meta')
    .select('*')
    .eq('status', 'published')
    .eq('page_key', pageKey)
    .single();

  if (error) {
    console.error('Error fetching page meta:', error);
    return null;
  }

  return data;
}

export async function getDraftPageMeta(pageKey: string = 'home-draft'): Promise<DashboardPageMeta | null> {
  const { data, error } = await supabase
    .from('dashboard_page_meta')
    .select('*')
    .eq('status', 'draft')
    .eq('page_key', pageKey)
    .single();

  if (error) {
    console.error('Error fetching draft page meta:', error);
    return null;
  }

  return data;
}

export async function updatePageMeta(id: string, updates: Partial<DashboardPageMeta>): Promise<boolean> {
  const { error } = await supabase
    .from('dashboard_page_meta')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating page meta:', error);
    return false;
  }

  return true;
}

export async function publishDraftSections(): Promise<boolean> {
  const drafts = await getDraftSections();
  
  for (const draft of drafts) {
    const publishedSlug = draft.slug.replace('-draft', '');
    
    const { error } = await supabase
      .from('dashboard_sections')
      .update({
        title: draft.title,
        description: draft.description,
        icon: draft.icon,
        route: draft.route,
        sort_order: draft.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', publishedSlug)
      .eq('status', 'published');

    if (error) {
      console.error('Error publishing section:', error);
      return false;
    }
  }

  return true;
}
