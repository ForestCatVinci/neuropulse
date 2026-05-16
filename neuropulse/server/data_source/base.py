from abc import ABC, abstractmethod
from typing import AsyncGenerator
from dataclasses import dataclass


@dataclass
class SensorReading:
    bpm: float
    rr_intervals: list[float]  # мс между ударами


class DataSource(ABC):
    @abstractmethod
    async def stream(self) -> AsyncGenerator[SensorReading, None]:
        """Бесконечный поток показаний датчика."""
        ...

    @abstractmethod
    async def start(self) -> None:
        """Инициализация источника данных."""
        ...

    @abstractmethod
    async def stop(self) -> None:
        """Остановка источника данных."""
        ...
