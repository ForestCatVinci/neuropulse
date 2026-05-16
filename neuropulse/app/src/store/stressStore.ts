import { create } from 'zustand'
import type { StressData, Episode } from '../types/stress'

const HISTORY_LIMIT = 300

interface StressStore {
  current: StressData | null
  history: StressData[]
  episodes: Episode[]
  isAlert: boolean
  alertStartTime: number | null

  setStressData: (data: StressData) => void
  setEpisodes: (episodes: Episode[]) => void
  clearAlert: () => void
}

export const useStressStore = create<StressStore>((set) => ({
  current: null,
  history: [],
  episodes: [],
  isAlert: false,
  alertStartTime: null,

  setStressData: (data) =>
    set((state) => ({
      current: data,
      isAlert: data.alert,
      alertStartTime: data.alert && !state.isAlert ? Date.now() : state.alertStartTime,
      history: [...state.history, data].slice(-HISTORY_LIMIT),
    })),

  setEpisodes: (episodes) => set({ episodes }),

  clearAlert: () => set({ isAlert: false, alertStartTime: null }),
}))
