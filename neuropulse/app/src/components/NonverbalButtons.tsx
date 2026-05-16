import { motion } from 'framer-motion'

const BUTTONS = [
  { emoji: '🔇', label: 'Тишина',    bg: 'bg-blue-600 hover:bg-blue-500' },
  { emoji: '🏠', label: 'Домой',     bg: 'bg-emerald-600 hover:bg-emerald-500' },
  { emoji: '🆘', label: 'Помогите',  bg: 'bg-red-600 hover:bg-red-500' },
]

interface Props {
  onPress: (label: string) => void
}

export function NonverbalButtons({ onPress }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
      {BUTTONS.map(({ emoji, label, bg }) => (
        <motion.button
          key={label}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
          onClick={() => onPress(label)}
          className={`${bg} rounded-2xl flex flex-col items-center justify-center gap-2 py-6 text-white transition-colors`}
        >
          <span className="text-4xl">{emoji}</span>
          <span className="text-sm font-semibold tracking-wide">{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
