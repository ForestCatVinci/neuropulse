import { motion } from 'framer-motion'
import { useStressStore } from '../store/stressStore'

interface Status {
  label: string
  bg: string
  color: string
  border: string
}

function getStatus(stress: number): Status {
  if (stress >= 90) return { label: 'CRISIS',   bg: '#450a0a', color: '#dc2626', border: '#dc2626' }
  if (stress >= 70) return { label: 'HIGH',     bg: '#431407', color: '#ea580c', border: '#ea580c' }
  if (stress >= 40) return { label: 'ELEVATED', bg: '#422006', color: '#ca8a04', border: '#ca8a04' }
  return               { label: 'CALM',     bg: '#052e16', color: '#16a34a', border: '#16a34a' }
}

interface StatCardProps {
  label: string
  value: string
  unit: string
  icon: string
  accentColor: string
}

function StatCard({ label, value, unit, icon, accentColor }: StatCardProps) {
  return (
    <div style={{
      flex: 1,
      background: '#1a1d27',
      borderRadius: 12,
      padding: 24,
      borderLeft: `4px solid ${accentColor}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1, color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        <span style={{ fontSize: 20, color: '#64748b' }}>{unit}</span>
      </div>
    </div>
  )
}

export function StressMeter() {
  const current = useStressStore((s) => s.current)
  const stress  = current?.stress ?? 0
  const bpm     = current?.bpm   ?? 0
  const rmssd   = current?.rmssd ?? 0
  const source  = current?.source ?? 'simulator'

  const status = getStatus(stress)

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* status banner */}
      <motion.div
        key={status.label}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          minHeight: 48,
          background: status.bg,
          border: `1px solid ${status.border}`,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: status.color }}>
          {status.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: status.color, display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#64748b', letterSpacing: '0.08em' }}>STRESS MONITOR</span>
        </div>
      </motion.div>

      {/* metric cards */}
      <div style={{ display: 'flex', gap: 16, width: '100%' }}>
        <StatCard label="Stress"  value={String(stress)}       unit="%"   icon="⚡" accentColor={status.color} />
        <StatCard label="BPM"     value={bpm.toFixed(0)}       unit="bpm" icon="♥" accentColor="#7c3aed" />
        <StatCard label="RMSSD"   value={rmssd.toFixed(1)}     unit="ms"  icon="〰" accentColor="#0ea5e9" />
      </div>

      {/* connection badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
          {source}
        </span>
      </div>
    </div>
  )
}
