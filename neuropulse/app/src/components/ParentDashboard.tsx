import { useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useStressStore } from '../store/stressStore'
import type { Episode } from '../types/stress'

function riskColor(level: Episode['analysis']['risk_level']): string {
  if (level === 'high') return 'text-red-400'
  if (level === 'medium') return 'text-yellow-400'
  return 'text-emerald-400'
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function ParentDashboard() {
  const history = useStressStore((s) => s.history)
  const episodes = useStressStore((s) => s.episodes)
  const setEpisodes = useStressStore((s) => s.setEpisodes)

  useEffect(() => {
    fetch('/episodes')
      .then((r) => r.json())
      .then(setEpisodes)
      .catch(() => {})
  }, [setEpisodes])

  const chartData = history.map((d, i) => ({ t: i, stress: d.stress, bpm: d.bpm }))

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6">

      {/* график стресса */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">
          Стресс — последние {history.length} сек
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }}
              labelFormatter={() => ''}
              formatter={(v: number) => [`${v}%`, 'Стресс']}
            />
            <ReferenceLine y={70} stroke="#f97316" strokeDasharray="4 2" />
            <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 2" />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* история эпизодов */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">
          Эпизоды
        </p>
        {episodes.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">
            Эпизодов пока нет
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {episodes.map((ep) => (
              <li key={ep.id} className="bg-slate-700/50 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm font-medium">
                    {formatTime(ep.started_at)}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {ep.duration_sec}с · пик {ep.peak_stress}%
                  </span>
                </div>
                {ep.analysis ? (
                  <>
                    <p className="text-slate-300 text-sm">{ep.analysis.trigger}</p>
                    <p className="text-slate-400 text-xs">{ep.analysis.recommendation}</p>
                    <span className={`text-xs font-semibold uppercase ${riskColor(ep.analysis.risk_level)}`}>
                      {ep.analysis.risk_level}
                    </span>
                  </>
                ) : (
                  <p className="text-slate-500 text-xs">Анализ ожидается…</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
