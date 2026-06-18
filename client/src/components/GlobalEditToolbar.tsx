import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePageEditor } from '@/contexts/PageEditorContext';
import { Button } from '@/components/ui/button';
import { Save, Undo2, X, Check, Loader2, LogOut } from 'lucide-react';

export function GlobalEditToolbar() {
  const { user, isEditMode, hasUnsavedChanges, setEditMode, saveAllChanges, undoAllChanges, signOut } = useAuth();
  const { savePageEdits } = usePageEditor();
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  if (!isEditMode || !user) return null;

  async function handleSave() {
    setSaving(true);
    const contentSuccess = await saveAllChanges();
    const pageSuccess = await savePageEdits();
    setSaving(false);
    if (contentSuccess || pageSuccess) {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  }

  function handleExit() {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Exit anyway?')) {
        setEditMode(false);
      }
    } else {
      setEditMode(false);
    }
  }

  async function handleLogout() {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Log out anyway?')) {
        return;
      }
    }
    await signOut();
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Edit Mode</span>
          {hasUnsavedChanges && (
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
              Unsaved
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-slate-800"
            onClick={undoAllChanges}
            disabled={!hasUnsavedChanges || saving}
            data-testid="button-undo-all"
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
          
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            data-testid="button-save-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : showSaved ? (
              <Check className="w-4 h-4 mr-1" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            {showSaved ? 'Saved!' : 'Save Changes'}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-slate-800"
            onClick={handleExit}
            data-testid="button-exit-edit"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="pl-4 border-l border-slate-700 flex items-center gap-2">
          <span className="text-xs text-slate-400">{user.email}</span>
          <button
            onClick={handleLogout}
            className="p-1 hover:bg-slate-800 rounded"
            title="Log out"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
