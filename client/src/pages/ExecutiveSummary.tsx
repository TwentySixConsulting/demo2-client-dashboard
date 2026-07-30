import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { companyInfo } from "@/lib/data";
import { getPublishedSections, getPublishedMeta, getDraftSections, getDraftMeta, updateDraftSection, updateSectionOrder, publishDrafts, clearCache, DashboardSection, DashboardPageMeta, DEFAULT_SECTIONS, DEFAULT_PAGE_META } from "@/lib/dashboardData";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@/assets/zigbert-logo.png";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  Users,
  AlertTriangle,
  TrendingUp,
  Building2,
  Percent,
  Gift,
  Lightbulb,
  ArrowRight,
  Database,
  ChevronRight,
  MapPin,
  Calendar,
  HelpCircle,
  Home,
  LineChart,
  LucideIcon,
  GripVertical,
  Pencil,
  Check,
  X,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  trendingUp: TrendingUp,
  barChart: BarChart3,
  users: Users,
  alertTriangle: AlertTriangle,
  lineChart: LineChart,
  percent: Percent,
  gift: Gift,
  lightbulb: Lightbulb,
  arrowRight: ArrowRight,
  database: Database,
};

const colorMap: Record<string, string> = {
  'market-context': 'bg-emerald-600',
  'market-data': 'bg-blue-600',
  'role-details': 'bg-purple-600',
  'risks': 'bg-amber-500',
  'market-comparison': 'bg-clay-600',
  'bonus': 'bg-pink-600',
  'benefits': 'bg-teal-600',
  'benefits-trends': 'bg-orange-500',
  'next-steps': 'bg-cyan-600',
  'data-sources': 'bg-slate-600',
};

interface EditableCardProps {
  section: DashboardSection;
  isEditMode: boolean;
  onUpdate: (id: string, field: keyof DashboardSection, value: string) => void;
}

