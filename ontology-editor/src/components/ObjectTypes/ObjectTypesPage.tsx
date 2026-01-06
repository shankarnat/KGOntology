import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Star,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { ObjectTypeCard } from '@/components/Discover';
import { Card, Badge, IconBox } from '@/components/common';
import type { DMOCategory, DMOSource } from '@/types';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'objectCount' | 'lastModified';

export function ObjectTypesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dmos, groups } = useOntologyStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterCategory, setFilterCategory] = useState<DMOCategory | 'all'>('all');
  const [filterSource, setFilterSource] = useState<DMOSource | 'all'>('all');
  const [filterGroup, setFilterGroup] = useState<string | 'all'>('all');

  // Get filter from URL params
  const urlFilter = searchParams.get('filter');

  // Filter and sort DMOs
  const filteredDMOs = useMemo(() => {
    let result = [...dmos];

    // URL filter
    if (urlFilter === 'favorites') {
      result = result.filter(d => d.isFavorite);
    } else if (urlFilter === 'prominent') {
      result = result.filter(d => d.isProminent);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(query) ||
          d.displayName.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(d => d.category === filterCategory);
    }

    // Source filter
    if (filterSource !== 'all') {
      result = result.filter(d => d.source === filterSource);
    }

    // Group filter
    if (filterGroup !== 'all') {
      result = result.filter(d => d.groups.includes(filterGroup));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'objectCount':
          return b.objectCount - a.objectCount;
        case 'lastModified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [dmos, searchQuery, sortBy, filterCategory, filterSource, filterGroup, urlFilter]);

  const categories: (DMOCategory | 'all')[] = ['all', 'individual', 'party', 'product', 'engagement', 'case', 'custom'];
  const sources: (DMOSource | 'all')[] = ['all', 'standard', 'embellished', 'custom'];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ontology-900 mb-1">
            Object Types
            {urlFilter && (
              <Badge variant="blue" className="ml-3 text-sm">
                {urlFilter === 'favorites' ? 'Favorites' : 'Prominent'}
              </Badge>
            )}
          </h1>
          <p className="text-ontology-600">
            {filteredDMOs.length} of {dmos.length} object types
          </p>
        </div>
        <button
          onClick={() => navigate('/object-types/new')}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Object Type</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ontology-400" />
          <input
            type="text"
            placeholder="Search object types..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as DMOCategory | 'all')}
          className="input w-40"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Source Filter */}
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value as DMOSource | 'all')}
          className="input w-40"
        >
          {sources.map(src => (
            <option key={src} value={src}>
              {src === 'all' ? 'All Sources' : src.charAt(0).toUpperCase() + src.slice(1)}
            </option>
          ))}
        </select>

        {/* Group Filter */}
        <select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          className="input w-48"
        >
          <option value="all">All Groups</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.displayName}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="input w-40"
        >
          <option value="name">Sort by Name</option>
          <option value="objectCount">Sort by Count</option>
          <option value="lastModified">Sort by Modified</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center border border-ontology-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-sf-blue-500 text-white'
                : 'bg-white text-ontology-600 hover:bg-ontology-50'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-sf-blue-500 text-white'
                : 'bg-white text-ontology-600 hover:bg-ontology-50'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {filteredDMOs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-ontology-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-ontology-700 mb-2">
            No object types found
          </h3>
          <p className="text-ontology-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDMOs.map(dmo => (
            <ObjectTypeCard key={dmo.id} dmo={dmo} />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ontology-50 border-b border-ontology-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Object Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Source
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Objects
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Dependents
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ontology-600 uppercase">
                  Groups
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDMOs.map(dmo => (
                <tr
                  key={dmo.id}
                  onClick={() => navigate(`/object-types/${dmo.id}`)}
                  className="border-b border-ontology-100 hover:bg-ontology-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <IconBox name={dmo.icon} color={dmo.color} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ontology-900">
                            {dmo.displayName}
                          </span>
                          {dmo.isFavorite && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          )}
                          {dmo.isProminent && (
                            <TrendingUp className="w-3 h-3 text-sf-blue-500" />
                          )}
                        </div>
                        <span className="text-xs text-ontology-500">
                          {dmo.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="gray">
                      {dmo.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        dmo.source === 'standard'
                          ? 'blue'
                          : dmo.source === 'embellished'
                          ? 'green'
                          : 'purple'
                      }
                    >
                      {dmo.source}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-ontology-700">
                    {dmo.objectCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-sf-blue-600">
                    {dmo.dependentCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {dmo.groups.slice(0, 2).map(groupId => {
                        const group = groups.find(g => g.id === groupId);
                        return group ? (
                          <Badge
                            key={groupId}
                            variant="custom"
                            color={group.color}
                            dot
                          >
                            {group.displayName}
                          </Badge>
                        ) : null;
                      })}
                      {dmo.groups.length > 2 && (
                        <Badge variant="gray">+{dmo.groups.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default ObjectTypesPage;
