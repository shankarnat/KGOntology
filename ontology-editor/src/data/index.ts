export { standardDMOs } from './standardDMOs';
export { customDMOs } from './customDMOs';
export { linkTypes } from './linkTypes';
export { groups } from './groups';

import { standardDMOs } from './standardDMOs';
import { customDMOs } from './customDMOs';
import { linkTypes } from './linkTypes';
import { groups } from './groups';
import type { DMO, LinkType, Group, DiscoverSection, OntologyConfig } from '@/types';

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

// Get Group by ID
export function getGroupById(id: string): Group | undefined {
  return groups.find(g => g.id === id);
}

// Get DMOs by Group
export function getDMOsByGroup(groupId: string): DMO[] {
  return allDMOs.filter(dmo => dmo.groups.includes(groupId));
}

// Get Link Types by Group
export function getLinkTypesByGroup(groupId: string): LinkType[] {
  return linkTypes.filter(lt => lt.groups.includes(groupId));
}

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

// Get favorite Groups
export function getFavoriteGroups(): Group[] {
  return groups.filter(g => g.isFavorite);
}

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
    id: 'favorite_groups',
    type: 'favorite_groups',
    title: 'Favorite groups',
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
  groups: groups.length,
  totalObjects: allDMOs.reduce((sum, dmo) => sum + dmo.objectCount, 0),
  totalLinks: linkTypes.reduce((sum, lt) => sum + lt.linkCount, 0),
  standardDMOs: standardDMOs.length,
  customDMOs: customDMOs.length,
  ragEnabledDMOs: allDMOs.filter(dmo => dmo.ragConfig?.includeInRetrieval).length,
};
