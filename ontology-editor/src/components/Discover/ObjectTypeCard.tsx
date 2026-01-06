import { useNavigate } from 'react-router-dom';
import { Star, List } from 'lucide-react';
import clsx from 'clsx';
import type { DMO } from '@/types';
import { Card, CardBody, Badge, IconBox } from '@/components/common';
import { useOntologyStore } from '@/hooks/useOntologyStore';

interface ObjectTypeCardProps {
  dmo: DMO;
  showGroups?: boolean;
}

export function ObjectTypeCard({ dmo, showGroups = true }: ObjectTypeCardProps) {
  const navigate = useNavigate();
  const { toggleDMOFavorite, addToRecentlyViewed, groups } = useOntologyStore();

  const handleClick = () => {
    addToRecentlyViewed({
      type: 'dmo',
      id: dmo.id,
      name: dmo.displayName,
      icon: dmo.icon,
      color: dmo.color,
      viewedAt: new Date().toISOString(),
    });
    navigate(`/object-types/${dmo.id}`);
  };

  const handlePropertiesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/object-types/${dmo.id}#properties`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleDMOFavorite(dmo.id);
  };

  // Get group info
  const dmoGroups = groups.filter(g => dmo.groups.includes(g.id));

  return (
    <Card
      onClick={handleClick}
      className="relative group"
    >
      <CardBody>
        {/* Header with Icon and Favorite */}
        <div className="flex items-start justify-between mb-3">
          <IconBox name={dmo.icon} color={dmo.color} size="md" />
          <div className="flex items-center gap-1">
            <button
              onClick={handlePropertiesClick}
              className="p-1 rounded text-ontology-300 opacity-0 group-hover:opacity-100 hover:text-sf-blue-500 transition-all"
              title="View properties"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={handleFavoriteClick}
              className={clsx(
                'p-1 rounded transition-all',
                dmo.isFavorite
                  ? 'text-yellow-500'
                  : 'text-ontology-300 opacity-0 group-hover:opacity-100 hover:text-yellow-500'
              )}
            >
              <Star
                className="w-4 h-4"
                fill={dmo.isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Title and Object Count */}
        <div className="mb-2">
          <h3 className="font-semibold text-ontology-900 text-sm">
            {dmo.displayName}
          </h3>
          <p className="text-xs text-ontology-500">
            {dmo.objectCount.toLocaleString()} objects • {dmo.properties.length} properties
          </p>
        </div>

        {/* Dependent Count */}
        <p className="text-xs text-sf-blue-600 mb-3">
          {dmo.dependentCount} dependents
          {dmo.isProminent && <span className="text-ontology-400"> • Prominent</span>}
        </p>

        {/* Groups */}
        {showGroups && dmoGroups.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dmoGroups.slice(0, 2).map(group => (
              <Badge key={group.id} variant="custom" color={group.color} dot>
                {group.displayName}
              </Badge>
            ))}
            {dmoGroups.length > 2 && (
              <Badge variant="gray">+{dmoGroups.length - 2}</Badge>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-ontology-600 line-clamp-2">
          {dmo.description}
        </p>

        {/* Source Badge */}
        {dmo.source !== 'standard' && (
          <div className="mt-3">
            <Badge
              variant={dmo.source === 'custom' ? 'purple' : 'blue'}
            >
              {dmo.source === 'custom' ? 'Custom DMO' : 'Embellished'}
            </Badge>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default ObjectTypeCard;
