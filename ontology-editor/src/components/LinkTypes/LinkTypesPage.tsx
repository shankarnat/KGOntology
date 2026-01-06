import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Star,
  ArrowRight,
  Filter,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { Card, CardBody, Badge, IconBox } from '@/components/common';
import { LinkTypeEditorModal } from './LinkTypeEditorModal';
import type { LinkCardinality } from '@/types';

type SortBy = 'name' | 'linkCount' | 'lastModified';

export function LinkTypesPage() {
  const navigate = useNavigate();
  const { linkTypes, groups, toggleLinkTypeFavorite, getDMOById } = useOntologyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterCardinality, setFilterCardinality] = useState<LinkCardinality | 'all'>('all');
  const [filterGroup, setFilterGroup] = useState<string | 'all'>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Filter and sort link types
  const filteredLinkTypes = useMemo(() => {
    let result = [...linkTypes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        lt =>
          lt.name.toLowerCase().includes(query) ||
          lt.displayName.toLowerCase().includes(query) ||
          lt.description.toLowerCase().includes(query)
      );
    }

    // Cardinality filter
    if (filterCardinality !== 'all') {
      result = result.filter(lt => lt.cardinality === filterCardinality);
    }

    // Group filter
    if (filterGroup !== 'all') {
      result = result.filter(lt => lt.groups.includes(filterGroup));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'linkCount':
          return b.linkCount - a.linkCount;
        case 'lastModified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [linkTypes, searchQuery, sortBy, filterCardinality, filterGroup]);

  const cardinalities: (LinkCardinality | 'all')[] = [
    'all',
    'one-to-one',
    'one-to-many',
    'many-to-one',
    'many-to-many',
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ontology-900 mb-1">Link Types</h1>
          <p className="text-ontology-600">
            {filteredLinkTypes.length} of {linkTypes.length} link types (edges)
          </p>
        </div>
        <button
          onClick={() => setIsEditorOpen(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Link Type</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ontology-400" />
          <input
            type="text"
            placeholder="Search link types..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Cardinality Filter */}
        <select
          value={filterCardinality}
          onChange={e => setFilterCardinality(e.target.value as LinkCardinality | 'all')}
          className="input w-44"
        >
          {cardinalities.map(card => (
            <option key={card} value={card}>
              {card === 'all' ? 'All Cardinalities' : card}
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
          <option value="linkCount">Sort by Count</option>
          <option value="lastModified">Sort by Modified</option>
        </select>
      </div>

      {/* Results */}
      {filteredLinkTypes.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-ontology-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ontology-700 mb-2">
            No link types found
          </h3>
          <p className="text-ontology-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinkTypes.map(lt => {
            const sourceDMO = getDMOById(lt.sourceObjectType);
            const targetDMO = getDMOById(lt.targetObjectType);

            return (
              <Card
                key={lt.id}
                onClick={() => navigate(`/link-types/${lt.id}`)}
                className="group"
              >
                <CardBody>
                  <div className="flex items-center gap-6">
                    {/* Link visualization */}
                    <div className="flex items-center gap-3 flex-1">
                      {/* Source */}
                      <div className="flex items-center gap-2">
                        {sourceDMO && (
                          <IconBox
                            name={sourceDMO.icon}
                            color={sourceDMO.color}
                            size="sm"
                          />
                        )}
                        <span className="text-sm font-medium text-ontology-700">
                          {sourceDMO?.displayName || lt.sourceObjectType}
                        </span>
                      </div>

                      {/* Arrow with link name */}
                      <div className="flex-1 flex items-center gap-2">
                        <div
                          className={clsx(
                            'flex-1 h-0.5',
                            lt.lineStyle === 'dashed' && 'border-t-2 border-dashed',
                            lt.lineStyle === 'dotted' && 'border-t-2 border-dotted',
                            lt.lineStyle === 'solid' && ''
                          )}
                          style={{
                            backgroundColor: lt.lineStyle === 'solid' ? lt.color : 'transparent',
                            borderColor: lt.color,
                          }}
                        />
                        <div
                          className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: `${lt.color}15`,
                            color: lt.color,
                          }}
                        >
                          {lt.displayName}
                        </div>
                        <div
                          className={clsx(
                            'flex-1 h-0.5',
                            lt.lineStyle === 'dashed' && 'border-t-2 border-dashed',
                            lt.lineStyle === 'dotted' && 'border-t-2 border-dotted',
                            lt.lineStyle === 'solid' && ''
                          )}
                          style={{
                            backgroundColor: lt.lineStyle === 'solid' ? lt.color : 'transparent',
                            borderColor: lt.color,
                          }}
                        />
                        <ArrowRight className="w-4 h-4" style={{ color: lt.color }} />
                      </div>

                      {/* Target */}
                      <div className="flex items-center gap-2">
                        {targetDMO && (
                          <IconBox
                            name={targetDMO.icon}
                            color={targetDMO.color}
                            size="sm"
                          />
                        )}
                        <span className="text-sm font-medium text-ontology-700">
                          {targetDMO?.displayName || lt.targetObjectType}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4">
                      <Badge variant="gray">{lt.cardinality}</Badge>
                      <div className="text-sm text-ontology-500 w-24 text-right">
                        {lt.linkCount.toLocaleString()} links
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleLinkTypeFavorite(lt.id);
                        }}
                        className={clsx(
                          'p-1 rounded transition-all',
                          lt.isFavorite
                            ? 'text-yellow-500'
                            : 'text-ontology-300 opacity-0 group-hover:opacity-100 hover:text-yellow-500'
                        )}
                      >
                        <Star
                          className="w-4 h-4"
                          fill={lt.isFavorite ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-ontology-500 mt-2 pl-11">
                    {lt.description}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Link Type Editor Modal */}
      <LinkTypeEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}

export default LinkTypesPage;
