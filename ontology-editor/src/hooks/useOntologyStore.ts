import { create } from 'zustand';
import type { DMO, LinkType, Template, RecentlyViewed, DiscoverSection, OntologyConfig } from '@/types';
import { allDMOs, linkTypes, templates, defaultOntologyConfig } from '@/data';

interface OntologyState {
  // Data
  dmos: DMO[];
  linkTypes: LinkType[];
  templates: Template[];
  config: OntologyConfig;

  // Backward compatibility alias
  groups: Template[];

  // UI State
  selectedDMO: DMO | null;
  selectedLinkType: LinkType | null;
  selectedTemplate: Template | null;
  recentlyViewed: RecentlyViewed[];
  searchQuery: string;
  currentBranch: string;

  // Actions
  setSelectedDMO: (dmo: DMO | null) => void;
  setSelectedLinkType: (linkType: LinkType | null) => void;
  setSelectedTemplate: (template: Template | null) => void;
  addToRecentlyViewed: (item: RecentlyViewed) => void;
  setSearchQuery: (query: string) => void;
  toggleDMOFavorite: (id: string) => void;
  toggleLinkTypeFavorite: (id: string) => void;
  toggleTemplateFavorite: (id: string) => void;
  updateDiscoverSections: (sections: DiscoverSection[]) => void;
  setCurrentBranch: (branch: string) => void;

  // DMO Operations
  updateDMO: (id: string, updates: Partial<DMO>) => void;
  addDMO: (dmo: DMO) => void;
  deleteDMO: (id: string) => void;

  // Link Type Operations
  updateLinkType: (id: string, updates: Partial<LinkType>) => void;
  addLinkType: (linkType: LinkType) => void;
  deleteLinkType: (id: string) => void;

  // Template Operations
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;

  // Getters
  getDMOById: (id: string) => DMO | undefined;
  getLinkTypeById: (id: string) => LinkType | undefined;
  getTemplateById: (id: string) => Template | undefined;
  getDMOsByTemplate: (templateId: string) => DMO[];
  getLinkTypesByTemplate: (templateId: string) => LinkType[];
  getFavoriteDMOs: () => DMO[];
  getProminentDMOs: () => DMO[];
  getFavoriteTemplates: () => Template[];
  searchDMOs: (query: string) => DMO[];
  searchLinkTypes: (query: string) => LinkType[];

  // Backward compatibility aliases
  toggleGroupFavorite: (id: string) => void;
  getGroupById: (id: string) => Template | undefined;
  getDMOsByGroup: (groupId: string) => DMO[];
  getLinkTypesByGroup: (groupId: string) => LinkType[];
  getFavoriteGroups: () => Template[];
}

export const useOntologyStore = create<OntologyState>((set, get) => ({
  // Initial Data
  dmos: allDMOs,
  linkTypes: linkTypes,
  templates: templates,
  config: defaultOntologyConfig,

  // Backward compatibility alias
  groups: templates,

  // Initial UI State
  selectedDMO: null,
  selectedLinkType: null,
  selectedTemplate: null,
  recentlyViewed: [],
  searchQuery: '',
  currentBranch: 'Main',

  // Actions
  setSelectedDMO: (dmo) => set({ selectedDMO: dmo }),
  setSelectedLinkType: (linkType) => set({ selectedLinkType: linkType }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  addToRecentlyViewed: (item) => set((state) => {
    const filtered = state.recentlyViewed.filter(
      (rv) => !(rv.type === item.type && rv.id === item.id)
    );
    return {
      recentlyViewed: [item, ...filtered].slice(0, 32),
    };
  }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleDMOFavorite: (id) => set((state) => ({
    dmos: state.dmos.map((dmo) =>
      dmo.id === id ? { ...dmo, isFavorite: !dmo.isFavorite } : dmo
    ),
  })),

  toggleLinkTypeFavorite: (id) => set((state) => ({
    linkTypes: state.linkTypes.map((lt) =>
      lt.id === id ? { ...lt, isFavorite: !lt.isFavorite } : lt
    ),
  })),

  toggleTemplateFavorite: (id) => set((state) => ({
    templates: state.templates.map((t) =>
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ),
  })),

  // Backward compatibility alias
  toggleGroupFavorite: (id) => get().toggleTemplateFavorite(id),

  updateDiscoverSections: (sections) => set((state) => ({
    config: { ...state.config, discoverSections: sections },
  })),

  setCurrentBranch: (branch) => set({ currentBranch: branch }),

  // DMO Operations
  updateDMO: (id, updates) => set((state) => ({
    dmos: state.dmos.map((dmo) =>
      dmo.id === id ? { ...dmo, ...updates, lastModified: new Date().toISOString() } : dmo
    ),
  })),

  addDMO: (dmo) => set((state) => ({
    dmos: [...state.dmos, { ...dmo, createdAt: new Date().toISOString() }],
  })),

  deleteDMO: (id) => set((state) => ({
    dmos: state.dmos.filter((dmo) => dmo.id !== id),
  })),

  // Link Type Operations
  updateLinkType: (id, updates) => set((state) => ({
    linkTypes: state.linkTypes.map((lt) =>
      lt.id === id ? { ...lt, ...updates, lastModified: new Date().toISOString() } : lt
    ),
  })),

  addLinkType: (linkType) => set((state) => ({
    linkTypes: [...state.linkTypes, { ...linkType, createdAt: new Date().toISOString() }],
  })),

  deleteLinkType: (id) => set((state) => ({
    linkTypes: state.linkTypes.filter((lt) => lt.id !== id),
  })),

  // Template Operations
  updateTemplate: (id, updates) => set((state) => ({
    templates: state.templates.map((t) =>
      t.id === id ? { ...t, ...updates, lastModified: new Date().toISOString() } : t
    ),
  })),

  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template],
  })),

  deleteTemplate: (id) => set((state) => ({
    templates: state.templates.filter((t) => t.id !== id),
  })),

  // Getters
  getDMOById: (id) => get().dmos.find((dmo) => dmo.id === id),

  getLinkTypeById: (id) => get().linkTypes.find((lt) => lt.id === id),

  getTemplateById: (id) => get().templates.find((t) => t.id === id),

  getDMOsByTemplate: (templateId) => get().dmos.filter((dmo) => dmo.groups.includes(templateId)),

  getLinkTypesByTemplate: (templateId) => get().linkTypes.filter((lt) => lt.groups.includes(templateId)),

  getFavoriteDMOs: () => get().dmos.filter((dmo) => dmo.isFavorite),

  getProminentDMOs: () => get().dmos.filter((dmo) => dmo.isProminent),

  getFavoriteTemplates: () => get().templates.filter((t) => t.isFavorite),

  // Backward compatibility aliases
  getGroupById: (id) => get().getTemplateById(id),
  getDMOsByGroup: (templateId) => get().getDMOsByTemplate(templateId),
  getLinkTypesByGroup: (templateId) => get().getLinkTypesByTemplate(templateId),
  getFavoriteGroups: () => get().getFavoriteTemplates(),

  searchDMOs: (query) => {
    const q = query.toLowerCase();
    return get().dmos.filter(
      (dmo) =>
        dmo.name.toLowerCase().includes(q) ||
        dmo.displayName.toLowerCase().includes(q) ||
        dmo.description.toLowerCase().includes(q)
    );
  },

  searchLinkTypes: (query) => {
    const q = query.toLowerCase();
    return get().linkTypes.filter(
      (lt) =>
        lt.name.toLowerCase().includes(q) ||
        lt.displayName.toLowerCase().includes(q) ||
        lt.description.toLowerCase().includes(q)
    );
  },
}));

export default useOntologyStore;
