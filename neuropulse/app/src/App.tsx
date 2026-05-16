import './index.css'
import { useStressData } from './hooks/useStressData'
import { StressMeter } from './components/StressMeter'
import { DemoControls } from './components/DemoControls'

function App() {
  useStressData()

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh p-6 gap-8">
      <h1 className="text-xl font-semibold text-slate-300 tracking-widest uppercase">
        NeuroPulse
      </h1>
      <StressMeter />
      <DemoControls />
    </main>
  )
}

export default App
