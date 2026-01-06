import { useState, useEffect } from 'react';
import {
  ArrowRight,
} from 'lucide-react';
import { Modal, ModalFooter, IconBox } from '@/components/common';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import type { LinkType, LinkCardinality, LinkDirection } from '@/types';

interface LinkTypeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkType?: LinkType | null;
}

const cardinalities: { value: LinkCardinality; label: string; description: string }[] = [
  { value: 'one-to-one', label: 'One to One', description: 'Each source has exactly one target' },
  { value: 'one-to-many', label: 'One to Many', description: 'Each source can have multiple targets' },
  { value: 'many-to-one', label: 'Many to One', description: 'Multiple sources point to one target' },
  { value: 'many-to-many', label: 'Many to Many', description: 'Multiple sources to multiple targets' },
];

const lineStyles: { value: 'solid' | 'dashed' | 'dotted'; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const defaultColors = [
  '#0176d3', '#2e844a', '#9050e9', '#f59e0b', '#dc2626',
  '#ec4899', '#6366f1', '#0d9488', '#64748b', '#22c55e',
];

export function LinkTypeEditorModal({
  isOpen,
  onClose,
  linkType,
}: LinkTypeEditorModalProps) {
  const { dmos, addLinkType, updateLinkType, getDMOById } = useOntologyStore();
  const isEditing = !!linkType;

  // Form state
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceObjectType, setSourceObjectType] = useState('');
  const [targetObjectType, setTargetObjectType] = useState('');
  const [cardinality, setCardinality] = useState<LinkCardinality>('many-to-many');
  const [direction, setDirection] = useState<LinkDirection>('unidirectional');
  const [sourceDisplayName, setSourceDisplayName] = useState('');
  const [targetDisplayName, setTargetDisplayName] = useState('');
  const [color, setColor] = useState('#0176d3');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [isRequired, setIsRequired] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { groups } = useOntologyStore();

  // Initialize form when linkType changes
  useEffect(() => {
    if (linkType) {
      setName(linkType.name);
      setDisplayName(linkType.displayName);
      setDescription(linkType.description);
      setSourceObjectType(linkType.sourceObjectType);
      setTargetObjectType(linkType.targetObjectType);
      setCardinality(linkType.cardinality);
      setDirection(linkType.direction);
      setSourceDisplayName(linkType.sourceDisplayName);
      setTargetDisplayName(linkType.targetDisplayName);
      setColor(linkType.color);
      setLineStyle(linkType.lineStyle);
      setIsRequired(linkType.isRequired);
      setSelectedGroups(linkType.groups);
    } else {
      // Reset form for new link type
      setName('');
      setDisplayName('');
      setDescription('');
      setSourceObjectType('');
      setTargetObjectType('');
      setCardinality('many-to-many');
      setDirection('unidirectional');
      setSourceDisplayName('');
      setTargetDisplayName('');
      setColor('#0176d3');
      setLineStyle('solid');
      setIsRequired(false);
      setSelectedGroups([]);
    }
    setErrors({});
  }, [linkType, isOpen]);

  // Auto-generate name from displayName
  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (!isEditing && !name) {
      // Convert to UPPER_SNAKE_CASE
      const generatedName = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      setName(generatedName);
    }
    // Auto-generate source display name
    if (!sourceDisplayName) {
      setSourceDisplayName(value.toLowerCase());
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      newErrors.name = 'Name must be UPPER_SNAKE_CASE (e.g., AUTHORED_BY)';
    }
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (!sourceObjectType) {
      newErrors.sourceObjectType = 'Source object type is required';
    }
    if (!targetObjectType) {
      newErrors.targetObjectType = 'Target object type is required';
    }
    if (!sourceDisplayName.trim()) {
      newErrors.sourceDisplayName = 'Source display name is required';
    }
    if (!targetDisplayName.trim()) {
      newErrors.targetDisplayName = 'Target display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const linkTypeData: LinkType = {
      id: linkType?.id || name.toLowerCase().replace(/_/g, '_'),
      name,
      displayName,
      description,
      sourceObjectType,
      targetObjectType,
      cardinality,
      direction,
      sourceDisplayName,
      targetDisplayName,
      properties: linkType?.properties || [],
      linkCount: linkType?.linkCount || 0,
      lastModified: new Date().toISOString(),
      createdAt: linkType?.createdAt || new Date().toISOString(),
      groups: selectedGroups,
      isRequired,
      isFavorite: linkType?.isFavorite || false,
      isDeprecated: linkType?.isDeprecated || false,
      color,
      lineStyle,
    };

    if (isEditing) {
      updateLinkType(linkType.id, linkTypeData);
    } else {
      addLinkType(linkTypeData);
    }

    onClose();
  };

  const sourceDMO = getDMOById(sourceObjectType);
  const targetDMO = getDMOById(targetObjectType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Link Type' : 'Create Link Type'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Preview */}
        {sourceObjectType && targetObjectType && (
          <div className="bg-ontology-50 rounded-lg p-4">
            <label className="text-xs font-semibold text-ontology-500 uppercase mb-3 block">
              Preview
            </label>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                {sourceDMO && (
                  <IconBox name={sourceDMO.icon} color={sourceDMO.color} size="sm" />
                )}
                <span className="font-medium text-ontology-700">
                  {sourceDMO?.displayName}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <div
                  className="flex-1 h-0.5"
                  style={{
                    backgroundColor: lineStyle === 'solid' ? color : 'transparent',
                    borderTop: lineStyle !== 'solid' ? `2px ${lineStyle} ${color}` : 'none',
                  }}
                />
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {displayName || 'Link Name'}
                </div>
                <div
                  className="flex-1 h-0.5"
                  style={{
                    backgroundColor: lineStyle === 'solid' ? color : 'transparent',
                    borderTop: lineStyle !== 'solid' ? `2px ${lineStyle} ${color}` : 'none',
                  }}
                />
                <ArrowRight className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex items-center gap-2">
                {targetDMO && (
                  <IconBox name={targetDMO.icon} color={targetDMO.color} size="sm" />
                )}
                <span className="font-medium text-ontology-700">
                  {targetDMO?.displayName}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => handleDisplayNameChange(e.target.value)}
              className={`input ${errors.displayName ? 'border-red-500' : ''}`}
              placeholder="e.g., Authored By"
            />
            {errors.displayName && (
              <p className="text-sm text-red-500 mt-1">{errors.displayName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              API Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              className={`input font-mono ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., AUTHORED_BY"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ontology-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="input min-h-[80px]"
            placeholder="Describe the relationship..."
          />
        </div>

        {/* Source and Target */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Source Object Type <span className="text-red-500">*</span>
            </label>
            <select
              value={sourceObjectType}
              onChange={e => setSourceObjectType(e.target.value)}
              className={`input ${errors.sourceObjectType ? 'border-red-500' : ''}`}
            >
              <option value="">Select source...</option>
              {dmos.map(dmo => (
                <option key={dmo.id} value={dmo.id}>
                  {dmo.displayName}
                </option>
              ))}
            </select>
            {errors.sourceObjectType && (
              <p className="text-sm text-red-500 mt-1">{errors.sourceObjectType}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Target Object Type <span className="text-red-500">*</span>
            </label>
            <select
              value={targetObjectType}
              onChange={e => setTargetObjectType(e.target.value)}
              className={`input ${errors.targetObjectType ? 'border-red-500' : ''}`}
            >
              <option value="">Select target...</option>
              {dmos.map(dmo => (
                <option key={dmo.id} value={dmo.id}>
                  {dmo.displayName}
                </option>
              ))}
            </select>
            {errors.targetObjectType && (
              <p className="text-sm text-red-500 mt-1">{errors.targetObjectType}</p>
            )}
          </div>
        </div>

        {/* Display Names */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Source Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sourceDisplayName}
              onChange={e => setSourceDisplayName(e.target.value)}
              className={`input ${errors.sourceDisplayName ? 'border-red-500' : ''}`}
              placeholder="e.g., authored by"
            />
            <p className="text-xs text-ontology-500 mt-1">
              How to read from source: "Document <strong>{sourceDisplayName || '...'}</strong> Individual"
            </p>
            {errors.sourceDisplayName && (
              <p className="text-sm text-red-500 mt-1">{errors.sourceDisplayName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Target Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetDisplayName}
              onChange={e => setTargetDisplayName(e.target.value)}
              className={`input ${errors.targetDisplayName ? 'border-red-500' : ''}`}
              placeholder="e.g., is author of"
            />
            <p className="text-xs text-ontology-500 mt-1">
              How to read from target: "Individual <strong>{targetDisplayName || '...'}</strong> Document"
            </p>
            {errors.targetDisplayName && (
              <p className="text-sm text-red-500 mt-1">{errors.targetDisplayName}</p>
            )}
          </div>
        </div>

        {/* Cardinality and Direction */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Cardinality
            </label>
            <select
              value={cardinality}
              onChange={e => setCardinality(e.target.value as LinkCardinality)}
              className="input"
            >
              {cardinalities.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-ontology-500 mt-1">
              {cardinalities.find(c => c.value === cardinality)?.description}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Direction
            </label>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value as LinkDirection)}
              className="input"
            >
              <option value="unidirectional">Unidirectional</option>
              <option value="bidirectional">Bidirectional</option>
            </select>
            <p className="text-xs text-ontology-500 mt-1">
              {direction === 'bidirectional'
                ? 'Can traverse in both directions'
                : 'Only traverse from source to target'}
            </p>
          </div>
        </div>

        {/* Visual Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded border border-ontology-300 cursor-pointer"
              />
              <div className="flex gap-1 flex-wrap">
                {defaultColors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      color === c ? 'border-ontology-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Line Style
            </label>
            <div className="flex gap-4">
              {lineStyles.map(style => (
                <label key={style.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lineStyle"
                    value={style.value}
                    checked={lineStyle === style.value}
                    onChange={e => setLineStyle(e.target.value as typeof lineStyle)}
                    className="text-sf-blue-600 focus:ring-sf-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-0"
                      style={{
                        borderTop: `2px ${style.value} ${color}`,
                      }}
                    />
                    <span className="text-sm text-ontology-700">{style.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Groups */}
        <div>
          <label className="block text-sm font-medium text-ontology-700 mb-2">
            Groups
          </label>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => (
              <label
                key={group.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                  selectedGroups.includes(group.id)
                    ? 'bg-sf-blue-50 border-sf-blue-300 text-sf-blue-700'
                    : 'bg-white border-ontology-200 text-ontology-600 hover:border-ontology-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedGroups([...selectedGroups, group.id]);
                    } else {
                      setSelectedGroups(selectedGroups.filter(g => g !== group.id));
                    }
                  }}
                  className="sr-only"
                />
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-sm">{group.displayName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={e => setIsRequired(e.target.checked)}
              className="rounded border-ontology-300 text-sf-blue-600 focus:ring-sf-blue-500"
            />
            <span className="text-sm text-ontology-700">
              Required relationship (source must have at least one target)
            </span>
          </label>
        </div>
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          {isEditing ? 'Save Changes' : 'Create Link Type'}
        </button>
      </ModalFooter>
    </Modal>
  );
}

export default LinkTypeEditorModal;
