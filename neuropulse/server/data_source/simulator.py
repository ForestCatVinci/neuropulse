import asyncio
import math
import random
from dataclasses import dataclass
from typing import AsyncGenerator


@dataclass
class BiometricData:
    bpm: float
    rr_intervals: list[float]


class SimulatorSource:
    def __init__(self) -> None:
        self._stress = 0.0
        self._t = 0.0
        self._running = False

    def set_stress(self, level: float) -> None:
        self._stress = max(0.0, min(1.0, level))

    async def start(self) -> None:
        self._running = True

    async def stop(self) -> None:
        self._running = False

    async def stream(self) -> AsyncGenerator[BiometricData, None]:
        while self._running:
            yield self._generate()
            self._t += 1.0
            await asyncio.sleep(1.0)

    def _generate(self) -> BiometricData:
        s = self._stress
        bpm = 68 + s * 28 + math.sin(self._t * 0.3) * 2 + random.gauss(0, 1.5)
        rmssd = max(5.0, 45 - s * 30 + random.gauss(0, 2))
        base_rr = 60_000 / bpm
        rr = [max(300.0, base_rr + random.gauss(0, rmssd * 0.6)) for _ in range(6)]
        return BiometricData(bpm=round(bpm, 1), rr_intervals=rr)
