import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Modal, ModalFooter, Badge } from '@/components/common';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import type { Property, PropertyDataType, PropertyValidation } from '@/types';

interface PropertyEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  objectTypeId?: string | null;
}

const dataTypes: PropertyDataType[] = [
  'string', 'text', 'number', 'integer', 'decimal',
  'boolean', 'date', 'datetime', 'timestamp',
  'enum', 'array', 'object', 'reference'
];

export function PropertyEditorModal({
  isOpen,
  onClose,
  property,
  objectTypeId,
}: PropertyEditorModalProps) {
  const { dmos, updateDMO, getDMOById } = useOntologyStore();
  const isEditing = !!property;

  // Form state
  const [selectedObjectType, setSelectedObjectType] = useState<string>(objectTypeId || '');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState<PropertyDataType>('string');
  const [required, setRequired] = useState(false);
  const [indexed, setIndexed] = useState(false);
  const [unique, setUnique] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');

  // Validation state
  const [minLength, setMinLength] = useState<string>('');
  const [maxLength, setMaxLength] = useState<string>('');
  const [min, setMin] = useState<string>('');
  const [max, setMax] = useState<string>('');
  const [pattern, setPattern] = useState('');
  const [enumValues, setEnumValues] = useState<string[]>([]);
  const [newEnumValue, setNewEnumValue] = useState('');
  const [referenceType, setReferenceType] = useState('');

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when property changes
  useEffect(() => {
    if (property) {
      setName(property.name);
      setDisplayName(property.displayName);
      setDescription(property.description);
      setDataType(property.dataType);
      setRequired(property.required);
      setIndexed(property.indexed);
      setUnique(property.unique);
      setIsShared(property.isShared);
      setDefaultValue(property.defaultValue?.toString() || '');

      if (property.validation) {
        setMinLength(property.validation.minLength?.toString() || '');
        setMaxLength(property.validation.maxLength?.toString() || '');
        setMin(property.validation.min?.toString() || '');
        setMax(property.validation.max?.toString() || '');
        setPattern(property.validation.pattern || '');
        setEnumValues(property.validation.enumValues || []);
        setReferenceType(property.validation.referenceType || '');
      }
    } else {
      // Reset form for new property
      setName('');
      setDisplayName('');
      setDescription('');
      setDataType('string');
      setRequired(false);
      setIndexed(false);
      setUnique(false);
      setIsShared(false);
      setDefaultValue('');
      setMinLength('');
      setMaxLength('');
      setMin('');
      setMax('');
      setPattern('');
      setEnumValues([]);
      setReferenceType('');
    }

    if (objectTypeId) {
      setSelectedObjectType(objectTypeId);
    }

    setErrors({});
  }, [property, objectTypeId, isOpen]);

  // Auto-generate name from displayName
  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (!isEditing && !name) {
      // Convert to camelCase
      const generatedName = value
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(' ')
        .map((word, index) =>
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');
      setName(generatedName);
    }
  };

  const handleAddEnumValue = () => {
    if (newEnumValue && !enumValues.includes(newEnumValue)) {
      setEnumValues([...enumValues, newEnumValue]);
      setNewEnumValue('');
    }
  };

  const handleRemoveEnumValue = (value: string) => {
    setEnumValues(enumValues.filter(v => v !== value));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedObjectType) {
      newErrors.objectType = 'Please select an object type';
    }
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
      newErrors.name = 'Name must start with a letter and contain only alphanumeric characters';
    }
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (dataType === 'enum' && enumValues.length === 0) {
      newErrors.enumValues = 'At least one enum value is required';
    }
    if (dataType === 'reference' && !referenceType) {
      newErrors.referenceType = 'Reference type is required';
    }

    // Check for duplicate property name in the same object type
    if (!isEditing && selectedObjectType) {
      const dmo = getDMOById(selectedObjectType);
      if (dmo && dmo.properties.some(p => p.name === name)) {
        newErrors.name = 'A property with this name already exists';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const validation: PropertyValidation = {};

    if (['string', 'text'].includes(dataType)) {
      if (minLength) validation.minLength = parseInt(minLength);
      if (maxLength) validation.maxLength = parseInt(maxLength);
      if (pattern) validation.pattern = pattern;
    }

    if (['number', 'integer', 'decimal'].includes(dataType)) {
      if (min) validation.min = parseFloat(min);
      if (max) validation.max = parseFloat(max);
    }

    if (dataType === 'enum') {
      validation.enumValues = enumValues;
    }

    if (dataType === 'reference') {
      validation.referenceType = referenceType;
    }

    const newProperty: Property = {
      id: property?.id || `${name}_${Date.now()}`,
      name,
      displayName,
      description,
      dataType,
      required,
      indexed,
      unique,
      isShared,
      defaultValue: defaultValue || undefined,
      validation: Object.keys(validation).length > 0 ? validation : undefined,
    };

    // Update the DMO with the new/updated property
    const dmo = getDMOById(selectedObjectType);
    if (dmo) {
      let updatedProperties: Property[];

      if (isEditing && property) {
        // Update existing property
        updatedProperties = dmo.properties.map(p =>
          p.id === property.id ? newProperty : p
        );
      } else {
        // Add new property
        updatedProperties = [...dmo.properties, newProperty];
      }

      updateDMO(selectedObjectType, { properties: updatedProperties });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!property || !selectedObjectType) return;

    const dmo = getDMOById(selectedObjectType);
    if (dmo) {
      const updatedProperties = dmo.properties.filter(p => p.id !== property.id);
      updateDMO(selectedObjectType, { properties: updatedProperties });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Property' : 'Add Property'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Object Type Selection */}
        <div>
          <label className="block text-sm font-medium text-ontology-700 mb-1">
            Object Type <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedObjectType}
            onChange={e => setSelectedObjectType(e.target.value)}
            className={`input ${errors.objectType ? 'border-red-500' : ''}`}
            disabled={isEditing}
          >
            <option value="">Select object type...</option>
            {dmos.map(dmo => (
              <option key={dmo.id} value={dmo.id}>
                {dmo.displayName}
              </option>
            ))}
          </select>
          {errors.objectType && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.objectType}
            </p>
          )}
        </div>

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
              placeholder="e.g., First Name"
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
              onChange={e => setName(e.target.value)}
              className={`input font-mono ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., firstName"
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
            placeholder="Describe what this property represents..."
          />
        </div>

        {/* Data Type */}
        <div>
          <label className="block text-sm font-medium text-ontology-700 mb-1">
            Data Type <span className="text-red-500">*</span>
          </label>
          <select
            value={dataType}
            onChange={e => setDataType(e.target.value as PropertyDataType)}
            className="input"
          >
            {dataTypes.map(dt => (
              <option key={dt} value={dt}>{dt}</option>
            ))}
          </select>
        </div>

        {/* Type-specific options */}
        {['string', 'text'].includes(dataType) && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ontology-700 mb-1">
                Min Length
              </label>
              <input
                type="number"
                value={minLength}
                onChange={e => setMinLength(e.target.value)}
                className="input"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ontology-700 mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={maxLength}
                onChange={e => setMaxLength(e.target.value)}
                className="input"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ontology-700 mb-1">
                Pattern (Regex)
              </label>
              <input
                type="text"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                className="input font-mono"
                placeholder="^[a-zA-Z]+$"
              />
            </div>
          </div>
        )}

        {['number', 'integer', 'decimal'].includes(dataType) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ontology-700 mb-1">
                Minimum Value
              </label>
              <input
                type="number"
                value={min}
                onChange={e => setMin(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ontology-700 mb-1">
                Maximum Value
              </label>
              <input
                type="number"
                value={max}
                onChange={e => setMax(e.target.value)}
                className="input"
              />
            </div>
          </div>
        )}

        {dataType === 'enum' && (
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Enum Values <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEnumValue}
                onChange={e => setNewEnumValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddEnumValue()}
                className="input flex-1"
                placeholder="Add enum value..."
              />
              <button
                onClick={handleAddEnumValue}
                className="btn btn-secondary"
                type="button"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {enumValues.map(value => (
                <Badge key={value} variant="purple" className="pr-1">
                  {value}
                  <button
                    onClick={() => handleRemoveEnumValue(value)}
                    className="ml-1 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.enumValues && (
              <p className="text-sm text-red-500 mt-1">{errors.enumValues}</p>
            )}
          </div>
        )}

        {dataType === 'reference' && (
          <div>
            <label className="block text-sm font-medium text-ontology-700 mb-1">
              Reference Type <span className="text-red-500">*</span>
            </label>
            <select
              value={referenceType}
              onChange={e => setReferenceType(e.target.value)}
              className={`input ${errors.referenceType ? 'border-red-500' : ''}`}
            >
              <option value="">Select referenced object type...</option>
              {dmos.map(dmo => (
                <option key={dmo.id} value={dmo.name}>
                  {dmo.displayName}
                </option>
              ))}
            </select>
            {errors.referenceType && (
              <p className="text-sm text-red-500 mt-1">{errors.referenceType}</p>
            )}
          </div>
        )}

        {/* Default Value */}
        <div>
          <label className="block text-sm font-medium text-ontology-700 mb-1">
            Default Value
          </label>
          <input
            type={['number', 'integer', 'decimal'].includes(dataType) ? 'number' : 'text'}
            value={defaultValue}
            onChange={e => setDefaultValue(e.target.value)}
            className="input"
            placeholder="Enter default value..."
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-sm font-medium text-ontology-700 mb-2">
            Constraints
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={required}
                onChange={e => setRequired(e.target.checked)}
                className="rounded border-ontology-300 text-sf-blue-600 focus:ring-sf-blue-500"
              />
              <span className="text-sm text-ontology-700">Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={indexed}
                onChange={e => setIndexed(e.target.checked)}
                className="rounded border-ontology-300 text-sf-blue-600 focus:ring-sf-blue-500"
              />
              <span className="text-sm text-ontology-700">Indexed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unique}
                onChange={e => setUnique(e.target.checked)}
                className="rounded border-ontology-300 text-sf-blue-600 focus:ring-sf-blue-500"
              />
              <span className="text-sm text-ontology-700">Unique</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={e => setIsShared(e.target.checked)}
                className="rounded border-ontology-300 text-sf-blue-600 focus:ring-sf-blue-500"
              />
              <span className="text-sm text-ontology-700">Shared Property</span>
            </label>
          </div>
        </div>
      </div>

      <ModalFooter>
        {isEditing && (
          <button
            onClick={handleDelete}
            className="btn btn-secondary text-red-600 hover:bg-red-50 mr-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
        <button onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          {isEditing ? 'Save Changes' : 'Add Property'}
        </button>
      </ModalFooter>
    </Modal>
  );
}

export default PropertyEditorModal;
