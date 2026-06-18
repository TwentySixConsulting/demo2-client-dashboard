import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface PageSection {
  id: string;
  type: 'card' | 'chart' | 'table' | 'text' | 'stat' | 'custom';
  title: string;
  content: Record<string, any>;
  order: number;
  visible: boolean;
}

export interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: string;
  order: number;
  visible: boolean;
}

interface PageEditorContextType {
  sections: Map<string, PageSection[]>;
  navItems: NavItem[];
  addSection: (page: string, section: Omit<PageSection, 'id' | 'order'>) => void;
  updateSection: (page: string, sectionId: string, updates: Partial<PageSection>) => void;
  deleteSection: (page: string, sectionId: string) => void;
  reorderSections: (page: string, newOrder: string[]) => void;
  addNavItem: (item: Omit<NavItem, 'id' | 'order'>) => void;
  updateNavItem: (id: string, updates: Partial<NavItem>) => void;
  deleteNavItem: (id: string) => void;
  reorderNavItems: (newOrder: string[]) => void;
  getSectionsForPage: (page: string) => PageSection[];
  savePageEdits: () => Promise<boolean>;
  loadPageSections: (page: string) => Promise<void>;
}

const PageEditorContext = createContext<PageEditorContextType | undefined>(undefined);

export function PageEditorProvider({ children }: { children: ReactNode }) {
  const { isEditMode, trackChange } = useAuth();
  const [sections, setSections] = useState<Map<string, PageSection[]>>(new Map());
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [pendingSectionChanges, setPendingSectionChanges] = useState<Set<string>>(new Set());

  const loadPageSections = useCallback(async (page: string) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page', page)
        .order('order');

      if (error) {
        console.error('Error loading page sections:', error);
        return;
      }

      if (data) {
        setSections(prev => {
          const next = new Map(prev);
          next.set(page, data.map(item => ({
            id: item.id,
            type: item.section_type,
            title: item.title,
            content: item.content || {},
            order: item.order,
            visible: item.visible ?? true,
          })));
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to load page sections:', err);
    }
  }, []);

  const loadNavItems = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .order('order');

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading nav items:', error);
        return;
      }

      if (data && data.length > 0) {
        setNavItems(data.map(item => ({
          id: item.id,
          path: item.path,
          label: item.label,
          icon: item.icon,
          order: item.order,
          visible: item.visible ?? true,
        })));
      }
    } catch (err) {
      console.error('Failed to load nav items:', err);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) {
      loadNavItems();
    }
  }, [isEditMode, loadNavItems]);

  const generateId = () => `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addSection = useCallback((page: string, section: Omit<PageSection, 'id' | 'order'>) => {
    setSections(prev => {
      const next = new Map(prev);
      const pageSections = next.get(page) || [];
      const newSection: PageSection = {
        ...section,
        id: generateId(),
        order: pageSections.length,
      };
      next.set(page, [...pageSections, newSection]);
      return next;
    });
    setPendingSectionChanges(prev => new Set(prev).add(page));
    trackChange(`page-sections-${page}`, 'modified', page, 'section');
  }, [trackChange]);

  const updateSection = useCallback((page: string, sectionId: string, updates: Partial<PageSection>) => {
    setSections(prev => {
      const next = new Map(prev);
      const pageSections = next.get(page) || [];
      next.set(page, pageSections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      ));
      return next;
    });
    setPendingSectionChanges(prev => new Set(prev).add(page));
    trackChange(`section-${sectionId}`, JSON.stringify(updates), page, 'section');
  }, [trackChange]);

  const deleteSection = useCallback((page: string, sectionId: string) => {
    setSections(prev => {
      const next = new Map(prev);
      const pageSections = next.get(page) || [];
      next.set(page, pageSections.filter(s => s.id !== sectionId));
      return next;
    });
    setPendingSectionChanges(prev => new Set(prev).add(page));
    trackChange(`delete-section-${sectionId}`, 'deleted', page, 'section');
  }, [trackChange]);

  const reorderSections = useCallback((page: string, newOrder: string[]) => {
    setSections(prev => {
      const next = new Map(prev);
      const pageSections = next.get(page) || [];
      const reordered = newOrder.map((id, idx) => {
        const section = pageSections.find(s => s.id === id);
        return section ? { ...section, order: idx } : null;
      }).filter(Boolean) as PageSection[];
      next.set(page, reordered);
      return next;
    });
    setPendingSectionChanges(prev => new Set(prev).add(page));
    trackChange(`page-order-${page}`, newOrder.join(','), page, 'order');
  }, [trackChange]);

  const addNavItem = useCallback((item: Omit<NavItem, 'id' | 'order'>) => {
    const newItem: NavItem = {
      ...item,
      id: `nav-${Date.now()}`,
      order: navItems.length,
    };
    setNavItems(prev => [...prev, newItem]);
    trackChange('nav-items', 'modified', 'layout', 'section');
  }, [navItems.length, trackChange]);

  const updateNavItem = useCallback((id: string, updates: Partial<NavItem>) => {
    setNavItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    trackChange(`nav-item-${id}`, JSON.stringify(updates), 'layout', 'section');
  }, [trackChange]);

  const deleteNavItem = useCallback((id: string) => {
    setNavItems(prev => prev.filter(item => item.id !== id));
    trackChange(`delete-nav-${id}`, 'deleted', 'layout', 'section');
  }, [trackChange]);

  const reorderNavItems = useCallback((newOrder: string[]) => {
    setNavItems(prev => {
      return newOrder.map((id, idx) => {
        const item = prev.find(n => n.id === id);
        return item ? { ...item, order: idx } : null;
      }).filter(Boolean) as NavItem[];
    });
    trackChange('nav-order', newOrder.join(','), 'layout', 'order');
  }, [trackChange]);

  const getSectionsForPage = useCallback((page: string) => {
    return sections.get(page) || [];
  }, [sections]);

  const savePageEdits = useCallback(async () => {
    if (!isSupabaseConfigured) return false;

    try {
      const pagesToSave = Array.from(pendingSectionChanges);
      for (const page of pagesToSave) {
        const pageSections = sections.get(page) || [];
        
        await supabase.from('page_sections').delete().eq('page', page);
        
        if (pageSections.length > 0) {
          const { error } = await supabase.from('page_sections').insert(
            pageSections.map(s => ({
              id: s.id,
              page,
              section_type: s.type,
              title: s.title,
              content: s.content,
              order: s.order,
              visible: s.visible,
            }))
          );
          
          if (error) {
            console.error('Error saving sections:', error);
            return false;
          }
        }
      }

      if (navItems.length > 0) {
        await supabase.from('nav_items').delete().neq('id', '');
        
        const { error } = await supabase.from('nav_items').insert(
          navItems.map(n => ({
            id: n.id,
            path: n.path,
            label: n.label,
            icon: n.icon,
            order: n.order,
            visible: n.visible,
          }))
        );
        
        if (error) {
          console.error('Error saving nav items:', error);
          return false;
        }
      }

      setPendingSectionChanges(new Set());
      return true;
    } catch (err) {
      console.error('Failed to save page edits:', err);
      return false;
    }
  }, [sections, navItems, pendingSectionChanges]);

  return (
    <PageEditorContext.Provider value={{
      sections,
      navItems,
      addSection,
      updateSection,
      deleteSection,
      reorderSections,
      addNavItem,
      updateNavItem,
      deleteNavItem,
      reorderNavItems,
      getSectionsForPage,
      savePageEdits,
      loadPageSections,
    }}>
      {children}
    </PageEditorContext.Provider>
  );
}

export function usePageEditor() {
  const context = useContext(PageEditorContext);
  if (context === undefined) {
    throw new Error('usePageEditor must be used within a PageEditorProvider');
  }
  return context;
}
