import { motion } from 'framer-motion'
import { useStressStore } from '../store/stressStore'

function getStatus(stress: number): { label: string; bg: string; text: string; border: string } {
  if (stress >= 90) return { label: 'CRISIS',    bg: 'bg-red-950',    text: 'text-red-400',    border: 'border-red-500' }
  if (stress >= 70) return { label: 'HIGH',      bg: 'bg-orange-950', text: 'text-orange-400', border: 'border-orange-500' }
  if (stress >= 40) return { label: 'ELEVATED',  bg: 'bg-yellow-950', text: 'text-yellow-400', border: 'border-yellow-500' }
  return              { label: 'CALM',       bg: 'bg-emerald-950',text: 'text-emerald-400',border: 'border-emerald-500' }
}

function getStressColor(stress: number): string {
  if (stress >= 90) return '#f87171'
  if (stress >= 70) return '#fb923c'
  if (stress >= 40) return '#facc15'
  return '#34d399'
}

interface StatCardProps {
  label: string
  value: string
  unit: string
  icon: string
  borderColor: string
  valueColor?: string
}

function StatCard({ label, value, unit, icon, borderColor, valueColor = '#f1f5f9' }: StatCardProps) {
  return (
    <div
      className="flex-1 rounded-xl p-4 flex flex-col gap-1 border"
      style={{ background: '#1a1d27', borderColor }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-base">{icon}</span>
        <span className="text-xs uppercase tracking-wider" style={{ color: '#64748b' }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="font-bold tabular-nums" style={{ fontSize: 48, lineHeight: 1, color: valueColor }}>
          {value}
        </span>
        <span className="text-sm" style={{ color: '#94a3b8' }}>{unit}</span>
      </div>
    </div>
  )
}

export function StressMeter() {
  const current = useStressStore((s) => s.current)
  const stress = current?.stress ?? 0
  const bpm    = current?.bpm   ?? 0
  const rmssd  = current?.rmssd ?? 0
  const source = current?.source ?? 'simulator'

  const status = getStatus(stress)
  const stressColor = getStressColor(stress)

  return (
    <div className="w-full flex flex-col gap-4">

      {/* 1. Status banner */}
      <motion.div
        key={status.label}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-xl py-3 px-5 flex items-center justify-between border ${status.bg} ${status.border}`}
      >
        <span className={`text-sm font-bold tracking-widest uppercase ${status.text}`}>
          {status.label}
        </span>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full animate-pulse ${status.text.replace('text-', 'bg-')}`} />
          <span className="text-xs" style={{ color: '#64748b' }}>STRESS MONITOR</span>
        </div>
      </motion.div>

      {/* 2. Metric cards */}
      <div className="flex gap-3">
        <StatCard
          label="Stress"
          value={String(stress)}
          unit="%"
          icon="⚡"
          borderColor={stressColor + '55'}
          valueColor={stressColor}
        />
        <StatCard
          label="BPM"
          value={bpm.toFixed(0)}
          unit="bpm"
          icon="♥"
          borderColor="#7c3aed55"
        />
        <StatCard
          label="RMSSD"
          value={rmssd.toFixed(1)}
          unit="ms"
          icon="〰"
          borderColor="#0ea5e955"
        />
      </div>

      {/* 3. Connection status */}
      <div className="flex items-center gap-2 px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs uppercase tracking-widest" style={{ color: '#64748b' }}>
          {source}
        </span>
      </div>
    </div>
  )
}
