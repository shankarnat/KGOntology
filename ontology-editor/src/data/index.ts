export { standardDMOs } from './standardDMOs';
export { customDMOs } from './customDMOs';
export { linkTypes } from './linkTypes';
export { templates } from './templates';

import { standardDMOs } from './standardDMOs';
import { customDMOs } from './customDMOs';
import { linkTypes } from './linkTypes';
import { templates } from './templates';
import type { DMO, LinkType, Template, DiscoverSection, OntologyConfig } from '@/types';

// Backward compatibility alias
export { templates as groups };

// Combined DMOs
export const allDMOs: DMO[] = [...standardDMOs, ...customDMOs];

// Get DMO by ID
export function getDMOById(id: string): DMO | undefined {
  return allDMOs.find(dmo => dmo.id === id);
}

// Get Link Type by ID
export function getLinkTypeById(id: string): LinkType | undefined {
  return linkTypes.find(lt => lt.id === id);
}

// Get Template by ID
export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

// Backward compatibility alias
export const getGroupById = getTemplateById;

// Get DMOs by Template
export function getDMOsByTemplate(templateId: string): DMO[] {
  return allDMOs.filter(dmo => dmo.groups.includes(templateId));
}

// Backward compatibility alias
export const getDMOsByGroup = getDMOsByTemplate;

// Get Link Types by Template
export function getLinkTypesByTemplate(templateId: string): LinkType[] {
  return linkTypes.filter(lt => lt.groups.includes(templateId));
}

// Backward compatibility alias
export const getLinkTypesByGroup = getLinkTypesByTemplate;

// Get favorite DMOs
export function getFavoriteDMOs(): DMO[] {
  return allDMOs.filter(dmo => dmo.isFavorite);
}

// Get prominent DMOs
export function getProminentDMOs(): DMO[] {
  return allDMOs.filter(dmo => dmo.isProminent);
}

// Get favorite Link Types
export function getFavoriteLinkTypes(): LinkType[] {
  return linkTypes.filter(lt => lt.isFavorite);
}

// Get favorite Templates
export function getFavoriteTemplates(): Template[] {
  return templates.filter(t => t.isFavorite);
}

// Backward compatibility alias
export const getFavoriteGroups = getFavoriteTemplates;

// Default Discover sections
export const defaultDiscoverSections: DiscoverSection[] = [
  {
    id: 'recently_viewed',
    type: 'recently_viewed',
    title: 'Recently viewed object types',
    itemsPerSection: 6,
    order: 0,
    isVisible: true,
  },
  {
    id: 'favorites',
    type: 'favorites',
    title: 'Favorite object types',
    itemsPerSection: 6,
    order: 1,
    isVisible: true,
  },
  {
    id: 'favorite_templates',
    type: 'favorite_templates',
    title: 'Favorite templates',
    itemsPerSection: 6,
    order: 2,
    isVisible: true,
  },
];

// Default Ontology Config
export const defaultOntologyConfig: OntologyConfig = {
  name: 'Data Cloud RAG Ontology',
  description: 'Knowledge Graph Ontology for Deterministic RAG with Salesforce Data Cloud',
  version: '1.0.0',
  defaultBranch: 'main',
  discoverSections: defaultDiscoverSections,
  defaultItemsPerSection: 6,
  ragEnabled: true,
  defaultAuthorityHierarchy: ['engineering', 'product', 'marketing', 'support', 'external'],
  lastModified: '2024-01-17T14:00:00Z',
  modifiedBy: 'System',
};

// Stats
export const ontologyStats = {
  objectTypes: allDMOs.length,
  linkTypes: linkTypes.length,
  templates: templates.length,
  totalObjects: allDMOs.reduce((sum, dmo) => sum + dmo.objectCount, 0),
  totalLinks: linkTypes.reduce((sum, lt) => sum + lt.linkCount, 0),
  standardDMOs: standardDMOs.length,
  customDMOs: customDMOs.length,
  ragEnabledDMOs: allDMOs.filter(dmo => dmo.ragConfig?.includeInRetrieval).length,
};
