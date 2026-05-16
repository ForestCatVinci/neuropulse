import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStressStore } from '../store/stressStore'
import { NonverbalButtons } from './NonverbalButtons'

export function AlertScreen() {
  const isAlert = useStressStore((s) => s.isAlert)
  const clearAlert = useStressStore((s) => s.clearAlert)
  const stress = useStressStore((s) => s.current?.stress ?? 0)
  const [pressed, setPressed] = useState<string | null>(null)

  const handlePress = (label: string) => {
    setPressed(label)
    setTimeout(() => setPressed(null), 2000)
  }

  return (
    <AnimatePresence>
      {isAlert && (
        <motion.div
          key="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(69,10,10,0.97)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 32, padding: 24,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 64 }}>⚠️</span>
            <p style={{ color: '#fca5a5', fontSize: 28, fontWeight: 700, letterSpacing: '0.1em' }}>
              HIGH STRESS
            </p>
            <p style={{ color: '#f87171', fontSize: 56, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
              {stress}%
            </p>
          </motion.div>

          <NonverbalButtons onPress={handlePress} />

          <AnimatePresence>
            {pressed && (
              <motion.p
                key={pressed}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}
              >
                ✓ {pressed}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={clearAlert}
            style={{
              marginTop: 8, color: '#f87171', fontSize: 14,
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Dismiss (caregiver)
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
