import { useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useStressStore } from '../store/stressStore'
import type { Episode } from '../types/stress'
import { API_URL } from '../config'

function riskColor(level: NonNullable<Episode['analysis']>['risk_level']): string {
  if (level === 'high') return 'text-red-400'
  if (level === 'medium') return 'text-yellow-400'
  return 'text-emerald-400'
}

function riskBadgeBg(level: NonNullable<Episode['analysis']>['risk_level']): string {
  if (level === 'high') return 'bg-red-950 border-red-800'
  if (level === 'medium') return 'bg-yellow-950 border-yellow-800'
  return 'bg-emerald-950 border-emerald-800'
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function ParentDashboard() {
  const history     = useStressStore((s) => s.history)
  const episodes    = useStressStore((s) => s.episodes)
  const setEpisodes = useStressStore((s) => s.setEpisodes)

  useEffect(() => {
    fetch(`${API_URL}/episodes`)
      .then((r) => r.json())
      .then(setEpisodes)
      .catch(() => {})
  }, [setEpisodes])

  const chartData = history.map((d, i) => ({ t: i, stress: d.stress, bpm: d.bpm }))
  const timeRange = history.length > 0 ? `last ${history.length} seconds` : 'no data yet'

  return (
    <div className="w-full flex flex-col gap-6">

      <div className="w-full rounded-xl p-5 border" style={{ background: '#1a1d27', borderColor: '#222638' }}>
        <div className="mb-4">
          <p className="text-sm font-semibold text-white">Stress Level</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{timeRange}</p>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-3xl opacity-30">📡</span>
            <p className="text-sm" style={{ color: '#64748b' }}>Waiting for server data…</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222638" />
              <XAxis dataKey="t" hide />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ background: '#1a1d27', border: '1px solid #222638', borderRadius: 8 }}
                labelFormatter={() => ''}
                formatter={(v) => {
                  if (v == null) return ['', '']
                  return [`${Number(v)}%`, 'Stress']
                }}
              />
              <ReferenceLine y={70} stroke="#fb923c" strokeDasharray="4 2"
                label={{ value: '70%', fill: '#fb923c', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={90} stroke="#f87171" strokeDasharray="4 2"
                label={{ value: '90%', fill: '#f87171', fontSize: 10, position: 'right' }} />
              <Line
                type="monotone" dataKey="stress" stroke="#7c3aed"
                strokeWidth={2} dot={false} isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="w-full rounded-xl p-5 border" style={{ background: '#1a1d27', borderColor: '#222638' }}>
        <p className="text-sm font-semibold text-white mb-4">Episodes</p>

        {episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <span className="text-4xl opacity-20">🫧</span>
            <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>No episodes yet</p>
            <p className="text-xs text-center max-w-xs" style={{ color: '#64748b' }}>
              Episodes appear when stress exceeds 90% and then drops back down
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {episodes.map((ep) => (
              <li key={ep.id} className="rounded-xl p-4 border" style={{ background: '#0f1117', borderColor: '#222638' }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-white">{formatTime(ep.start_time)}</span>
                  <div className="flex gap-2 text-xs" style={{ color: '#64748b' }}>
                    <span>{ep.duration_sec}s</span>
                    <span>·</span>
                    <span>peak {ep.peak_stress}%</span>
                    <span>·</span>
                    <span>{ep.avg_bpm.toFixed(0)} bpm</span>
                  </div>
                </div>
                {ep.analysis ? (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm" style={{ color: '#e2e8f0' }}>{ep.analysis.trigger}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{ep.analysis.recommendation}</p>
                    <span className={`self-start mt-1 text-xs font-semibold uppercase px-2 py-0.5 rounded border ${riskColor(ep.analysis.risk_level)} ${riskBadgeBg(ep.analysis.risk_level)}`}>
                      {ep.analysis.risk_level}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: '#64748b' }}>Analysis pending…</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
