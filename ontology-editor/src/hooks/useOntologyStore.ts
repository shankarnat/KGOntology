import { create } from 'zustand';
import type { DMO, LinkType, Group, RecentlyViewed, DiscoverSection, OntologyConfig } from '@/types';
import { allDMOs, linkTypes, groups, defaultOntologyConfig } from '@/data';

interface OntologyState {
  // Data
  dmos: DMO[];
  linkTypes: LinkType[];
  groups: Group[];
  config: OntologyConfig;

  // UI State
  selectedDMO: DMO | null;
  selectedLinkType: LinkType | null;
  selectedGroup: Group | null;
  recentlyViewed: RecentlyViewed[];
  searchQuery: string;
  currentBranch: string;

  // Actions
  setSelectedDMO: (dmo: DMO | null) => void;
  setSelectedLinkType: (linkType: LinkType | null) => void;
  setSelectedGroup: (group: Group | null) => void;
  addToRecentlyViewed: (item: RecentlyViewed) => void;
  setSearchQuery: (query: string) => void;
  toggleDMOFavorite: (id: string) => void;
  toggleLinkTypeFavorite: (id: string) => void;
  toggleGroupFavorite: (id: string) => void;
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

  // Group Operations
  updateGroup: (id: string, updates: Partial<Group>) => void;
  addGroup: (group: Group) => void;
  deleteGroup: (id: string) => void;

  // Getters
  getDMOById: (id: string) => DMO | undefined;
  getLinkTypeById: (id: string) => LinkType | undefined;
  getGroupById: (id: string) => Group | undefined;
  getDMOsByGroup: (groupId: string) => DMO[];
  getLinkTypesByGroup: (groupId: string) => LinkType[];
  getFavoriteDMOs: () => DMO[];
  getProminentDMOs: () => DMO[];
  getFavoriteGroups: () => Group[];
  searchDMOs: (query: string) => DMO[];
  searchLinkTypes: (query: string) => LinkType[];
}

export const useOntologyStore = create<OntologyState>((set, get) => ({
  // Initial Data
  dmos: allDMOs,
  linkTypes: linkTypes,
  groups: groups,
  config: defaultOntologyConfig,

  // Initial UI State
  selectedDMO: null,
  selectedLinkType: null,
  selectedGroup: null,
  recentlyViewed: [],
  searchQuery: '',
  currentBranch: 'Main',

  // Actions
  setSelectedDMO: (dmo) => set({ selectedDMO: dmo }),
  setSelectedLinkType: (linkType) => set({ selectedLinkType: linkType }),
  setSelectedGroup: (group) => set({ selectedGroup: group }),

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

  toggleGroupFavorite: (id) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === id ? { ...g, isFavorite: !g.isFavorite } : g
    ),
  })),

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

  // Group Operations
  updateGroup: (id, updates) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === id ? { ...g, ...updates, lastModified: new Date().toISOString() } : g
    ),
  })),

  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group],
  })),

  deleteGroup: (id) => set((state) => ({
    groups: state.groups.filter((g) => g.id !== id),
  })),

  // Getters
  getDMOById: (id) => get().dmos.find((dmo) => dmo.id === id),

  getLinkTypeById: (id) => get().linkTypes.find((lt) => lt.id === id),

  getGroupById: (id) => get().groups.find((g) => g.id === id),

  getDMOsByGroup: (groupId) => get().dmos.filter((dmo) => dmo.groups.includes(groupId)),

  getLinkTypesByGroup: (groupId) => get().linkTypes.filter((lt) => lt.groups.includes(groupId)),

  getFavoriteDMOs: () => get().dmos.filter((dmo) => dmo.isFavorite),

  getProminentDMOs: () => get().dmos.filter((dmo) => dmo.isProminent),

  getFavoriteGroups: () => get().groups.filter((g) => g.isFavorite),

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
