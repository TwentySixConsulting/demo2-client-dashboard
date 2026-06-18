import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Save, Undo2, X, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface EditModeToolbarProps {
  hasChanges: boolean;
  onSave: () => Promise<void>;
  onUndo: () => void;
  saving?: boolean;
}

export function EditModeToolbar({ hasChanges, onSave, onUndo, saving = false }: EditModeToolbarProps) {
  const { user, setEditMode, signOut } = useAuth();
  const [showSaved, setShowSaved] = useState(false);

  async function handleSave() {
    await onSave();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }

  function handleExit() {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Exit anyway?')) {
        setEditMode(false);
      }
    } else {
      setEditMode(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Edit Mode</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-slate-800"
            onClick={onUndo}
            disabled={!hasChanges || saving}
            data-testid="button-undo"
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
          
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            data-testid="button-save-changes"
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
        
        <div className="pl-4 border-l border-slate-700 text-xs text-slate-400">
          {user?.email}
        </div>
      </div>
    </div>
  );
}
