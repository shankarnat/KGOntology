import { useState } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  Clock,
  Star,
  Grid3X3,
} from 'lucide-react';
import clsx from 'clsx';
import { Modal, ModalFooter, Badge } from '@/components/common';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import type { DiscoverSection } from '@/types';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sectionTypeIcons: Record<string, React.ReactNode> = {
  recently_viewed: <Clock className="w-4 h-4" />,
  favorites: <Star className="w-4 h-4" />,
  favorite_templates: <Grid3X3 className="w-4 h-4" />,
  prominent: <Star className="w-4 h-4" />,
  template: <Grid3X3 className="w-4 h-4" />,
};

const sectionTypeLabels: Record<string, string> = {
  recently_viewed: 'Recently viewed object types',
  favorites: 'Favorite object types',
  favorite_templates: 'Favorite templates',
  prominent: 'Prominent object types',
  template: 'Template',
};

export function CustomizeModal({ isOpen, onClose }: CustomizeModalProps) {
  const { config, updateDiscoverSections, templates } = useOntologyStore();
  const [sections, setSections] = useState<DiscoverSection[]>(
    config.discoverSections
  );
  const [itemsPerSection, setItemsPerSection] = useState(
    config.defaultItemsPerSection
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const handleSave = () => {
    updateDiscoverSections(sections);
    onClose();
  };

  const handleAddSection = (type: DiscoverSection['type'], templateId?: string) => {
    const newSection: DiscoverSection = {
      id: `${type}_${Date.now()}`,
      type,
      title:
        type === 'template' && templateId
          ? templates.find(t => t.id === templateId)?.displayName || 'Template'
          : sectionTypeLabels[type],
      templateId,
      itemsPerSection,
      order: sections.length,
      isVisible: true,
    };
    setSections([...sections, newSection]);
    setShowAddMenu(false);
    setShowTemplateMenu(false);
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setSections(
      sections.map(s =>
        s.id === id ? { ...s, isVisible: !s.isVisible } : s
      )
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize homepage"
      size="lg"
    >
      <div className="space-y-6">
        {/* Description */}
        <p className="text-sm text-ontology-600">
          Personalize your homepage by selecting and arranging sections to create
          a tailored ontology experience. The ontology will start up with object
          types from your selected sections, ensuring the entities most relevant
          to you are readily available.
        </p>

        {/* Items per section */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-ontology-700">
            Items per section
          </label>
          <select
            value={itemsPerSection}
            onChange={e => setItemsPerSection(Number(e.target.value))}
            className="input w-20"
          >
            <option value={3}>3</option>
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
          </select>

          {/* Add Section Button */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="btn btn-secondary"
            >
              <Plus className="w-4 h-4" />
              <span>Add section</span>
            </button>

            {showAddMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowTemplateMenu(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-ontology-200 py-1 z-20">
                  <button
                    className="w-full px-4 py-2 text-sm text-ontology-700 hover:bg-ontology-50 flex items-center gap-2"
                    onClick={() => {
                      setShowTemplateMenu(!showTemplateMenu);
                    }}
                  >
                    <Grid3X3 className="w-4 h-4 text-ontology-500" />
                    <span>Template</span>
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-ontology-700 hover:bg-ontology-50 flex items-center gap-2"
                    onClick={() => handleAddSection('favorites')}
                  >
                    <Star className="w-4 h-4 text-ontology-500" />
                    <span>Favorite object types</span>
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-ontology-700 hover:bg-ontology-50 flex items-center gap-2"
                    onClick={() => handleAddSection('favorite_templates')}
                  >
                    <Grid3X3 className="w-4 h-4 text-ontology-500" />
                    <span>Favorite templates</span>
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-ontology-700 hover:bg-ontology-50 flex items-center gap-2"
                    onClick={() => handleAddSection('recently_viewed')}
                  >
                    <Clock className="w-4 h-4 text-ontology-500" />
                    <span>Recently viewed object types</span>
                  </button>

                  {/* Template submenu */}
                  {showTemplateMenu && (
                    <div className="absolute left-full top-0 ml-1 w-56 bg-white rounded-lg shadow-lg border border-ontology-200 py-1 max-h-64 overflow-y-auto">
                      <div className="px-4 py-2 text-xs font-semibold text-ontology-500 uppercase">
                        Choose template...
                      </div>
                      {templates.map(template => (
                        <button
                          key={template.id}
                          className="w-full px-4 py-2 text-sm text-ontology-700 hover:bg-ontology-50 flex items-center gap-2"
                          onClick={() => handleAddSection('template', template.id)}
                        >
                          <span
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: template.color }}
                          />
                          <span className="flex-1 truncate">{template.displayName}</span>
                          <Badge variant="gray">{template.memberCount}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section List */}
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                section.isVisible
                  ? 'bg-white border-ontology-200'
                  : 'bg-ontology-50 border-ontology-200 opacity-60'
              )}
            >
              <button className="cursor-grab text-ontology-400 hover:text-ontology-600">
                <GripVertical className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-ontology-500">
                {sectionTypeIcons[section.type]}
              </div>

              <div className="flex-1">
                <span className="text-sm font-medium text-ontology-800">
                  {section.title}
                </span>
                {section.type === 'template' && section.templateId && (
                  <Badge
                    variant="custom"
                    color={templates.find(t => t.id === section.templateId)?.color}
                    className="ml-2"
                  >
                    {templates.find(t => t.id === section.templateId)?.memberCount} items
                  </Badge>
                )}
              </div>

              <button
                onClick={() => handleToggleVisibility(section.id)}
                className={clsx(
                  'text-xs font-medium px-2 py-1 rounded',
                  section.isVisible
                    ? 'text-green-700 bg-green-50'
                    : 'text-ontology-500 bg-ontology-100'
                )}
              >
                {section.isVisible ? 'Visible' : 'Hidden'}
              </button>

              <button
                onClick={() => handleRemoveSection(section.id)}
                className="p-1 text-ontology-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {sections.length === 0 && (
            <div className="text-center py-8 text-ontology-500">
              No sections configured. Add a section to get started.
            </div>
          )}
        </div>
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          Apply
        </button>
      </ModalFooter>
    </Modal>
  );
}

export default CustomizeModal;
