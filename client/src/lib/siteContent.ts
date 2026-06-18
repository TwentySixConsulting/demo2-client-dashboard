import { supabase, isSupabaseConfigured } from './supabase';

export interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  page: string | null;
  updated_at: string;
  updated_by: string | null;
}

const contentCache: Map<string, string> = new Map();
let cacheLoaded = false;

export async function loadAllContent(): Promise<Map<string, string>> {
  if (!isSupabaseConfigured) {
    return new Map();
  }

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('content_key, content_value');

    if (error) {
      console.error('Error loading site content:', error);
      return contentCache;
    }

    if (data) {
      data.forEach((item: { content_key: string; content_value: string }) => {
        contentCache.set(item.content_key, item.content_value);
      });
      cacheLoaded = true;
    }

    return contentCache;
  } catch (err) {
    console.error('Failed to load site content:', err);
    return contentCache;
  }
}

export function getContent(key: string, defaultValue: string): string {
  return contentCache.get(key) || defaultValue;
}

export async function saveContent(key: string, value: string, page?: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const { data: existing } = await supabase
      .from('site_content')
      .select('id')
      .eq('content_key', key)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('site_content')
        .update({ 
          content_value: value, 
          updated_at: new Date().toISOString() 
        })
        .eq('content_key', key);

      if (error) {
        console.error('Error updating content:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('site_content')
        .insert({
          content_key: key,
          content_value: value,
          page: page || null,
        });

      if (error) {
        console.error('Error inserting content:', error);
        return false;
      }
    }

    contentCache.set(key, value);
    return true;
  } catch (err) {
    console.error('Failed to save content:', err);
    return false;
  }
}

export async function saveBulkContent(changes: { key: string; value: string; page?: string }[]): Promise<boolean> {
  if (!isSupabaseConfigured || changes.length === 0) {
    return false;
  }

  try {
    for (const change of changes) {
      const success = await saveContent(change.key, change.value, change.page);
      if (!success) return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save bulk content:', err);
    return false;
  }
}

export function isCacheLoaded(): boolean {
  return cacheLoaded;
}

export function clearContentCache(): void {
  contentCache.clear();
  cacheLoaded = false;
}
