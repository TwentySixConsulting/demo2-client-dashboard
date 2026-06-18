import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const availableIcons = [
  { value: 'FileText', label: 'Document' },
  { value: 'BarChart3', label: 'Chart' },
  { value: 'Users', label: 'Users' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Star', label: 'Star' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Mail', label: 'Mail' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Target', label: 'Target' },
];

interface AddNavButtonProps {
  onAddNav: (navItem: { path: string; label: string; icon: string }) => void;
  className?: string;
}

export function AddNavButton({ onAddNav, className }: AddNavButtonProps) {
  const { isEditMode } = useAuth();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('FileText');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isEditMode) {
    return null;
  }

  const handleSubmit = async () => {
    if (!label.trim()) return;
    
    setIsSubmitting(true);
    const slug = path || label.toLowerCase().replace(/\s+/g, '-');
    const normalizedPath = slug.startsWith('/custom/') ? slug : `/custom/${slug.replace(/^\//, '')}`;
    
    onAddNav({
      path: normalizedPath,
      label: label.trim(),
      icon,
    });
    
    setLabel('');
    setPath('');
    setIcon('FileText');
    setOpen(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-lg border-2 border-dashed border-sidebar-border/50 text-sidebar-foreground/50 hover:border-indigo-400 hover:text-indigo-400 transition-all duration-200',
            className
          )}
          data-testid="button-add-nav"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add New Tab</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Navigation Tab</DialogTitle>
          <DialogDescription>
            Create a new tab in the sidebar navigation. This will create a new page for your content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nav-label">Tab Label</Label>
            <Input
              id="nav-label"
              placeholder="e.g., Team Insights"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              data-testid="input-nav-label"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nav-path">URL Path (optional)</Label>
            <Input
              id="nav-path"
              placeholder="e.g., /team-insights"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              data-testid="input-nav-path"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate from label
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger data-testid="select-nav-icon">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((ic) => (
                  <SelectItem key={ic.value} value={ic.value}>
                    {ic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!label.trim() || isSubmitting}
            data-testid="button-create-nav"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Tab
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
