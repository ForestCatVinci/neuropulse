export interface StressData {
  bpm: number
  stress: number
  rr_intervals: number[]
  rmssd: number
  source: 'simulator' | 'device'
  alert: boolean
}

export interface EpisodeAnalysis {
  trigger: string
  recommendation: string
  risk_level: 'low' | 'medium' | 'high'
}

export interface Episode {
  id: number
  start_time: string
  end_time: string
  peak_stress: number
  avg_bpm: number
  duration_sec: number
  analysis: EpisodeAnalysis | null
}
