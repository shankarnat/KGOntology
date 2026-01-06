import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  ArrowRight,
  Clock,
  Star,
  Grid3X3,
  TrendingUp,
} from 'lucide-react';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { ObjectTypeCard } from './ObjectTypeCard';
import { TemplateCard } from './TemplateCard';
import { CustomizeModal } from './CustomizeModal';

interface SectionHeaderProps {
  title: string;
  count?: number;
  icon?: React.ReactNode;
  onConfigureClick?: () => void;
  onSeeAllClick?: () => void;
}

function SectionHeader({
  title,
  count,
  icon,
  onConfigureClick,
  onSeeAllClick,
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-title">
        {icon}
        <span>{title}</span>
        {count !== undefined && (
          <span className="section-count">{count}</span>
        )}
      </div>
      <div className="section-actions">
        {onConfigureClick && (
          <button onClick={onConfigureClick} className="link-action">
            <Settings2 className="w-4 h-4" />
            <span>Configure</span>
          </button>
        )}
        {onSeeAllClick && (
          <button onClick={onSeeAllClick} className="link-action">
            <span>See all</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function DiscoverPage() {
  const navigate = useNavigate();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const {
    dmos,
    templates,
    recentlyViewed,
    getFavoriteDMOs,
    getProminentDMOs,
    getFavoriteTemplates,
    config,
  } = useOntologyStore();

  const favoriteDMOs = getFavoriteDMOs();
  const prominentDMOs = getProminentDMOs();
  const favoriteTemplates = getFavoriteTemplates();

  // Get recently viewed DMOs
  const recentlyViewedDMOs = recentlyViewed
    .filter(rv => rv.type === 'dmo')
    .slice(0, config.defaultItemsPerSection)
    .map(rv => dmos.find(dmo => dmo.id === rv.id))
    .filter(Boolean);

  // If no recently viewed, show prominent DMOs
  const displayRecentOrProminent =
    recentlyViewedDMOs.length > 0 ? recentlyViewedDMOs : prominentDMOs;
  const recentOrProminentTitle =
    recentlyViewedDMOs.length > 0
      ? 'Recently viewed object types'
      : 'Object types recently modified';

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ontology-900 mb-2">Discover</h1>
        <p className="text-ontology-600">
          Explore object types, templates, and relationships in your Data Cloud ontology.
        </p>
      </div>

      {/* Recently Viewed / Recently Modified Section */}
      <section className="mb-10">
        <SectionHeader
          title={recentOrProminentTitle}
          count={displayRecentOrProminent.length}
          icon={<Clock className="w-4 h-4 text-ontology-400" />}
          onConfigureClick={() => setIsCustomizeOpen(true)}
          onSeeAllClick={() => navigate('/object-types')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayRecentOrProminent.slice(0, config.defaultItemsPerSection).map(dmo => (
            dmo && <ObjectTypeCard key={dmo.id} dmo={dmo} />
          ))}
        </div>
      </section>

      {/* Favorite Object Types Section */}
      {favoriteDMOs.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Favorite object types"
            count={favoriteDMOs.length}
            icon={<Star className="w-4 h-4 text-yellow-500" />}
            onConfigureClick={() => setIsCustomizeOpen(true)}
            onSeeAllClick={() => navigate('/object-types?filter=favorites')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteDMOs.slice(0, config.defaultItemsPerSection).map(dmo => (
              <ObjectTypeCard key={dmo.id} dmo={dmo} />
            ))}
          </div>
        </section>
      )}

      {/* Prominent Object Types Section */}
      {prominentDMOs.length > 0 && recentlyViewedDMOs.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Prominent object types"
            count={prominentDMOs.length}
            icon={<TrendingUp className="w-4 h-4 text-ontology-400" />}
            onConfigureClick={() => setIsCustomizeOpen(true)}
            onSeeAllClick={() => navigate('/object-types?filter=prominent')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prominentDMOs.slice(0, config.defaultItemsPerSection).map(dmo => (
              <ObjectTypeCard key={dmo.id} dmo={dmo} />
            ))}
          </div>
        </section>
      )}

      {/* Favorite Templates Section */}
      {favoriteTemplates.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Favorite templates"
            count={favoriteTemplates.length}
            icon={<Grid3X3 className="w-4 h-4 text-ontology-400" />}
            onConfigureClick={() => setIsCustomizeOpen(true)}
            onSeeAllClick={() => navigate('/templates?filter=favorites')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteTemplates.slice(0, config.defaultItemsPerSection).map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
      )}

      {/* RAG Knowledge Graph Template Section */}
      {templates.some(t => t.id === 'rag_knowledge_graph') && (
        <section className="mb-10">
          <SectionHeader
            title="RAG Knowledge Graph"
            count={dmos.filter(d => d.groups.includes('rag_knowledge_graph')).length}
            icon={
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#0ea5e9' }}
              />
            }
            onConfigureClick={() => setIsCustomizeOpen(true)}
            onSeeAllClick={() => navigate('/templates/rag_knowledge_graph')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dmos
              .filter(d => d.groups.includes('rag_knowledge_graph'))
              .slice(0, config.defaultItemsPerSection)
              .map(dmo => (
                <ObjectTypeCard key={dmo.id} dmo={dmo} showGroups={false} />
              ))}
          </div>
        </section>
      )}

      {/* Customize Modal */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />
    </div>
  );
}

export default DiscoverPage;
