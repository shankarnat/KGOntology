import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import type { Template } from '@/types';
import { Card, CardBody, IconBox } from '@/components/common';
import { useOntologyStore } from '@/hooks/useOntologyStore';

interface TemplateCardProps {
  template: Template;
  showPreview?: boolean;
}

export function TemplateCard({ template, showPreview = true }: TemplateCardProps) {
  const navigate = useNavigate();
  const { toggleTemplateFavorite, dmos } = useOntologyStore();

  const handleClick = () => {
    navigate(`/templates/${template.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTemplateFavorite(template.id);
  };

  // Get preview of DMOs in this template
  const templateDMOs = dmos.filter(dmo => dmo.groups.includes(template.id)).slice(0, 4);

  return (
    <Card onClick={handleClick} className="relative group h-full">
      <CardBody className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconBox name={template.icon} color={template.color} size="sm" />
            <div>
              <h3 className="font-semibold text-ontology-900 text-sm">
                {template.displayName}
              </h3>
              <p className="text-xs text-ontology-500">
                {template.memberCount} items
              </p>
            </div>
          </div>
          <button
            onClick={handleFavoriteClick}
            className={clsx(
              'p-1 rounded transition-all',
              template.isFavorite
                ? 'text-yellow-500'
                : 'text-ontology-300 opacity-0 group-hover:opacity-100 hover:text-yellow-500'
            )}
          >
            <Star
              className="w-4 h-4"
              fill={template.isFavorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Preview of DMOs */}
        {showPreview && templateDMOs.length > 0 && (
          <div className="flex-1 mb-3">
            <div className="flex flex-wrap gap-2">
              {templateDMOs.map(dmo => (
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
          {template.description}
        </p>

        {/* Footer Link */}
        <div className="flex items-center text-xs text-sf-blue-600 font-medium group-hover:text-sf-blue-700">
          <span>View template</span>
          <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
        </div>
      </CardBody>
    </Card>
  );
}

// Backward compatibility alias
export const GroupCard = TemplateCard;

export default TemplateCard;
