import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { EditableText } from "@/components/EditableText";
import { AddSectionButton, SectionType } from "@/components/AddSectionButton";
import { SortableSectionList } from "@/components/SortableSectionList";
import { usePageEditor, PageSection } from "@/contexts/PageEditorContext";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@/assets/zigbert-logo.png";

interface CustomPageProps {
  pageId: string;
  defaultTitle?: string;
}

export function CustomPage({ pageId, defaultTitle = "Custom Page" }: CustomPageProps) {
  const { isEditMode } = useAuth();
  const { getSectionsForPage, addSection, deleteSection, reorderSections, loadPageSections } = usePageEditor();
  
  useEffect(() => {
    loadPageSections(pageId);
  }, [pageId, loadPageSections]);

  const sections = getSectionsForPage(pageId);

  const handleAddSection = (type: SectionType) => {
    addSection(pageId, {
      type,
      title: `New ${type} section`,
      content: {},
      visible: true,
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteSection(pageId, sectionId);
  };

  const handleReorder = (newOrder: string[]) => {
    reorderSections(pageId, newOrder);
  };

  const renderSectionContent = (section: PageSection) => (
    <Card className="p-6 bg-white border-0 shadow-md">
      <EditableText
        contentKey={`${pageId}-section-${section.id}-title`}
        defaultValue={section.title}
        className="font-display font-bold text-xl mb-4"
        as="h3"
        page={pageId}
      />
      {section.type === 'text' && (
        <EditableText
          contentKey={`${pageId}-section-${section.id}-content`}
          defaultValue="Click to edit this text content..."
          className="text-slate-600"
          as="p"
          page={pageId}
          multiline
        />
      )}
      {section.type === 'stat' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <EditableText
              contentKey={`${pageId}-section-${section.id}-value`}
              defaultValue="0"
              className="text-3xl font-bold text-primary"
              as="p"
              page={pageId}
            />
            <EditableText
              contentKey={`${pageId}-section-${section.id}-label`}
              defaultValue="Metric Label"
              className="text-sm text-muted-foreground"
              as="p"
              page={pageId}
            />
          </div>
        </div>
      )}
      {(section.type === 'card' || section.type === 'custom') && (
        <EditableText
          contentKey={`${pageId}-section-${section.id}-body`}
          defaultValue="Add your card content here..."
          className="text-slate-600"
          as="p"
          page={pageId}
          multiline
        />
      )}
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey={`${pageId}-subtitle`}
            defaultValue="Custom Content"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page={pageId}
          />
          <EditableText
            contentKey={`${pageId}-title`}
            defaultValue={defaultTitle}
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page={pageId}
          />
          <EditableText
            contentKey={`${pageId}-intro`}
            defaultValue="Add your custom content here using the section tools below."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page={pageId}
            multiline
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" />
      </div>

      {sections.length === 0 && isEditMode && (
        <Card className="p-8 bg-white border-2 border-dashed border-slate-200 text-center">
          <p className="text-muted-foreground mb-4">
            This page is empty. Click the button below to add your first section.
          </p>
          <AddSectionButton onAddSection={handleAddSection} position="inline" />
        </Card>
      )}

      <div className="space-y-6">
        <SortableSectionList
          items={sections.map(section => ({
            id: section.id,
            title: section.title,
            visible: section.visible,
            onDelete: () => handleDeleteSection(section.id),
            content: renderSectionContent(section),
          }))}
          onReorder={handleReorder}
        />
      </div>

      {isEditMode && (
        <AddSectionButton onAddSection={handleAddSection} />
      )}
    </div>
  );
}
