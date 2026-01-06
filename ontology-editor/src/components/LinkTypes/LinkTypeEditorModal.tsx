import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';
import { Modal, ModalFooter, IconBox } from '@/components/common';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import type { LinkType, LinkCardinality, LinkDirection } from '@/types';

interface LinkTypeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkType?: LinkType | null;
}

const cardinalities: { value: LinkCardinality; label: string }[] = [
  { value: 'one-to-one', label: '1:1' },
  { value: 'one-to-many', label: '1:N' },
  { value: 'many-to-one', label: 'N:1' },
  { value: 'many-to-many', label: 'N:N' },
];

const defaultColors = [
  '#0176d3', '#2e844a', '#9050e9', '#f59e0b', '#dc2626',
  '#ec4899', '#6366f1', '#0d9488',
];

export function LinkTypeEditorModal({
  isOpen,
  onClose,
  linkType,
}: LinkTypeEditorModalProps) {
  const { dmos, addLinkType, updateLinkType, getDMOById, templates } = useOntologyStore();
  const isEditing = !!linkType;

  // Core form state
  const [sourceObjectType, setSourceObjectType] = useState('');
  const [targetObjectType, setTargetObjectType] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [cardinality, setCardinality] = useState<LinkCardinality>('many-to-many');
  const [color, setColor] = useState('#0176d3');

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [direction, setDirection] = useState<LinkDirection>('unidirectional');
  const [sourceDisplayName, setSourceDisplayName] = useState('');
  const [targetDisplayName, setTargetDisplayName] = useState('');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [isRequired, setIsRequired] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when linkType changes
  useEffect(() => {
    if (linkType) {
      setSourceObjectType(linkType.sourceObjectType);
      setTargetObjectType(linkType.targetObjectType);
      setDisplayName(linkType.displayName);
      setCardinality(linkType.cardinality);
      setColor(linkType.color);
      setName(linkType.name);
      setDescription(linkType.description);
      setDirection(linkType.direction);
      setSourceDisplayName(linkType.sourceDisplayName);
      setTargetDisplayName(linkType.targetDisplayName);
      setLineStyle(linkType.lineStyle);
      setIsRequired(linkType.isRequired);
      setSelectedGroups(linkType.groups);
      setShowAdvanced(true); // Show advanced when editing
    } else {
      // Reset form for new link type
      setSourceObjectType('');
      setTargetObjectType('');
      setDisplayName('');
      setCardinality('many-to-many');
      setColor(defaultColors[Math.floor(Math.random() * defaultColors.length)]);
      setName('');
      setDescription('');
      setDirection('unidirectional');
      setSourceDisplayName('');
      setTargetDisplayName('');
      setLineStyle('solid');
      setIsRequired(false);
      setSelectedGroups([]);
      setShowAdvanced(false);
    }
    setErrors({});
  }, [linkType, isOpen]);

  // Auto-generate values when source/target/displayName change
  useEffect(() => {
    if (!isEditing && displayName) {
      // Auto-generate API name
      const generatedName = displayName
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      setName(generatedName);

      // Auto-generate display names
      setSourceDisplayName(displayName.toLowerCase());
      const sourceDMO = getDMOById(sourceObjectType);
      const targetDMO = getDMOById(targetObjectType);
      if (sourceDMO && targetDMO) {
        setTargetDisplayName(`has ${targetDMO.displayName.toLowerCase()}`);
      }
    }
  }, [displayName, sourceObjectType, targetObjectType, isEditing, getDMOById]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!sourceObjectType) newErrors.source = 'Required';
    if (!targetObjectType) newErrors.target = 'Required';
    if (!displayName.trim()) newErrors.displayName = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const finalName = name || displayName.toUpperCase().replace(/[^A-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const finalSourceDisplayName = sourceDisplayName || displayName.toLowerCase();
    const finalTargetDisplayName = targetDisplayName || `has ${getDMOById(targetObjectType)?.displayName.toLowerCase() || 'target'}`;

    const linkTypeData: LinkType = {
      id: linkType?.id || `link-${Date.now()}`,
      name: finalName,
      displayName,
      description,
      sourceObjectType,
      targetObjectType,
      cardinality,
      direction,
      sourceDisplayName: finalSourceDisplayName,
      targetDisplayName: finalTargetDisplayName,
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
      title={isEditing ? 'Edit Link Type' : 'Create Link'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Simple Visual Builder */}
        <div className="bg-gradient-to-r from-ontology-50 to-ontology-100 rounded-xl p-6">
          <div className="flex items-center gap-4">
            {/* Source Selection */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-ontology-500 uppercase mb-2">
                From
              </label>
              <select
                value={sourceObjectType}
                onChange={e => setSourceObjectType(e.target.value)}
                className={clsx(
                  'w-full px-4 py-3 rounded-lg border-2 bg-white text-lg font-medium transition-colors',
                  errors.source ? 'border-red-300' : 'border-ontology-200 focus:border-sf-blue-400'
                )}
              >
                <option value="">Select object...</option>
                {dmos.map(dmo => (
                  <option key={dmo.id} value={dmo.id}>
                    {dmo.displayName}
                  </option>
                ))}
              </select>
              {sourceDMO && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <IconBox name={sourceDMO.icon} color={sourceDMO.color} size="sm" />
                  <span className="text-sm text-ontology-600">{sourceDMO.displayName}</span>
                </div>
              )}
            </div>

            {/* Arrow with Link Name */}
            <div className="flex flex-col items-center gap-2 min-w-[200px]">
              <div className="flex items-center w-full">
                <div
                  className="flex-1 h-1 rounded"
                  style={{ backgroundColor: color }}
                />
                <ArrowRight className="w-6 h-6 -ml-1" style={{ color }} />
              </div>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className={clsx(
                  'w-full text-center px-3 py-2 rounded-lg border-2 font-medium text-sm',
                  errors.displayName ? 'border-red-300' : 'border-ontology-200 focus:border-sf-blue-400'
                )}
                placeholder="Link name..."
              />
            </div>

            {/* Target Selection */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-ontology-500 uppercase mb-2">
                To
              </label>
              <select
                value={targetObjectType}
                onChange={e => setTargetObjectType(e.target.value)}
                className={clsx(
                  'w-full px-4 py-3 rounded-lg border-2 bg-white text-lg font-medium transition-colors',
                  errors.target ? 'border-red-300' : 'border-ontology-200 focus:border-sf-blue-400'
                )}
              >
                <option value="">Select object...</option>
                {dmos.map(dmo => (
                  <option key={dmo.id} value={dmo.id}>
                    {dmo.displayName}
                  </option>
                ))}
              </select>
              {targetDMO && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <IconBox name={targetDMO.icon} color={targetDMO.color} size="sm" />
                  <span className="text-sm text-ontology-600">{targetDMO.displayName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Options Row */}
        <div className="flex items-center gap-6">
          {/* Cardinality */}
          <div>
            <label className="block text-xs font-semibold text-ontology-500 uppercase mb-2">
              Cardinality
            </label>
            <div className="flex gap-1">
              {cardinalities.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCardinality(c.value)}
                  className={clsx(
                    'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                    cardinality === c.value
                      ? 'bg-sf-blue-500 border-sf-blue-500 text-white'
                      : 'bg-white border-ontology-200 text-ontology-600 hover:border-ontology-300'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-ontology-500 uppercase mb-2">
              Color
            </label>
            <div className="flex gap-1">
              {defaultColors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    'w-8 h-8 rounded-lg border-2 transition-transform',
                    color === c ? 'border-ontology-900 scale-110' : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-ontology-500 hover:text-ontology-700 transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{showAdvanced ? 'Hide' : 'Show'} advanced options</span>
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-ontology-200">
            {/* API Name & Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ontology-700 mb-1">
                  API Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase())}
                  className="input font-mono text-sm"
                  placeholder="AUTHORED_BY"
                />
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
                  <option value="unidirectional">Unidirectional →</option>
                  <option value="bidirectional">Bidirectional ↔</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ontology-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input min-h-[60px]"
                placeholder="Describe this relationship..."
              />
            </div>

            {/* Display Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ontology-700 mb-1">
                  Forward Label
                </label>
                <input
                  type="text"
                  value={sourceDisplayName}
                  onChange={e => setSourceDisplayName(e.target.value)}
                  className="input text-sm"
                  placeholder="e.g., authored by"
                />
                <p className="text-xs text-ontology-400 mt-1">
                  {sourceDMO?.displayName || 'Source'} → <strong>{sourceDisplayName || '...'}</strong> → {targetDMO?.displayName || 'Target'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ontology-700 mb-1">
                  Reverse Label
                </label>
                <input
                  type="text"
                  value={targetDisplayName}
                  onChange={e => setTargetDisplayName(e.target.value)}
                  className="input text-sm"
                  placeholder="e.g., is author of"
                />
                <p className="text-xs text-ontology-400 mt-1">
                  {targetDMO?.displayName || 'Target'} → <strong>{targetDisplayName || '...'}</strong> → {sourceDMO?.displayName || 'Source'}
                </p>
              </div>
            </div>

            {/* Line Style & Required */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-ontology-700">Line style:</span>
                {(['solid', 'dashed', 'dotted'] as const).map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setLineStyle(style)}
                    className={clsx(
                      'flex items-center gap-2 px-2 py-1 rounded',
                      lineStyle === style ? 'bg-ontology-100' : 'hover:bg-ontology-50'
                    )}
                  >
                    <div
                      className="w-8 h-0"
                      style={{ borderTop: `2px ${style} ${color}` }}
                    />
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={e => setIsRequired(e.target.checked)}
                  className="rounded border-ontology-300 text-sf-blue-600"
                />
                <span className="text-sm text-ontology-700">Required</span>
              </label>
            </div>

            {/* Templates */}
            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-ontology-700 mb-2">
                  Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        if (selectedGroups.includes(template.id)) {
                          setSelectedGroups(selectedGroups.filter(t => t !== template.id));
                        } else {
                          setSelectedGroups([...selectedGroups, template.id]);
                        }
                      }}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors',
                        selectedGroups.includes(template.id)
                          ? 'bg-sf-blue-50 border-sf-blue-300 text-sf-blue-700'
                          : 'bg-white border-ontology-200 text-ontology-600 hover:border-ontology-300'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: template.color }} />
                      {template.displayName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          {isEditing ? 'Save Changes' : 'Create Link'}
        </button>
      </ModalFooter>
    </Modal>
  );
}

export default LinkTypeEditorModal;
