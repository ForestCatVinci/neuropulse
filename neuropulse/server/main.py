import asyncio
import json
import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data_source import create_data_source, SimulatorSource
from stress_engine import calculate_stress

load_dotenv()

# ── глобальное состояние ────────────────────────────────────────────────────

data_source = create_data_source()
connections: list[WebSocket] = []

# Текущий эпизод (stress >= 90 подряд)
episode_active = False
episode_peak = 0
episode_start_time: float | None = None

# Текущий уровень стресса для /status
last_stress: dict[str, Any] = {}


# ── WebSocket-менеджер ──────────────────────────────────────────────────────

async def broadcast(message: dict) -> None:
    dead = []
    for ws in connections:
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            dead.append(ws)
    for ws in dead:
        connections.remove(ws)


# ── фоновый цикл трансляции ─────────────────────────────────────────────────

async def broadcast_loop() -> None:
    global episode_active, episode_peak, episode_start_time

    await data_source.start()

    async for reading in data_source.stream():
        result = calculate_stress(reading)

        source_name = os.getenv("DATA_SOURCE", "simulator")
        payload = {
            "bpm": result.bpm,
            "stress": result.stress,
            "rr_intervals": reading.rr_intervals,
            "rmssd": result.rmssd,
            "source": source_name,
            "alert": result.alert,
        }
        last_stress.update(payload)

        await broadcast(payload)
        _track_episode(result)


def _track_episode(result) -> None:
    """Фиксирует начало/конец эпизода для последующего логирования."""
    global episode_active, episode_peak, episode_start_time
    import time

    if result.alert and not episode_active:
        episode_active = True
        episode_peak = result.stress
        episode_start_time = time.time()
    elif episode_active:
        if result.stress > episode_peak:
            episode_peak = result.stress
        if not result.alert:
            # эпизод закончился
            episode_active = False
            duration = int(time.time() - (episode_start_time or 0))
            asyncio.create_task(_close_episode(duration, episode_peak))


async def _close_episode(duration: int, peak: int) -> None:
    """Сохраняет эпизод и запрашивает анализ (реализуется в Step 11)."""
    try:
        from episode_logger import log_episode
        from openai_client import analyze_episode
        episode_id = await log_episode(duration=duration, peak_stress=peak, avg_bpm=last_stress.get("bpm", 0))
        await analyze_episode(episode_id)
    except ImportError:
        pass  # episode_logger/openai_client ещё не реализованы


# ── lifespan ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(broadcast_loop())
    yield
    task.cancel()
    await data_source.stop()


# ── приложение ───────────────────────────────────────────────────────────────

app = FastAPI(title="NeuroPulse", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── WebSocket endpoint ───────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket) -> None:
    await ws.accept()
    connections.append(ws)
    try:
        while True:
            await ws.receive_text()  # держим соединение живым
    except WebSocketDisconnect:
        connections.remove(ws)


# ── demo endpoints ───────────────────────────────────────────────────────────

def _get_simulator() -> SimulatorSource:
    if not isinstance(data_source, SimulatorSource):
        raise HTTPException(status_code=400, detail="Demo-эндпоинты доступны только в режиме simulator")
    return data_source


@app.post("/demo/stress/{level}")
async def set_stress(level: float) -> dict:
    sim = _get_simulator()
    sim.set_stress(level)
    return {"stress_level": level}


@app.post("/demo/scenario/rising")
async def scenario_rising() -> dict:
    """Плавный подъём стресса 0 → 1 за 30 секунд."""
    sim = _get_simulator()

    async def _ramp():
        steps = 30
        for i in range(steps + 1):
            sim.set_stress(i / steps)
            await asyncio.sleep(1)

    asyncio.create_task(_ramp())
    return {"scenario": "rising", "duration_sec": 30}


@app.post("/demo/scenario/reset")
async def scenario_reset() -> dict:
    sim = _get_simulator()
    sim.set_stress(0.0)
    return {"scenario": "reset"}


# ── episode endpoints (заглушки до Step 11) ──────────────────────────────────

@app.get("/episodes")
async def get_episodes() -> list:
    try:
        from episode_logger import get_last_episodes
        return await get_last_episodes(limit=20)
    except ImportError:
        return []


@app.get("/episodes/{episode_id}/analysis")
async def get_episode_analysis(episode_id: int) -> dict:
    try:
        from episode_logger import get_analysis
        result = await get_analysis(episode_id)
        if result is None:
            raise HTTPException(status_code=404, detail="Анализ не найден")
        return result
    except ImportError:
        raise HTTPException(status_code=503, detail="episode_logger ещё не реализован")
