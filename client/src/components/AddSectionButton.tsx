import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Type, BarChart3, Table, CreditCard, Hash, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export type SectionType = 'card' | 'chart' | 'table' | 'text' | 'stat' | 'custom';

interface SectionTypeOption {
  type: SectionType;
  label: string;
  description: string;
  icon: typeof Plus;
}

const sectionTypes: SectionTypeOption[] = [
  { type: 'card', label: 'Info Card', description: 'A content card with title and text', icon: CreditCard },
  { type: 'stat', label: 'Stat Card', description: 'A card showing a key metric', icon: Hash },
  { type: 'text', label: 'Text Block', description: 'A rich text paragraph section', icon: Type },
  { type: 'chart', label: 'Chart', description: 'A data visualization chart', icon: BarChart3 },
  { type: 'table', label: 'Table', description: 'A data table section', icon: Table },
  { type: 'custom', label: 'Custom Block', description: 'A flexible custom section', icon: FileText },
];

interface AddSectionButtonProps {
  onAddSection: (type: SectionType, initialData?: Record<string, any>) => void;
  position?: 'top' | 'bottom' | 'inline';
  className?: string;
}

export function AddSectionButton({ 
  onAddSection, 
  position = 'bottom',
  className 
}: AddSectionButtonProps) {
  const { isEditMode } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  if (!isEditMode) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative py-4 flex items-center justify-center transition-all duration-200',
        position === 'inline' && 'py-2',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          'absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-30'
        )} 
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'relative z-10 flex items-center gap-2 px-4 py-2 rounded-full border-2 border-dashed transition-all duration-200',
              isHovered 
                ? 'bg-indigo-50 border-indigo-400 text-indigo-600 shadow-md' 
                : 'bg-white border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-500'
            )}
            data-testid="button-add-section"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Section</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="center">
          <DropdownMenuLabel>Choose Section Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sectionTypes.map((option) => (
            <DropdownMenuItem
              key={option.type}
              onClick={() => onAddSection(option.type)}
              className="flex items-start gap-3 py-3 cursor-pointer"
            >
              <option.icon className="w-5 h-5 text-indigo-500 mt-0.5" />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
