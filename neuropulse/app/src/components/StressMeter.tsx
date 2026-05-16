import { motion } from 'framer-motion'
import { useStressStore } from '../store/stressStore'

function getColor(stress: number): string {
  if (stress >= 90) return '#ef4444'   // красный
  if (stress >= 70) return '#f97316'   // оранжевый
  if (stress >= 40) return '#eab308'   // жёлтый
  return '#22c55e'                      // зелёный
}

function getLabel(stress: number): string {
  if (stress >= 90) return 'КРИЗИС'
  if (stress >= 70) return 'ВЫСОКИЙ'
  if (stress >= 40) return 'УМЕРЕННЫЙ'
  return 'СПОКОЙНО'
}

export function StressMeter() {
  const current = useStressStore((s) => s.current)
  const stress = current?.stress ?? 0
  const bpm = current?.bpm ?? 0
  const rmssd = current?.rmssd ?? 0
  const source = current?.source ?? 'simulator'

  const color = getColor(stress)

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xs mx-auto">

      {/* заголовок */}
      <div className="text-center">
        <motion.p
          key={getLabel(stress)}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color }}
        >
          {getLabel(stress)}
        </motion.p>
        <motion.p
          className="text-6xl font-bold tabular-nums mt-1"
          style={{ color }}
          animate={{ color }}
          transition={{ duration: 0.6 }}
        >
          {stress}
          <span className="text-2xl font-normal text-slate-400">%</span>
        </motion.p>
      </div>

      {/* термометр */}
      <div className="relative w-12 h-64 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ height: `${stress}%`, backgroundColor: color }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* зона-маркеры */}
        {[40, 70, 90].map((mark) => (
          <div
            key={mark}
            className="absolute left-0 right-0 border-t border-slate-600 border-dashed opacity-40"
            style={{ bottom: `${mark}%` }}
          />
        ))}
      </div>

      {/* биометрика */}
      <div className="grid grid-cols-2 gap-4 w-full text-center">
        <div className="bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider">BPM</p>
          <p className="text-2xl font-semibold text-slate-100 tabular-nums mt-1">
            {bpm.toFixed(0)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider">RMSSD</p>
          <p className="text-2xl font-semibold text-slate-100 tabular-nums mt-1">
            {rmssd.toFixed(1)}
            <span className="text-xs text-slate-400 ml-1">мс</span>
          </p>
        </div>
      </div>

      {/* источник данных */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-slate-500 uppercase tracking-wider">{source}</span>
      </div>
    </div>
  )
}
