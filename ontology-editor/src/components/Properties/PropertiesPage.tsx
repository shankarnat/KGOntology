import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronRight,
  Database,
  Key,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  List as ListIcon,
  Braces,
  Link2,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { Card, Badge, IconBox } from '@/components/common';
import { PropertyEditorModal } from './PropertyEditorModal';
import type { Property, PropertyDataType, DMO } from '@/types';

type SortBy = 'name' | 'dataType' | 'objectType';
type GroupBy = 'none' | 'objectType' | 'dataType';

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
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [filterDataType, setFilterDataType] = useState<PropertyDataType | 'all'>('all');
  const [filterRequired, setFilterRequired] = useState<'all' | 'required' | 'optional'>('all');
  const [filterIndexed, setFilterIndexed] = useState<'all' | 'indexed' | 'not-indexed'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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

  // Filter and sort properties
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

    // Indexed filter
    if (filterIndexed === 'indexed') {
      result = result.filter(p => p.indexed);
    } else if (filterIndexed === 'not-indexed') {
      result = result.filter(p => !p.indexed);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'dataType':
          return a.dataType.localeCompare(b.dataType);
        case 'objectType':
          return a.objectTypeName.localeCompare(b.objectTypeName);
        default:
          return 0;
      }
    });

    return result;
  }, [allProperties, searchQuery, sortBy, filterDataType, filterRequired, filterIndexed]);

  // Group properties
  const groupedProperties = useMemo(() => {
    if (groupBy === 'none') {
      return { '': filteredProperties };
    }

    const groups: Record<string, PropertyWithContext[]> = {};
    filteredProperties.forEach(prop => {
      const key = groupBy === 'objectType' ? prop.objectTypeName : prop.dataType;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(prop);
    });

    return groups;
  }, [filteredProperties, groupBy]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const handleEditProperty = (prop: PropertyWithContext) => {
    setEditingProperty(prop);
    setSelectedObjectType(prop.objectTypeId);
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
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-ontology-900">{stats.total}</div>
            <div className="text-sm text-ontology-500">Total Properties</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.required}</div>
            <div className="text-sm text-ontology-500">Required</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-sf-blue-600">{stats.indexed}</div>
            <div className="text-sm text-ontology-500">Indexed</div>
          </div>
        </Card>
        <Card>
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

        {/* Indexed Filter */}
        <select
          value={filterIndexed}
          onChange={e => setFilterIndexed(e.target.value as typeof filterIndexed)}
          className="input w-36"
        >
          <option value="all">All</option>
          <option value="indexed">Indexed</option>
          <option value="not-indexed">Not Indexed</option>
        </select>

        {/* Group By */}
        <select
          value={groupBy}
          onChange={e => setGroupBy(e.target.value as GroupBy)}
          className="input w-40"
        >
          <option value="none">No Grouping</option>
          <option value="objectType">Group by Object Type</option>
          <option value="dataType">Group by Data Type</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="input w-36"
        >
          <option value="name">Sort by Name</option>
          <option value="dataType">Sort by Type</option>
          <option value="objectType">Sort by Object</option>
        </select>
      </div>

      {/* Results */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-ontology-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ontology-700 mb-2">
            No properties found
          </h3>
          <p className="text-ontology-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          {Object.entries(groupedProperties).map(([groupKey, properties]) => (
            <div key={groupKey || 'ungrouped'}>
              {/* Group Header */}
              {groupBy !== 'none' && (
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-ontology-50 border-b border-ontology-200 hover:bg-ontology-100 transition-colors"
                >
                  {expandedGroups.has(groupKey) || expandedGroups.size === 0 ? (
                    <ChevronDown className="w-4 h-4 text-ontology-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-ontology-500" />
                  )}
                  {groupBy === 'dataType' && (
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${dataTypeColors[groupKey as PropertyDataType]}15`, color: dataTypeColors[groupKey as PropertyDataType] }}
                    >
                      {dataTypeIcons[groupKey as PropertyDataType]}
                    </span>
                  )}
                  <span className="font-semibold text-ontology-900">{groupKey}</span>
                  <Badge variant="gray">{properties.length}</Badge>
                </button>
              )}

              {/* Properties Table */}
              {(groupBy === 'none' || expandedGroups.has(groupKey) || expandedGroups.size === 0) && (
                <table className="w-full">
                  {groupBy === 'none' && (
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
                  )}
                  <tbody>
                    {properties.map((prop, idx) => (
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
              )}
            </div>
          ))}
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
