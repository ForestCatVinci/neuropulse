import asyncio
import math
import random
from typing import AsyncGenerator

from .base import DataSource, SensorReading


class SimulatorSource(DataSource):
    """
    Генерирует реалистичные BPM/HRV данные.
    stress_level: 0.0 (спокойно) → 1.0 (кризис)
    """

    BASE_BPM = 68
    MAX_BPM = 96
    BASE_RMSSD = 45.0  # мс
    MIN_RMSSD = 15.0   # мс
    INTERVAL_SEC = 1.0

    def __init__(self) -> None:
        self._stress_level: float = 0.0
        self._running = False
        self._t = 0.0

    def set_stress(self, level: float) -> None:
        self._stress_level = max(0.0, min(1.0, level))

    async def start(self) -> None:
        self._running = True

    async def stop(self) -> None:
        self._running = False

    async def stream(self) -> AsyncGenerator[SensorReading, None]:
        while self._running:
            yield self._generate()
            self._t += self.INTERVAL_SEC
            await asyncio.sleep(self.INTERVAL_SEC)

    def _generate(self) -> SensorReading:
        s = self._stress_level

        # BPM: базовый + стресс-подъём + дыхательная волна + шум
        bpm = (
            self.BASE_BPM
            + (self.MAX_BPM - self.BASE_BPM) * s
            + math.sin(self._t * 0.2) * 2
            + random.gauss(0, 1.5)
        )

        # Целевой RMSSD снижается при стрессе
        target_rmssd = self.BASE_RMSSD + (self.MIN_RMSSD - self.BASE_RMSSD) * s

        # Базовый RR-интервал из BPM
        base_rr = 60_000 / bpm

        # Генерируем 5 RR-интервалов с вариабельностью, соответствующей RMSSD
        rr_intervals = [
            base_rr + random.gauss(0, target_rmssd * 0.7)
            for _ in range(5)
        ]

        return SensorReading(bpm=round(bpm, 1), rr_intervals=rr_intervals)
