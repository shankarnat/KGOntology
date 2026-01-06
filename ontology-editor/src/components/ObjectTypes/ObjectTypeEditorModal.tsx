import { useState, useEffect } from 'react';
import {
  X,
  Database,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import type { DMO, DMOCategory, DMOSource } from '@/types';

interface ObjectTypeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectType?: DMO | null;
}

const categories: { value: DMOCategory; label: string; description: string }[] = [
  { value: 'individual', label: 'Individual', description: 'Person entities' },
  { value: 'party', label: 'Party', description: 'Organizations, departments' },
  { value: 'product', label: 'Product', description: 'Products, services, offerings' },
  { value: 'engagement', label: 'Engagement', description: 'Interactions, analytics' },
  { value: 'case', label: 'Case', description: 'Support cases, validation' },
  { value: 'custom', label: 'Custom', description: 'Custom domain objects' },
];

const sources: { value: DMOSource; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Salesforce standard DMO' },
  { value: 'embellished', label: 'Embellished', description: 'Standard with extensions' },
  { value: 'custom', label: 'Custom', description: 'Custom-built DMO' },
];

const iconOptions = [
  'User', 'Users', 'Building', 'Building2', 'Briefcase', 'Package', 'ShoppingCart',
  'FileText', 'File', 'Folder', 'Tag', 'Tags', 'Star', 'Heart', 'MessageSquare',
  'Mail', 'Phone', 'Globe', 'Link', 'Database', 'Server', 'Cloud', 'Zap',
  'Settings', 'Target', 'TrendingUp', 'BarChart', 'PieChart', 'Activity',
];

const colorOptions = [
  '#0176d3', '#1b96ff', '#0b5cab', // Blues
  '#9050e9', '#7526e3', '#5a1ba9', // Purples
  '#22c55e', '#16a34a', '#15803d', // Greens
  '#f59e0b', '#d97706', '#b45309', // Oranges
  '#ef4444', '#dc2626', '#b91c1c', // Reds
  '#06b6d4', '#0891b2', '#0e7490', // Cyans
];

