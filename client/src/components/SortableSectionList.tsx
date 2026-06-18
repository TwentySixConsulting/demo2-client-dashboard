import { ReactNode, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { EditableSection } from './EditableSection';

interface SortableItemProps {
  id: string;
  children: ReactNode;
  onDelete?: () => void;
  title?: string;
  isVisible?: boolean;
}

function SortableItem({ id, children, onDelete, title, isVisible }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EditableSection
        id={id}
        onDelete={onDelete}
        title={title}
        isVisible={isVisible}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        {children}
      </EditableSection>
    </div>
  );
}

interface SortableSectionListProps {
  items: { id: string; content: ReactNode; title?: string; visible?: boolean; onDelete?: () => void }[];
  onReorder: (newOrder: string[]) => void;
}

export function SortableSectionList({ items, onReorder }: SortableSectionListProps) {
  const { isEditMode } = useAuth();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const newOrder = arrayMove(items.map(i => i.id), oldIndex, newIndex);
      onReorder(newOrder);
    }
  }, [items, onReorder]);

  if (!isEditMode) {
    return (
      <>
        {items.map(item => (
          <div key={item.id}>{item.content}</div>
        ))}
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map(item => (
          <SortableItem
            key={item.id}
            id={item.id}
            onDelete={item.onDelete}
            title={item.title}
            isVisible={item.visible}
          >
            {item.content}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
