import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronRight,
  Key,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  List as ListIcon,
  Braces,
  Link2,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { Card, Badge, IconBox } from '@/components/common';
import { PropertyEditorModal } from './PropertyEditorModal';
import type { Property, PropertyDataType } from '@/types';

type ViewMode = 'byObjectType' | 'flat';

// Icon mapping for data types
const dataTypeIcons: Record<PropertyDataType, React.ReactNode> = {
  string: <Type className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  integer: <Hash className="w-4 h-4" />,
  decimal: <Hash className="w-4 h-4" />,
  boolean: <ToggleLeft className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  datetime: <Calendar className="w-4 h-4" />,
  timestamp: <Calendar className="w-4 h-4" />,
  enum: <ListIcon className="w-4 h-4" />,
  array: <Braces className="w-4 h-4" />,
  object: <Braces className="w-4 h-4" />,
  reference: <Link2 className="w-4 h-4" />,
};

// Color mapping for data types
const dataTypeColors: Record<PropertyDataType, string> = {
  string: '#0176d3',
  text: '#0176d3',
  number: '#9050e9',
  integer: '#9050e9',
  decimal: '#9050e9',
  boolean: '#22c55e',
  date: '#f59e0b',
  datetime: '#f59e0b',
  timestamp: '#f59e0b',
  enum: '#ec4899',
  array: '#6366f1',
  object: '#6366f1',
  reference: '#0d9488',
};

interface PropertyWithContext extends Property {
  objectTypeId: string;
  objectTypeName: string;
  objectTypeColor: string;
  objectTypeIcon: string;
}