export function ObjectTypeEditorModal({ isOpen, onClose, objectType }: ObjectTypeEditorModalProps) {
  const { addDMO, updateDMO, dmos, templates } = useOntologyStore();
  const isEditing = !!objectType;

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    pluralDisplayName: '',
    description: '',
    category: 'custom' as DMOCategory,
    source: 'custom' as DMOSource,
    icon: 'Database',
    color: '#0176d3',
    selectedGroups: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (objectType) {
      setFormData({
        name: objectType.name,
        displayName: objectType.displayName,
        pluralDisplayName: objectType.pluralDisplayName,
        description: objectType.description,
        category: objectType.category,
        source: objectType.source,
        icon: objectType.icon,
        color: objectType.color,
        selectedGroups: objectType.groups,
      });
    } else {
      setFormData({
        name: '',
        displayName: '',
        pluralDisplayName: '',
        description: '',
        category: 'custom',
        source: 'custom',
        icon: 'Database',
        color: '#0176d3',
        selectedGroups: [],
      });
    }
    setErrors({});
  }, [objectType, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'API name is required';
    } else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(formData.name)) {
      newErrors.name = 'API name must start with a letter and contain only letters, numbers, and underscores';
    } else if (!isEditing && dmos.some(d => d.name.toLowerCase() === formData.name.toLowerCase())) {
      newErrors.name = 'An object type with this API name already exists';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.pluralDisplayName.trim()) {
      newErrors.pluralDisplayName = 'Plural name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const dmoData: DMO = {
      id: isEditing ? objectType!.id : `dmo-${Date.now()}`,
      name: formData.name,
      displayName: formData.displayName,
      pluralDisplayName: formData.pluralDisplayName,
      description: formData.description,
      category: formData.category,
      source: formData.source,
      icon: formData.icon,
      color: formData.color,
      groups: formData.selectedGroups,
      properties: isEditing ? objectType!.properties : [],
      primaryKey: isEditing ? objectType!.primaryKey : 'id',
      objectCount: isEditing ? objectType!.objectCount : 0,
      dependentCount: isEditing ? objectType!.dependentCount : 0,
      incomingLinkTypes: isEditing ? objectType!.incomingLinkTypes : [],
      outgoingLinkTypes: isEditing ? objectType!.outgoingLinkTypes : [],
      isFavorite: isEditing ? objectType!.isFavorite : false,
      isProminent: isEditing ? objectType!.isProminent : false,
      isDeprecated: isEditing ? objectType!.isDeprecated : false,
      createdAt: isEditing ? objectType!.createdAt : new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    if (isEditing) {
      updateDMO(objectType!.id, dmoData);
    } else {
      addDMO(dmoData);
    }

    onClose();
  };

  const handleDisplayNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      displayName: value,
      // Auto-generate API name if not editing and name is empty or was auto-generated
      name: !isEditing && (!prev.name || prev.name === toPascalCase(prev.displayName))
        ? toPascalCase(value)
        : prev.name,
      // Auto-generate plural name
      pluralDisplayName: !prev.pluralDisplayName || prev.pluralDisplayName === prev.displayName + 's'
        ? value + 's'
        : prev.pluralDisplayName,
    }));
  };

  const toPascalCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  };

  const toggleTemplate = (templateId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(templateId)
        ? prev.selectedGroups.filter(t => t !== templateId)
        : [...prev.selectedGroups, templateId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ontology-200">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${formData.color}15` }}
              >
                <Database className="w-5 h-5" style={{ color: formData.color }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ontology-900">
                  {isEditing ? 'Edit Object Type' : 'Create Object Type'}
                </h2>
                <p className="text-sm text-ontology-500">
                  {isEditing ? 'Modify object type definition' : 'Define a new object type for your ontology'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-ontology-400 hover:text-ontology-600 hover:bg-ontology-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ontology-700 uppercase tracking-wider">
                  Basic Information
                </h3>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-ontology-700 mb-1">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => handleDisplayNameChange(e.target.value)}
                    className={clsx('input', errors.displayName && 'border-red-500')}
                    placeholder="e.g., Customer Document"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.displayName}
                    </p>
                  )}
                </div>

                {/* API Name */}
                <div>
                  <label className="block text-sm font-medium text-ontology-700 mb-1">
                    API Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={clsx('input font-mono', errors.name && 'border-red-500')}
                    placeholder="e.g., CustomerDocument"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-ontology-500">
                    Used for API calls and references. Must be unique.
                  </p>
                </div>

                {/* Plural Name */}
                <div>
                  <label className="block text-sm font-medium text-ontology-700 mb-1">
                    Plural Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pluralDisplayName}
                    onChange={e => setFormData(prev => ({ ...prev, pluralDisplayName: e.target.value }))}
                    className={clsx('input', errors.pluralDisplayName && 'border-red-500')}
                    placeholder="e.g., Customer Documents"
                  />
                  {errors.pluralDisplayName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.pluralDisplayName}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-ontology-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input min-h-[80px]"
                    placeholder="Describe what this object type represents..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ontology-700 uppercase tracking-wider">
                  Classification
                </h3>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-ontology-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                        className={clsx(
                          'p-3 rounded-lg border text-left transition-colors',
                          formData.category === cat.value
                            ? 'border-sf-blue-500 bg-sf-blue-50'
                            : 'border-ontology-200 hover:border-ontology-300'
                        )}
                      >
                        <div className="font-medium text-sm text-ontology-900">{cat.label}</div>
                        <div className="text-xs text-ontology-500">{cat.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-ontology-700 mb-2">
                    Source
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {sources.map(src => (
                      <button
                        key={src.value}
                        onClick={() => setFormData(prev => ({ ...prev, source: src.value }))}
                        className={clsx(
                          'p-3 rounded-lg border text-left transition-colors',
                          formData.source === src.value
                            ? 'border-sf-blue-500 bg-sf-blue-50'
                            : 'border-ontology-200 hover:border-ontology-300'
                        )}
                      >
                        <div className="font-medium text-sm text-ontology-900">{src.label}</div>
                        <div className="text-xs text-ontology-500">{src.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ontology-700 uppercase tracking-wider">
                  Appearance
                </h3>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-ontology-700 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={clsx(
                          'w-10 h-10 rounded-lg border flex items-center justify-center transition-colors',
                          formData.icon === icon
                            ? 'border-sf-blue-500 bg-sf-blue-50'
                            : 'border-ontology-200 hover:border-ontology-300'
                        )}
                        title={icon}
                      >
                        <Database className="w-5 h-5 text-ontology-600" />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-ontology-500">
                    Selected: {formData.icon}
                  </p>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-ontology-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={clsx(
                          'w-10 h-10 rounded-lg border-2 transition-all',
                          formData.color === color
                            ? 'border-ontology-900 scale-110'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Templates */}
              {templates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-ontology-700 uppercase tracking-wider">
                    Templates
                  </h3>
                  <p className="text-xs text-ontology-500">
                    Assign this object type to templates for organization and reuse.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => toggleTemplate(template.id)}
                        className={clsx(
                          'px-3 py-1.5 rounded-full border text-sm transition-colors',
                          formData.selectedGroups.includes(template.id)
                            ? 'border-sf-blue-500 bg-sf-blue-50 text-sf-blue-700'
                            : 'border-ontology-200 text-ontology-600 hover:border-ontology-300'
                        )}
                      >
                        {template.displayName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ontology-200 bg-ontology-50">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              {isEditing ? 'Save Changes' : 'Create Object Type'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ObjectTypeEditorModal;
