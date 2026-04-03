import { create } from 'zustand';
import type { Building, District, Dependency, Journey, VersionInfo, VersionData } from './data/types';
import { journeys as journeyData } from './data/city-data';

interface VersionState {
  // Available versions
  versions: VersionInfo[];
  versionsLoaded: boolean;

  // Current version data
  currentVersion: string;
  githubBase: string;
  buildings: Building[];
  districts: District[];
  dependencies: Dependency[];
  journeys: Journey[];
  loading: boolean;

  // Actions
  loadVersionList: () => Promise<void>;
  switchVersion: (version: string) => Promise<void>;
}

// Cache fetched version data to avoid re-fetching
const cache = new Map<string, VersionData>();

export const useVersionStore = create<VersionState>((set, get) => ({
  versions: [],
  versionsLoaded: false,

  currentVersion: '',
  githubBase: '',
  buildings: [],
  districts: [],
  dependencies: [],
  journeys: [],
  loading: true,

  loadVersionList: async () => {
    try {
      const res = await fetch('/versions/versions.json');
      const versions: VersionInfo[] = await res.json();
      set({ versions, versionsLoaded: true });
    } catch (e) {
      console.error('Failed to load versions list:', e);
    }
  },

  switchVersion: async (version: string) => {
    const { currentVersion } = get();
    if (version === currentVersion) return;

    set({ loading: true });

    try {
      let data: VersionData;

      if (cache.has(version)) {
        data = cache.get(version)!;
      } else {
        const res = await fetch(`/versions/city-data-${version}.json`);
        data = await res.json();
        cache.set(version, data);
      }

      // Journeys only work for v28.4 (they reference specific building IDs)
      const buildingIds = new Set(data.buildings.map((b) => b.id));
      const availableJourneys = version === 'v28.4'
        ? journeyData
        : journeyData.filter((j) =>
            j.stops.every((s) => buildingIds.has(s.buildingId))
          );

      set({
        currentVersion: version,
        githubBase: data.github_base,
        buildings: data.buildings,
        districts: data.districts,
        dependencies: data.dependencies,
        journeys: availableJourneys,
        loading: false,
      });
    } catch (e) {
      console.error(`Failed to load version ${version}:`, e);
      set({ loading: false });
    }
  },
}));
