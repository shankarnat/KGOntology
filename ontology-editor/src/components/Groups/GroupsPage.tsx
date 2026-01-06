import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Star,
  Filter,
  Database,
  Link2,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { Card, CardBody, Badge, IconBox } from '@/components/common';

type SortBy = 'name' | 'memberCount' | 'lastModified';

export function GroupsPage() {
  const navigate = useNavigate();
  const { groups, dmos, linkTypes, toggleGroupFavorite } = useOntologyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    let result = [...groups];

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter(g => g.isFavorite);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        g =>
          g.name.toLowerCase().includes(query) ||
          g.displayName.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'memberCount':
          return b.memberCount - a.memberCount;
        case 'lastModified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [groups, searchQuery, sortBy, showFavoritesOnly]);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ontology-900 mb-1">Groups</h1>
          <p className="text-ontology-600">
            {filteredGroups.length} of {groups.length} groups
          </p>
        </div>
        <button
          onClick={() => navigate('/groups/new')}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Group</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ontology-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Favorites Toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={clsx(
            'btn',
            showFavoritesOnly ? 'btn-primary' : 'btn-secondary'
          )}
        >
          <Star className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
          <span>Favorites</span>
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="input w-44"
        >
          <option value="name">Sort by Name</option>
          <option value="memberCount">Sort by Members</option>
          <option value="lastModified">Sort by Modified</option>
        </select>
      </div>

      {/* Results */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-ontology-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ontology-700 mb-2">
            No groups found
          </h3>
          <p className="text-ontology-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map(group => {
            const groupDMOs = dmos.filter(d => d.groups.includes(group.id));
            const groupLinkTypes = linkTypes.filter(lt => lt.groups.includes(group.id));

            return (
              <Card
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="group h-full"
              >
                <CardBody className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <IconBox name={group.icon} color={group.color} size="md" />
                      <div>
                        <h3 className="font-semibold text-ontology-900">
                          {group.displayName}
                        </h3>
                        <p className="text-xs text-ontology-500">
                          {group.memberCount} members
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleGroupFavorite(group.id);
                      }}
                      className={clsx(
                        'p-1 rounded transition-all',
                        group.isFavorite
                          ? 'text-yellow-500'
                          : 'text-ontology-300 opacity-0 group-hover:opacity-100 hover:text-yellow-500'
                      )}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={group.isFavorite ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-ontology-600 mb-4 flex-1">
                    {group.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-ontology-500">
                    <div className="flex items-center gap-1">
                      <Database className="w-4 h-4" />
                      <span>{groupDMOs.length} object types</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link2 className="w-4 h-4" />
                      <span>{groupLinkTypes.length} link types</span>
                    </div>
                  </div>

                  {/* Preview of DMOs */}
                  {groupDMOs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-ontology-100">
                      <div className="flex flex-wrap gap-1">
                        {groupDMOs.slice(0, 4).map(dmo => (
                          <Badge
                            key={dmo.id}
                            variant="custom"
                            color={dmo.color}
                            dot
                          >
                            {dmo.displayName}
                          </Badge>
                        ))}
                        {groupDMOs.length > 4 && (
                          <Badge variant="gray">
                            +{groupDMOs.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GroupsPage;
