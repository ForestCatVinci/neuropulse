import asyncio
import json
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data_source import get_data_source, SimulatorSource
from stress_engine import StressEngine
from episode_logger import EpisodeLogger

load_dotenv()

# ── state ────────────────────────────────────────────────────────────────────

connections: list[WebSocket] = []
last_payload: dict[str, Any] = {}
engine = StressEngine()
logger = EpisodeLogger()

episode_active = False
episode_peak = 0
episode_bpm_sum = 0.0
episode_ticks = 0
episode_start: str = ""
_rising_task: asyncio.Task | None = None

# ── broadcast ─────────────────────────────────────────────────────────────────

async def broadcast(msg: dict) -> None:
    dead = []
    for ws in connections:
        try:
            await ws.send_text(json.dumps(msg))
        except Exception:
            dead.append(ws)
    for ws in dead:
        connections.remove(ws)

# ── episode tracking ──────────────────────────────────────────────────────────

async def _handle_episode(result, bpm: float) -> None:
    global episode_active, episode_peak, episode_bpm_sum, episode_ticks, episode_start

    if result.alert and not episode_active:
        episode_active = True
        episode_peak = result.stress
        episode_bpm_sum = bpm
        episode_ticks = 1
        episode_start = datetime.now(timezone.utc).isoformat()

    elif episode_active:
        if result.stress > episode_peak:
            episode_peak = result.stress
        episode_bpm_sum += bpm
        episode_ticks += 1

        if not result.alert:
            end = datetime.now(timezone.utc).isoformat()
            duration = episode_ticks
            avg_bpm = episode_bpm_sum / episode_ticks
            peak = episode_peak
            start = episode_start
            episode_active = False
            asyncio.create_task(_close_episode(start, end, peak, avg_bpm, duration))

async def _close_episode(start: str, end: str, peak: int, avg_bpm: float, duration: int) -> None:
    episode_id = await logger.log_episode(start, end, peak, avg_bpm, duration)
    episode = await logger.get_episode(episode_id)
    if episode:
        from claude_client import analyze_episode
        analysis = await analyze_episode(episode)
        if analysis:
            await logger.save_analysis(episode_id, analysis)

# ── broadcast loop ────────────────────────────────────────────────────────────

async def broadcast_loop() -> None:
    ds = get_data_source()
    await ds.start()
    async for reading in ds.stream():
        result = engine.calculate(reading.bpm, reading.rr_intervals)
        payload = {
            "bpm": result.bpm,
            "stress": result.stress,
            "rr_intervals": reading.rr_intervals,
            "rmssd": result.rmssd,
            "source": os.getenv("DATA_SOURCE", "simulator"),
            "alert": result.alert,
        }
        last_payload.update(payload)
        await broadcast(payload)
        await _handle_episode(result, reading.bpm)

# ── lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(broadcast_loop())
    yield
    task.cancel()
    ds = get_data_source()
    await ds.stop()

# ── app ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="NeuroPulse", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── websocket ─────────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket) -> None:
    await ws.accept()
    connections.append(ws)
    if last_payload:
        await ws.send_text(json.dumps(last_payload))
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        if ws in connections:
            connections.remove(ws)

# ── demo endpoints ────────────────────────────────────────────────────────────

def _sim() -> SimulatorSource:
    ds = get_data_source()
    if not isinstance(ds, SimulatorSource):
        raise HTTPException(400, "Demo endpoints only available in simulator mode")
    return ds

@app.post("/demo/stress/{level}")
async def set_stress(level: float) -> dict:
    _sim().set_stress(level)
    return {"stress_level": level}

@app.post("/demo/scenario/rising")
async def scenario_rising() -> dict:
    global _rising_task
    if _rising_task and not _rising_task.done():
        _rising_task.cancel()

    sim = _sim()
    async def _ramp():
        for i in range(31):
            sim.set_stress(i / 30)
            await asyncio.sleep(1)
    _rising_task = asyncio.create_task(_ramp())
    return {"scenario": "rising", "duration_sec": 30}

@app.post("/demo/scenario/reset")
async def scenario_reset() -> dict:
    global _rising_task
    if _rising_task and not _rising_task.done():
        _rising_task.cancel()
    _sim().set_stress(0.0)
    return {"scenario": "reset"}

# ── episode endpoints ─────────────────────────────────────────────────────────

@app.get("/episodes")
async def get_episodes() -> list:
    return await logger.get_episodes(limit=20)

@app.get("/episodes/{episode_id}/analysis")
async def get_episode_analysis(episode_id: int) -> dict:
    ep = await logger.get_episode(episode_id)
    if not ep:
        raise HTTPException(404, "Episode not found")
    if not ep.get("analysis"):
        raise HTTPException(404, "Analysis not available yet")
    return ep["analysis"]

# ── entrypoint ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
