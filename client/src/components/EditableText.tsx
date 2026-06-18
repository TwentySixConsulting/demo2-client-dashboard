import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getContent } from '@/lib/siteContent';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  contentKey: string;
  defaultValue: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  multiline?: boolean;
  page?: string;
}

export function EditableText({
  contentKey,
  defaultValue,
  className = '',
  as: Component = 'span',
  multiline = false,
  page,
}: EditableTextProps) {
  const { isEditMode, contentLoaded, trackChange, pendingChanges } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Get value from pending changes, cache, or default
  const pendingChange = pendingChanges.get(contentKey);
  const cachedValue = contentLoaded ? getContent(contentKey, defaultValue) : defaultValue;
  const currentValue = pendingChange?.value ?? cachedValue;
  
  const [editValue, setEditValue] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue, contentLoaded]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleStartEdit() {
    if (!isEditMode) return;
    setIsEditing(true);
    setEditValue(currentValue);
  }

  function handleSave() {
    setIsEditing(false);
    if (editValue !== currentValue) {
      trackChange(contentKey, editValue, page, 'content');
    }
  }

  function handleCancel() {
    setEditValue(currentValue);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  }

  // Show default when not in edit mode
  if (!isEditMode) {
    return <Component className={className}>{currentValue}</Component>;
  }

  // Show loading indicator while content is loading in edit mode
  if (isEditMode && !contentLoaded && !pendingChange) {
    return (
      <Component className={cn(className, 'opacity-50')}>
        {defaultValue}
        <Loader2 className="w-3 h-3 inline ml-1 animate-spin" />
      </Component>
    );
  }

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-2">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn(
              'border-2 border-indigo-500 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[200px]',
              className
            )}
            rows={3}
            data-testid={`edit-${contentKey}`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn(
              'border-2 border-indigo-500 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300',
              className
            )}
            style={{ width: `${Math.max(editValue.length * 10, 100)}px` }}
            data-testid={`edit-${contentKey}`}
          />
        )}
        <button
          onClick={handleSave}
          className="p-1 bg-green-500 text-white rounded hover:bg-green-600 shrink-0"
          data-testid={`save-${contentKey}`}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 bg-slate-400 text-white rounded hover:bg-slate-500 shrink-0"
          data-testid={`cancel-${contentKey}`}
        >
          <X className="w-4 h-4" />
        </button>
      </span>
    );
  }

  const hasChange = pendingChanges.has(contentKey);

  return (
    <Component
      className={cn(
        className,
        'cursor-pointer hover:bg-indigo-50 hover:outline hover:outline-2 hover:outline-indigo-300 hover:outline-dashed rounded transition-all relative group',
        hasChange && 'bg-amber-50 outline outline-2 outline-amber-300'
      )}
      onClick={handleStartEdit}
      data-testid={`editable-${contentKey}`}
    >
      {currentValue}
      <Pencil className="w-3 h-3 text-indigo-400 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Component>
  );
}
