import { create } from 'zustand'
import type { StressData, Episode } from '../types/stress'

const HISTORY_LIMIT = 60  // последние 60 секунд

interface StressStore {
  current: StressData | null
  history: StressData[]
  alertActive: boolean
  episodes: Episode[]

  pushReading: (data: StressData) => void
  setEpisodes: (episodes: Episode[]) => void
  dismissAlert: () => void
}

export const useStressStore = create<StressStore>((set) => ({
  current: null,
  history: [],
  alertActive: false,
  episodes: [],

  pushReading: (data) =>
    set((state) => ({
      current: data,
      alertActive: data.alert,
      history: [...state.history, data].slice(-HISTORY_LIMIT),
    })),

  setEpisodes: (episodes) => set({ episodes }),

  dismissAlert: () => set({ alertActive: false }),
}))
