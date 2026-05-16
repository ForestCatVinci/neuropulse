# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: NeuroPulse

Real-time sensory overload prediction for neurodiverse users (autism, Tourette's) using wearable biometrics. Hackathon MVP.

## Commands

### Backend (server/)
```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (app/)
```bash
cd app
npm install
npm run dev        # dev server on port 5173
npm run build
npm run lint
```

### Environment
```
server/.env:
  DATA_SOURCE=simulator   # or: device
  ANTHROPIC_API_KEY=...
```

## Architecture

Three-layer system:

**Data layer** (`server/data_source/`): Abstract `AsyncGenerator` base class with two concrete implementations. `SimulatorSource` generates realistic BPM/HRV with configurable `stress_level` (0.0–1.0). `DeviceSource` connects to ESP32 via WebSocket at `ws://IP:81`. The factory in `__init__.py` reads `DATA_SOURCE` from `.env` and returns the correct source — switching to real hardware requires only changing `.env`.

**Backend** (`server/`):
- `stress_engine.py` — RMSSD formula: collects RR intervals, computes `sqrt(avg((RR[i]-RR[i-1])²))`. High RMSSD (>50ms) = low stress, low RMSSD (<20ms) = high stress. Also factors BPM deviation from baseline (68 BPM).
- `main.py` — FastAPI app, WebSocket hub broadcasts stress packets to all connected browsers every tick. Also exposes REST endpoints for demo control and episode retrieval.
- `episode_logger.py` — persists episodes (stress ≥90%) to SQLite.
- `claude_client.py` — calls `claude-sonnet-4-20250514` after an episode ends; returns `{ trigger, recommendation, risk_level }`.

**Frontend** (`app/src/`):
- `hooks/useStressData.ts` — single WebSocket connection, feeds data into Zustand store.
- `store/stressStore.ts` — holds current stress, BPM, history buffer, alert state.
- Components read from store; `DemoControls` posts to `/demo/stress/{level}` to drive the simulator for presentations.

## WebSocket message format (server → browser)
```json
{
  "bpm": 75,
  "stress": 42,
  "rr_intervals": [980, 1020, 950, 1005, 990],
  "rmssd": 28.5,
  "source": "simulator",
  "alert": false
}
```

## REST endpoints
```
POST /demo/stress/{level}       set simulator stress 0.0–1.0
POST /demo/scenario/rising      auto-ramp 0→1 over 30s
POST /demo/scenario/reset       return to calm
GET  /episodes                  last 20 episodes
GET  /episodes/{id}/analysis    Claude AI analysis for episode
```

## Stress alert thresholds
- 0–40% green, 40–70% yellow, 70–90% orange, 90–100% red + fullscreen `AlertScreen`
- At 90%+ show `NonverbalButtons`: 🔇 quiet / 🏠 go home / 🆘 help
- After episode ends, trigger Claude analysis automatically

## UI constraints
- Dark-friendly palette, no harsh whites
- Mobile-first (caregiver uses phone/tablet)
- Framer Motion animations must respect `prefers-reduced-motion`
- Alert screen must be usable by non-verbal user: large buttons, minimal text

## Implementation order
1. `server/data_source/` (base → simulator → `__init__` factory)
2. `server/stress_engine.py`
3. `server/main.py` (WebSocket broadcast + REST)
4. `app/src/types/stress.ts`
5. `app/src/hooks/useStressData.ts`
6. `app/src/store/stressStore.ts`
7. `app/src/components/StressMeter.tsx`
8. `app/src/components/DemoControls.tsx`
9. `app/src/components/AlertScreen.tsx` + `NonverbalButtons.tsx`
10. `app/src/components/ParentDashboard.tsx`
11. `server/episode_logger.py` + `server/claude_client.py`

## Key constraints
- No real ESP32 yet — simulator must work standalone for all demos.
- Demo rising-stress scenario must be triggerable from the UI (for presentations).
- Comments in Russian are acceptable.
- Ask before making any architectural decisions not covered above.
