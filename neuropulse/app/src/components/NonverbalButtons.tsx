import { motion } from 'framer-motion'

const BUTTONS = [
  { emoji: '🔇', label: 'Quiet',   color: '#2563eb' },
  { emoji: '🏠', label: 'Go Home', color: '#16a34a' },
  { emoji: '🆘', label: 'Help',    color: '#dc2626' },
]

interface Props {
  onPress: (label: string) => void
}

export function NonverbalButtons({ onPress }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-md">
      {BUTTONS.map(({ emoji, label, color }) => (
        <motion.button
          key={label}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
          onClick={() => onPress(label)}
          style={{
            minHeight: 120,
            minWidth: 120,
            background: color,
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#fff',
          }}
        >
          <span style={{ fontSize: 40 }}>{emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