function EditableCard({ section, isEditMode, onUpdate }: EditableCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [editDescription, setEditDescription] = useState(section.description || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = iconMap[section.icon || 'barChart'] || BarChart3;
  const bgColor = colorMap[section.slug] || 'bg-slate-600';

  useEffect(() => {
    setEditTitle(section.title);
    setEditDescription(section.description || '');
  }, [section]);

  function handleSaveEdit() {
    onUpdate(section.id, 'title', editTitle);
    onUpdate(section.id, 'description', editDescription);
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setEditTitle(section.title);
    setEditDescription(section.description || '');
    setIsEditing(false);
  }

  if (isEditMode && isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <Card className="p-5 bg-white border-2 border-clay-500 shadow-lg">
          <div className="space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-semibold"
              placeholder="Section title"
              autoFocus
              data-testid={`edit-title-${section.slug}`}
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              placeholder="Section description"
              data-testid={`edit-description-${section.slug}`}
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSaveEdit} 
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                data-testid={`save-edit-${section.slug}`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={handleCancelEdit}
                className="p-2 bg-slate-400 text-white rounded hover:bg-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const cardContent = (
    <Card
      className={`p-5 bg-white border-0 transition-all duration-300 ${
        isEditMode
          ? 'ring-2 ring-dashed ring-clay-300 hover:ring-clay-500 cursor-move shadow-md'
          : 'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_40px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_30px_60px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-1 cursor-pointer group'
      }`}
      data-testid={`launcher-${section.slug}`}
    >
      <div className="flex items-start gap-4">
        {isEditMode && (
          <div
            className="mt-1 p-1.5 hover:bg-slate-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0 shadow-lg`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold text-slate-800 ${!isEditMode ? 'group-hover:text-accent' : ''} transition-colors`}>
              {section.title}
            </h3>
            {isEditMode ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                data-testid={`edit-btn-${section.slug}`}
              >
                <Pencil className="w-4 h-4 text-clay-500" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{section.description}</p>
        </div>
      </div>
    </Card>
  );

  if (isEditMode) {
    return (
      <div ref={setNodeRef} style={style}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={section.route}>
      {cardContent}
    </Link>
  );
}

export function ExecutiveSummary() {
  const { user, isEditMode, trackChange, hasUnsavedChanges } = useAuth();
  const [sections, setSections] = useState<DashboardSection[]>([]);
  const [originalSections, setOriginalSections] = useState<DashboardSection[]>([]);
  const [pageMeta, setPageMeta] = useState<DashboardPageMeta>(DEFAULT_PAGE_META);
  const [loading, setLoading] = useState(true);
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [editingSubheadline, setEditingSubheadline] = useState(false);
  const [headlineValue, setHeadlineValue] = useState('');
  const [subheadlineValue, setSubheadlineValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadData();
  }, [isEditMode, user]);

  useEffect(() => {
    setHeadlineValue(pageMeta.headline || 'Use Your Dashboard');
    setSubheadlineValue(pageMeta.subheadline || 'How to interpret pay ranges');
  }, [pageMeta]);

  async function loadData() {
    setLoading(true);
    try {
      if (isEditMode && user) {
        const [sectionsData, metaData] = await Promise.all([
          getDraftSections(),
          getDraftMeta()
        ]);
        const filteredSections = sectionsData.filter(s => !s.slug.includes('dashboard-draft') && s.slug !== 'dashboard');
        setSections(filteredSections);
        setOriginalSections(JSON.parse(JSON.stringify(filteredSections)));
        if (metaData) {
          setPageMeta(metaData);
        }
      } else {
        const [sectionsData, metaData] = await Promise.all([
          getPublishedSections(),
          getPublishedMeta()
        ]);
        setSections(sectionsData);
        setOriginalSections(JSON.parse(JSON.stringify(sectionsData)));
        setPageMeta(metaData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setSections(DEFAULT_SECTIONS.filter(s => s.slug !== 'dashboard'));
      setPageMeta(DEFAULT_PAGE_META);
    } finally {
      setLoading(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      
      const orderUpdates = newSections.map((s, index) => ({
        id: s.id,
        sort_order: index + 1,
      }));
      updateSectionOrder(orderUpdates);
      trackChange('sections_order', JSON.stringify(orderUpdates), 'dashboard', 'order');
    }
  }

  function updateSection(id: string, field: keyof DashboardSection, value: string) {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
    
    const section = sections.find(s => s.id === id);
    if (section) {
      updateDraftSection(id, { [field]: value });
      trackChange(`section_${id}_${field}`, value, 'dashboard', 'section');
    }
  }

  function handleHeadlineSave() {
    setEditingHeadline(false);
    if (headlineValue !== pageMeta.headline) {
      setPageMeta({ ...pageMeta, headline: headlineValue });
      trackChange('dashboard_headline', headlineValue, 'dashboard', 'meta');
    }
  }

  function handleSubheadlineSave() {
    setEditingSubheadline(false);
    if (subheadlineValue !== pageMeta.subheadline) {
      setPageMeta({ ...pageMeta, subheadline: subheadlineValue });
      trackChange('dashboard_subheadline', subheadlineValue, 'dashboard', 'meta');
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">
            Personalised Pay & Benefits Dashboard
          </p>
          {isEditMode && editingHeadline ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                value={headlineValue}
                onChange={(e) => setHeadlineValue(e.target.value)}
                onBlur={handleHeadlineSave}
                onKeyDown={(e) => e.key === 'Enter' && handleHeadlineSave()}
                className="text-4xl lg:text-5xl font-display font-bold border-2 border-clay-500 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-clay-300"
                autoFocus
                data-testid="input-edit-headline"
              />
              <button onClick={handleHeadlineSave} className="p-2 bg-green-500 text-white rounded">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <h1
              className={`text-4xl lg:text-5xl font-display font-bold text-primary mb-3 ${isEditMode ? 'cursor-pointer hover:bg-clay-50 hover:outline hover:outline-2 hover:outline-dashed hover:outline-clay-300 rounded px-2 -mx-2 transition-all' : ''}`}
              onClick={() => isEditMode && setEditingHeadline(true)}
              data-testid="dashboard-headline"
            >
              {headlineValue}
              {isEditMode && <Pencil className="inline w-5 h-5 ml-2 text-clay-400 opacity-50" />}
            </h1>
          )}
          {isEditMode && editingSubheadline ? (
            <div className="flex items-center gap-2">
              <input
                value={subheadlineValue}
                onChange={(e) => setSubheadlineValue(e.target.value)}
                onBlur={handleSubheadlineSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSubheadlineSave()}
                className="border-2 border-clay-500 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-clay-300"
                autoFocus
                data-testid="input-edit-subheadline"
              />
              <button onClick={handleSubheadlineSave} className="p-1 bg-green-500 text-white rounded">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="#pay-ranges">
              <span
                className={`inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors cursor-pointer ${isEditMode ? 'hover:bg-clay-50 hover:outline hover:outline-2 hover:outline-dashed hover:outline-clay-300 rounded px-1' : ''}`}
                onClick={(e) => {
                  if (isEditMode) {
                    e.preventDefault();
                    setEditingSubheadline(true);
                  }
                }}
                data-testid="dashboard-subheadline"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{subheadlineValue}</span>
                {isEditMode && <Pencil className="w-3 h-3 text-clay-400 opacity-50" />}
              </span>
            </Link>
          )}
        </div>
        <img
          src={logoImage}
          alt="Zigbert"
          className="h-14 w-auto hidden lg:block"
          style={{ opacity: 1 }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Organisation</p>
            <p className="font-semibold text-lg">{companyInfo.name}</p>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-accent to-cyan-600 border-0 shadow-xl flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Sector & Location</p>
            <p className="font-semibold text-lg">{companyInfo.industry}, {companyInfo.location}</p>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-xl flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Report Date</p>
            <p className="font-semibold text-lg">{companyInfo.reportDate}</p>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">What do you want to explore?</h2>
        <p className="text-muted-foreground mb-8">Select a section to dive into your personalised pay and benefits insights.</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-5 bg-white border border-slate-200 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : isEditMode ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => (
                  <EditableCard
                    key={section.id}
                    section={section}
                    isEditMode={isEditMode}
                    onUpdate={updateSection}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section) => (
              <EditableCard
                key={section.id}
                section={section}
                isEditMode={false}
                onUpdate={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      <Card id="pay-ranges" className="p-6 bg-slate-50 border border-slate-200">
        <h3 className="font-display font-bold text-xl text-slate-800 mb-4">How to Interpret Pay Ranges</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
            <p className="font-semibold mb-1 text-amber-600">Lower Quartile</p>
            <p className="text-xs text-muted-foreground">25% of the market pays below this level</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
            <p className="font-semibold mb-1 text-yellow-600">Lower-Mid</p>
            <p className="text-xs text-muted-foreground">Between lower quartile and median</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
            <p className="font-semibold mb-1 text-green-600">Median</p>
            <p className="text-xs text-muted-foreground">The middle point - 50% pay more, 50% pay less</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
            <p className="font-semibold mb-1 text-teal-600">Upper-Mid</p>
            <p className="text-xs text-muted-foreground">Between median and upper quartile</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
            <p className="font-semibold mb-1 text-blue-600">Upper Quartile</p>
            <p className="text-xs text-muted-foreground">Only 25% of the market pays more</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
