import { useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GripVertical, Trash2, Settings, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EditableSectionProps {
  id: string;
  children: ReactNode;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
  className?: string;
  title?: string;
}

export function EditableSection({
  id,
  children,
  onDelete,
  onToggleVisibility,
  isVisible = true,
  isDragging = false,
  dragHandleProps,
  className,
  title = 'this section',
}: EditableSectionProps) {
  const { isEditMode } = useAuth();
  const [showControls, setShowControls] = useState(false);

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        'relative group/section transition-all duration-200',
        isDragging && 'opacity-50 scale-[1.02] shadow-2xl z-50',
        !isVisible && 'opacity-40',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      data-testid={`section-${id}`}
    >
      <div
        className={cn(
          'absolute -left-10 top-0 bottom-0 flex flex-col items-center justify-start pt-2 gap-1 transition-opacity duration-200',
          showControls || isDragging ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div
          {...dragHandleProps}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>

        {onToggleVisibility && (
          <button
            onClick={onToggleVisibility}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isVisible 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-500' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-600'
            )}
            title={isVisible ? 'Hide section' : 'Show section'}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}

        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                title="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Section</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {title}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div
        className={cn(
          'rounded-lg transition-all duration-200',
          showControls && 'ring-2 ring-indigo-300 ring-offset-2'
        )}
      >
        {children}
      </div>
    </div>
  );
}
