import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Star,
  Filter,
  Database,
  Link2,
  Layout,
  Briefcase,
  Lightbulb,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import { useOntologyStore } from '@/hooks/useOntologyStore';
import { Card, CardBody, Badge, IconBox } from '@/components/common';
import type { TemplateCategory } from '@/types';

type SortBy = 'name' | 'memberCount' | 'lastModified';

const categoryInfo: Record<TemplateCategory, { label: string; icon: React.ReactNode; color: string }> = {
  starter: { label: 'Starter', icon: <Layout className="w-4 h-4" />, color: '#0176d3' },
  industry: { label: 'Industry', icon: <Briefcase className="w-4 h-4" />, color: '#9050e9' },
  'use-case': { label: 'Use Case', icon: <Lightbulb className="w-4 h-4" />, color: '#0ea5e9' },
  custom: { label: 'Custom', icon: <User className="w-4 h-4" />, color: '#64748b' },
};

export function TemplatesPage() {
  const navigate = useNavigate();
  const { templates, dmos, linkTypes, toggleTemplateFavorite } = useOntologyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter(t => t.isFavorite);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.displayName.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
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
  }, [templates, searchQuery, sortBy, showFavoritesOnly, categoryFilter]);

  // Group by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredTemplates> = {};
    for (const template of filteredTemplates) {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    }
    return grouped;
  }, [filteredTemplates]);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ontology-900 mb-1">Templates</h1>
          <p className="text-ontology-600">
            Pre-configured sets of object types and links for common use cases.
            {' '}{filteredTemplates.length} of {templates.length} templates
          </p>
        </div>
        <button
          onClick={() => navigate('/templates/new')}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-sf-blue-50 border border-sf-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-sf-blue-900 mb-1">What are Templates?</h3>
        <p className="text-sm text-sf-blue-700">
          Templates are pre-built collections of object types, properties, and links that help you quickly set up
          common ontology patterns. Apply a template to instantly add related entities and relationships to your ontology.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ontology-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as TemplateCategory | 'all')}
          className="input w-40"
        >
          <option value="all">All Categories</option>
          <option value="starter">Starter</option>
          <option value="use-case">Use Case</option>
          <option value="industry">Industry</option>
          <option value="custom">Custom</option>
        </select>

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
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-ontology-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ontology-700 mb-2">
            No templates found
          </h3>
          <p className="text-ontology-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : categoryFilter === 'all' ? (
        // Show grouped by category
        <div className="space-y-8">
          {(['starter', 'use-case', 'industry', 'custom'] as TemplateCategory[]).map(category => {
            const categoryTemplates = templatesByCategory[category];
            if (!categoryTemplates?.length) return null;

            const info = categoryInfo[category];
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-ontology-500">{info.icon}</span>
                  <h2 className="text-lg font-semibold text-ontology-800">
                    {info.label} Templates
                  </h2>
                  <Badge variant="gray">{categoryTemplates.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      dmos={dmos}
                      linkTypes={linkTypes}
                      onFavoriteToggle={toggleTemplateFavorite}
                      onNavigate={navigate}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Show flat list
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              dmos={dmos}
              linkTypes={linkTypes}
              onFavoriteToggle={toggleTemplateFavorite}
              onNavigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: {
    id: string;
    displayName: string;
    description: string;
    icon: string;
    color: string;
    category: TemplateCategory;
    objectTypes: string[];
    linkTypes: string[];
    isFavorite: boolean;
    isBuiltIn: boolean;
  };
  dmos: { id: string; displayName: string; color: string; groups: string[] }[];
  linkTypes: { id: string; groups: string[] }[];
  onFavoriteToggle: (id: string) => void;
  onNavigate: (path: string) => void;
}

function TemplateCard({ template, dmos, linkTypes, onFavoriteToggle, onNavigate }: TemplateCardProps) {
  const templateDMOs = dmos.filter(d => d.groups.includes(template.id));
  const templateLinkTypes = linkTypes.filter(lt => lt.groups.includes(template.id));
  const info = categoryInfo[template.category];

  return (
    <Card
      onClick={() => onNavigate(`/templates/${template.id}`)}
      className="group h-full"
    >
      <CardBody className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconBox name={template.icon} color={template.color} size="md" />
            <div>
              <h3 className="font-semibold text-ontology-900">
                {template.displayName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="custom"
                  color={info.color}
                >
                  {info.label}
                </Badge>
                {template.isBuiltIn && (
                  <Badge variant="gray">Built-in</Badge>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              onFavoriteToggle(template.id);
            }}
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

        {/* Description */}
        <p className="text-sm text-ontology-600 mb-4 flex-1 line-clamp-2">
          {template.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-ontology-500 mb-4">
          <div className="flex items-center gap-1">
            <Database className="w-4 h-4" />
            <span>{templateDMOs.length} object types</span>
          </div>
          <div className="flex items-center gap-1">
            <Link2 className="w-4 h-4" />
            <span>{templateLinkTypes.length} links</span>
          </div>
        </div>

        {/* Preview of DMOs */}
        {templateDMOs.length > 0 && (
          <div className="pt-4 border-t border-ontology-100">
            <div className="flex flex-wrap gap-1">
              {templateDMOs.slice(0, 4).map(dmo => (
                <Badge
                  key={dmo.id}
                  variant="custom"
                  color={dmo.color}
                  dot
                >
                  {dmo.displayName}
                </Badge>
              ))}
              {templateDMOs.length > 4 && (
                <Badge variant="gray">
                  +{templateDMOs.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default TemplatesPage;