export function PropertiesPage() {
  const navigate = useNavigate();
  const { dmos } = useOntologyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('byObjectType');
  const [filterDataType, setFilterDataType] = useState<PropertyDataType | 'all'>('all');
  const [filterRequired, setFilterRequired] = useState<'all' | 'required' | 'optional'>('all');
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set(dmos.map(d => d.id)));
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyWithContext | null>(null);
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(null);

  // Flatten all properties with their object type context
  const allProperties = useMemo(() => {
    const properties: PropertyWithContext[] = [];
    dmos.forEach(dmo => {
      dmo.properties.forEach(prop => {
        properties.push({
          ...prop,
          objectTypeId: dmo.id,
          objectTypeName: dmo.displayName,
          objectTypeColor: dmo.color,
          objectTypeIcon: dmo.icon,
        });
      });
    });
    return properties;
  }, [dmos]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    let result = [...allProperties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.displayName.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.objectTypeName.toLowerCase().includes(query)
      );
    }

    // Data type filter
    if (filterDataType !== 'all') {
      result = result.filter(p => p.dataType === filterDataType);
    }

    // Required filter
    if (filterRequired === 'required') {
      result = result.filter(p => p.required);
    } else if (filterRequired === 'optional') {
      result = result.filter(p => !p.required);
    }

    return result;
  }, [allProperties, searchQuery, filterDataType, filterRequired]);

  // Group properties by object type
  const propertiesByObjectType = useMemo(() => {
    const groups: Record<string, { dmo: typeof dmos[0]; properties: PropertyWithContext[] }> = {};

    dmos.forEach(dmo => {
      const dmoProps = filteredProperties.filter(p => p.objectTypeId === dmo.id);
      if (dmoProps.length > 0 || !searchQuery) {
        groups[dmo.id] = {
          dmo,
          properties: dmoProps,
        };
      }
    });

    return groups;
  }, [dmos, filteredProperties, searchQuery]);

  const toggleObjectExpansion = (objectId: string) => {
    const newExpanded = new Set(expandedObjects);
    if (newExpanded.has(objectId)) {
      newExpanded.delete(objectId);
    } else {
      newExpanded.add(objectId);
    }
    setExpandedObjects(newExpanded);
  };

  const expandAll = () => {
    setExpandedObjects(new Set(dmos.map(d => d.id)));
  };

  const collapseAll = () => {
    setExpandedObjects(new Set());
  };

  const handleEditProperty = (prop: PropertyWithContext) => {
    setEditingProperty(prop);
    setSelectedObjectType(prop.objectTypeId);
    setIsEditorOpen(true);
  };

  const handleAddPropertyToObject = (objectTypeId: string) => {
    setEditingProperty(null);
    setSelectedObjectType(objectTypeId);
    setIsEditorOpen(true);
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setSelectedObjectType(null);
    setIsEditorOpen(true);
  };

  const dataTypes: PropertyDataType[] = [
    'string', 'text', 'number', 'integer', 'decimal',
    'boolean', 'date', 'datetime', 'timestamp',
    'enum', 'array', 'object', 'reference'
  ];

  // Stats
  const stats = {
    total: allProperties.length,
    required: allProperties.filter(p => p.required).length,
    indexed: allProperties.filter(p => p.indexed).length,
    shared: allProperties.filter(p => p.isShared).length,
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ontology-900 mb-1">Properties</h1>
          <p className="text-ontology-600">
            {filteredProperties.length} of {allProperties.length} properties across {dmos.length} object types
          </p>
        </div>
        <button onClick={handleAddProperty} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card hoverable={false}>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-ontology-900">{stats.total}</div>
            <div className="text-sm text-ontology-500">Total Properties</div>
          </div>
        </Card>
        <Card hoverable={false}>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.required}</div>
            <div className="text-sm text-ontology-500">Required</div>
          </div>
        </Card>
        <Card hoverable={false}>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-sf-blue-600">{stats.indexed}</div>
            <div className="text-sm text-ontology-500">Indexed</div>
          </div>
        </Card>
        <Card hoverable={false}>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.shared}</div>
            <div className="text-sm text-ontology-500">Shared</div>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ontology-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Data Type Filter */}
        <select
          value={filterDataType}
          onChange={e => setFilterDataType(e.target.value as PropertyDataType | 'all')}
          className="input w-36"
        >
          <option value="all">All Types</option>
          {dataTypes.map(dt => (
            <option key={dt} value={dt}>{dt}</option>
          ))}
        </select>

        {/* Required Filter */}
        <select
          value={filterRequired}
          onChange={e => setFilterRequired(e.target.value as typeof filterRequired)}
          className="input w-32"
        >
          <option value="all">All</option>
          <option value="required">Required</option>
          <option value="optional">Optional</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center border border-ontology-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('byObjectType')}
            className={clsx(
              'p-2 flex items-center gap-2 text-sm transition-colors',
              viewMode === 'byObjectType'
                ? 'bg-sf-blue-500 text-white'
                : 'bg-white text-ontology-600 hover:bg-ontology-50'
            )}
            title="Group by Object Type"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">By Object</span>
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={clsx(
              'p-2 flex items-center gap-2 text-sm transition-colors',
              viewMode === 'flat'
                ? 'bg-sf-blue-500 text-white'
                : 'bg-white text-ontology-600 hover:bg-ontology-50'
            )}
            title="Flat List"
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Flat</span>
          </button>
        </div>

        {/* Expand/Collapse All (only in grouped view) */}
        {viewMode === 'byObjectType' && (
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-sm text-sf-blue-600 hover:text-sf-blue-700"
            >
              Expand All
            </button>
            <span className="text-ontology-300">|</span>
            <button
              onClick={collapseAll}
              className="text-sm text-sf-blue-600 hover:text-sf-blue-700"
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredProperties.length === 0 && searchQuery ? (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-ontology-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ontology-700 mb-2">
            No properties found
          </h3>
          <p className="text-ontology-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : viewMode === 'byObjectType' ? (
        /* Grouped by Object Type View */
        <div className="space-y-4">
          {Object.entries(propertiesByObjectType).map(([objectId, { dmo, properties }]) => (
            <Card key={objectId} className="overflow-hidden">
              {/* Object Type Header */}
              <button
                onClick={() => toggleObjectExpansion(objectId)}
                className="w-full flex items-center gap-4 px-4 py-3 bg-ontology-50 hover:bg-ontology-100 transition-colors"
              >
                {expandedObjects.has(objectId) ? (
                  <ChevronDown className="w-5 h-5 text-ontology-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-ontology-500" />
                )}
                <IconBox name={dmo.icon} color={dmo.color} size="sm" />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ontology-900">
                      {dmo.displayName}
                    </span>
                    <Badge variant="gray">{properties.length} properties</Badge>
                    {dmo.source !== 'standard' && (
                      <Badge variant={dmo.source === 'custom' ? 'purple' : 'blue'}>
                        {dmo.source}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-ontology-500">{dmo.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddPropertyToObject(objectId);
                  }}
                  className="px-3 py-1 text-sm text-sf-blue-600 hover:text-sf-blue-700 hover:bg-sf-blue-50 rounded transition-colors"
                >
                  + Add Property
                </button>
              </button>

              {/* Properties List */}
              {expandedObjects.has(objectId) && (
                <div className="divide-y divide-ontology-100">
                  {properties.length === 0 ? (
                    <div className="px-4 py-8 text-center text-ontology-500">
                      <p>No properties match your filters</p>
                    </div>
                  ) : (
                    properties.map((prop, idx) => (
                      <div
                        key={`${prop.id}-${idx}`}
                        onClick={() => handleEditProperty(prop)}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-ontology-50 cursor-pointer transition-colors"
                      >
                        {/* Data Type Icon */}
                        <span
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${dataTypeColors[prop.dataType]}15`,
                            color: dataTypeColors[prop.dataType]
                          }}
                        >
                          {dataTypeIcons[prop.dataType]}
                        </span>

                        {/* Property Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-ontology-900">
                              {prop.displayName}
                            </span>
                            {prop.unique && <span title="Unique"><Key className="w-3 h-3 text-purple-500" /></span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-ontology-500">
                            <span className="font-mono">{prop.name}</span>
                            {prop.description && (
                              <>
                                <span>•</span>
                                <span className="truncate">{prop.description}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Data Type */}
                        <Badge variant="custom" color={dataTypeColors[prop.dataType]}>
                          {prop.dataType}
                        </Badge>

                        {/* Constraints */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {prop.required && (
                            <Badge variant="red">Required</Badge>
                          )}
                          {prop.indexed && (
                            <Badge variant="blue">Indexed</Badge>
                          )}
                          {prop.unique && (
                            <Badge variant="purple">Unique</Badge>
                          )}
                          {prop.isShared && (
                            <Badge variant="green">Shared</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        /* Flat List View */
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ontology-50 border-b border-ontology-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Property
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Object Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Data Type
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Constraints
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((prop, idx) => (
                <tr
                  key={`${prop.objectTypeId}-${prop.id}-${idx}`}
                  onClick={() => handleEditProperty(prop)}
                  className="border-b border-ontology-100 hover:bg-ontology-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{
                          backgroundColor: `${dataTypeColors[prop.dataType]}15`,
                          color: dataTypeColors[prop.dataType]
                        }}
                      >
                        {dataTypeIcons[prop.dataType]}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ontology-900">
                            {prop.displayName}
                          </span>
                          {prop.unique && <Key className="w-3 h-3 text-purple-500" />}
                        </div>
                        <span className="text-xs text-ontology-500 font-mono">
                          {prop.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/object-types/${prop.objectTypeId}`);
                      }}
                    >
                      <IconBox name={prop.objectTypeIcon} color={prop.objectTypeColor} size="sm" />
                      <span className="text-sm text-ontology-700">
                        {prop.objectTypeName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="custom" color={dataTypeColors[prop.dataType]}>
                      {prop.dataType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {prop.required && (
                        <Badge variant="red">Required</Badge>
                      )}
                      {prop.indexed && (
                        <Badge variant="blue">Indexed</Badge>
                      )}
                      {prop.unique && (
                        <Badge variant="purple">Unique</Badge>
                      )}
                      {prop.isShared && (
                        <Badge variant="green">Shared</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-ontology-600 line-clamp-1">
                      {prop.description}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Property Editor Modal */}
      <PropertyEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingProperty(null);
          setSelectedObjectType(null);
        }}
        property={editingProperty}
        objectTypeId={selectedObjectType}
      />
    </div>
  );
}

export default PropertiesPage;
