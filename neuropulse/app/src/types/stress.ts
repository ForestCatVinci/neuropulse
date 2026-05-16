export interface StressData {
  bpm: number
  stress: number          // 0–100
  rr_intervals: number[]  // мс
  rmssd: number           // мс
  source: 'simulator' | 'device'
  alert: boolean          // stress >= 90
}

export interface EpisodeAnalysis {
  trigger: string
  recommendation: string
  risk_level: 'low' | 'medium' | 'high'
}

export interface Episode {
  id: number
  started_at: string      // ISO timestamp
  duration_sec: number
  peak_stress: number
  avg_bpm: number
  analysis: EpisodeAnalysis | null
}
