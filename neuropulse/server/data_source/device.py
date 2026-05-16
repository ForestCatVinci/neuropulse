import asyncio
import json
from typing import AsyncGenerator

import websockets

from .base import DataSource, SensorReading


class DeviceSource(DataSource):
    """Подключается к ESP32 + MAX30102 по WebSocket ws://IP:81"""

    def __init__(self, url: str) -> None:
        self._url = url
        self._ws = None

    async def start(self) -> None:
        self._ws = await websockets.connect(self._url)

    async def stop(self) -> None:
        if self._ws:
            await self._ws.close()

    async def stream(self) -> AsyncGenerator[SensorReading, None]:
        async for raw in self._ws:
            data = json.loads(raw)
            yield SensorReading(
                bpm=float(data["bpm"]),
                rr_intervals=[float(x) for x in data["rr_intervals"]],
            )
