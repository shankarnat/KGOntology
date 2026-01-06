import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import type { Group } from '@/types';
import { Card, CardBody, IconBox } from '@/components/common';
import { useOntologyStore } from '@/hooks/useOntologyStore';

interface GroupCardProps {
  group: Group;
  showPreview?: boolean;
}

export function GroupCard({ group, showPreview = true }: GroupCardProps) {
  const navigate = useNavigate();
  const { toggleGroupFavorite, getDMOsByGroup, dmos } = useOntologyStore();

  const handleClick = () => {
    navigate(`/groups/${group.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleGroupFavorite(group.id);
  };

  // Get preview of DMOs in this group
  const groupDMOs = dmos.filter(dmo => dmo.groups.includes(group.id)).slice(0, 4);

  return (
    <Card onClick={handleClick} className="relative group h-full">
      <CardBody className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconBox name={group.icon} color={group.color} size="sm" />
            <div>
              <h3 className="font-semibold text-ontology-900 text-sm">
                {group.displayName}
              </h3>
              <p className="text-xs text-ontology-500">
                {group.memberCount} items
              </p>
            </div>
          </div>
          <button
            onClick={handleFavoriteClick}
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

        {/* Preview of DMOs */}
        {showPreview && groupDMOs.length > 0 && (
          <div className="flex-1 mb-3">
            <div className="flex flex-wrap gap-2">
              {groupDMOs.map(dmo => (
                <div
                  key={dmo.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-ontology-50 text-xs"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: dmo.color }}
                  />
                  <span className="text-ontology-700 truncate max-w-[80px]">
                    {dmo.displayName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-ontology-600 line-clamp-2 mb-3">
          {group.description}
        </p>

        {/* Footer Link */}
        <div className="flex items-center text-xs text-sf-blue-600 font-medium group-hover:text-sf-blue-700">
          <span>View group</span>
          <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
        </div>
      </CardBody>
    </Card>
  );
}

export default GroupCard;
