import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStressStore } from '../store/stressStore'
import { NonverbalButtons } from './NonverbalButtons'

export function AlertScreen() {
  const alertActive = useStressStore((s) => s.alertActive)
  const dismissAlert = useStressStore((s) => s.dismissAlert)
  const stress = useStressStore((s) => s.current?.stress ?? 0)
  const [pressed, setPressed] = useState<string | null>(null)

  const handlePress = (label: string) => {
    setPressed(label)
    // сбрасываем подтверждение через 2 секунды
    setTimeout(() => setPressed(null), 2000)
  }

  return (
    <AnimatePresence>
      {alertActive && (
        <motion.div
          key="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-red-950/95 flex flex-col items-center justify-center gap-8 p-6"
        >
          {/* пульсирующий индикатор */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-6xl">⚠️</span>
            <p className="text-red-300 text-2xl font-bold tracking-wider uppercase">
              Overload
            </p>
            <p className="text-red-400 text-5xl font-black tabular-nums">{stress}%</p>
          </motion.div>

          {/* кнопки невербальной коммуникации */}
          <NonverbalButtons onPress={handlePress} />

          {/* подтверждение нажатия */}
          <AnimatePresence>
            {pressed && (
              <motion.p
                key={pressed}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-white text-lg font-semibold"
              >
                ✓ {pressed}
              </motion.p>
            )}
          </AnimatePresence>

          {/* кнопка для опекуна */}
          <button
            onClick={dismissAlert}
            className="mt-4 text-red-400 text-sm underline underline-offset-4 hover:text-red-300 transition-colors"
          >
            Dismiss (caregiver)
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
