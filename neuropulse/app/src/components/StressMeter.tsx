import { motion } from 'framer-motion'
import { useStressStore } from '../store/stressStore'

function zoneColor(stress: number): string {
  if (stress >= 90) return '#dc2626'
  if (stress >= 70) return '#ea580c'
  if (stress >= 40) return '#ca8a04'
  return '#16a34a'
}

function zoneLabel(stress: number): string {
  if (stress >= 90) return 'CRISIS'
  if (stress >= 70) return 'HIGH'
  if (stress >= 40) return 'ELEVATED'
  return 'CALM'
}

export function StressMeter() {
  const current = useStressStore((s) => s.current)
  const stress = current?.stress ?? 0
  const bpm = current?.bpm ?? 0
  const rmssd = current?.rmssd ?? 0
  const source = current?.source ?? 'simulator'
  const color = zoneColor(stress)

  return (
    <div className="w-full flex flex-col gap-4">
      {/* status banner */}
      <motion.div
        key={zoneLabel(stress)}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-xl flex items-center justify-between px-5"
        style={{ minHeight: 48, background: color + '22', border: `1px solid ${color}` }}
      >
        <span className="text-lg font-bold tracking-widest" style={{ color }}>
          {zoneLabel(stress)}
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
          <span className="text-xs tracking-wider text-gray-500 uppercase">{source}</span>
        </div>
      </motion.div>

      {/* metric cards */}
      <div className="flex gap-4 w-full">
        {/* stress */}
        <div className="flex-1 bg-gray-900 rounded-xl p-6 border border-gray-800"
          style={{ borderLeftColor: color, borderLeftWidth: 4 }}>
          <p className="text-xs uppercase tracking-wider text-gray-500">Stress</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-bold tabular-nums" style={{ fontSize: 64, lineHeight: 1, color }}>
              {stress}
            </span>
            <span className="text-xl text-gray-500">%</span>
          </div>
        </div>

        {/* bpm */}
        <div className="flex-1 bg-gray-900 rounded-xl p-6 border border-gray-800"
          style={{ borderLeftColor: '#7c3aed', borderLeftWidth: 4 }}>
          <p className="text-xs uppercase tracking-wider text-gray-500">♥ BPM</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-bold tabular-nums text-white" style={{ fontSize: 64, lineHeight: 1 }}>
              {bpm.toFixed(0)}
            </span>
            <span className="text-xl text-gray-500">bpm</span>
          </div>
        </div>

        {/* rmssd */}
        <div className="flex-1 bg-gray-900 rounded-xl p-6 border border-gray-800"
          style={{ borderLeftColor: '#0ea5e9', borderLeftWidth: 4 }}>
          <p className="text-xs uppercase tracking-wider text-gray-500">〰 RMSSD</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-bold tabular-nums text-white" style={{ fontSize: 64, lineHeight: 1 }}>
              {rmssd.toFixed(1)}
            </span>
            <span className="text-xl text-gray-500">ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}
