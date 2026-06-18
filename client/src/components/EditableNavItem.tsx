import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Pencil, Check, X, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableNavItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onLabelChange: (newLabel: string) => void;
  onDelete?: () => void;
  dragHandleProps?: any;
  onClick: () => void;
  className?: string;
}

export function EditableNavItem({
  id,
  label,
  icon,
  isActive,
  onLabelChange,
  onDelete,
  dragHandleProps,
  onClick,
  className,
}: EditableNavItemProps) {
  const { isEditMode, pendingChanges } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const [showControls, setShowControls] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleStartEdit(e: React.MouseEvent) {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(label);
  }

  function handleSave() {
    setIsEditing(false);
    if (editValue !== label && editValue.trim()) {
      onLabelChange(editValue.trim());
    }
  }

  function handleCancel() {
    setEditValue(label);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  }

  const hasChange = pendingChanges.has(`nav-label-${id}`);

  if (isEditing) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50',
        className
      )}>
        {isEditMode && dragHandleProps && (
          <div {...dragHandleProps} className="cursor-grab">
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 text-sm font-medium bg-white border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={handleSave}
          className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 bg-slate-400 text-white rounded hover:bg-slate-500"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group',
        isActive
          ? 'bg-sidebar-primary text-white'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        hasChange && 'ring-2 ring-amber-400',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isEditMode && dragHandleProps && (
        <div 
          {...dragHandleProps} 
          className={cn(
            'cursor-grab transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      
      <div className="w-4 h-4 shrink-0" onClick={onClick}>
        {icon}
      </div>
      
      <span 
        className="text-sm font-medium flex-1 leading-tight"
        onClick={isEditMode ? handleStartEdit : onClick}
      >
        {label}
      </span>
      
      {isEditMode && (
        <div className={cn(
          'flex items-center gap-1 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}>
          <button
            onClick={handleStartEdit}
            className="p-1 rounded hover:bg-white/10"
          >
            <Pencil className="w-3 h-3" />
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded hover:bg-red-500/20 text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
