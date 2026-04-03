import { create } from 'zustand';

interface AppState {
  // Selection
  selectedBuilding: string | null;
  selectBuilding: (id: string | null) => void;

  // Journey
  activeJourney: string | null;
  currentStop: number;
  journeyPlaying: boolean;
  startJourney: (id: string) => void;
  exitJourney: () => void;
  nextStop: () => void;
  prevStop: () => void;
  setPlaying: (playing: boolean) => void;

  // Camera target (building id to fly to)
  cameraTarget: string | null;
  setCameraTarget: (id: string | null) => void;

  // District visibility
  hiddenDistricts: Set<string>;
  toggleDistrict: (id: string) => void;

  // UI panels
  journeyPanelOpen: boolean;
  setJourneyPanelOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedBuilding: null,
  selectBuilding: (id) => set({ selectedBuilding: id }),

  activeJourney: null,
  currentStop: 0,
  journeyPlaying: false,
  startJourney: (id) => set({ activeJourney: id, currentStop: 0, journeyPlaying: true, journeyPanelOpen: true }),
  exitJourney: () => set({ activeJourney: null, currentStop: 0, journeyPlaying: false }),
  nextStop: () => set((s) => ({ currentStop: s.currentStop + 1, journeyPlaying: true })),
  prevStop: () => set((s) => ({ currentStop: Math.max(0, s.currentStop - 1), journeyPlaying: true })),
  setPlaying: (playing) => set({ journeyPlaying: playing }),

  cameraTarget: null,
  setCameraTarget: (id) => set({ cameraTarget: id }),

  hiddenDistricts: new Set(['test', 'bench', 'gui', 'other']),
  toggleDistrict: (id) => set((s) => {
    const next = new Set(s.hiddenDistricts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return { hiddenDistricts: next };
  }),

  journeyPanelOpen: false,
  setJourneyPanelOpen: (open) => set({ journeyPanelOpen: open }),
}));
