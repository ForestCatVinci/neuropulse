import os

from dotenv import load_dotenv

from .base import DataSource, SensorReading
from .simulator import SimulatorSource
from .device import DeviceSource

load_dotenv()


def create_data_source() -> DataSource:
    source = os.getenv("DATA_SOURCE", "simulator").lower()
    if source == "simulator":
        return SimulatorSource()
    if source == "device":
        url = os.getenv("DEVICE_WS_URL", "ws://192.168.1.100:81")
        return DeviceSource(url)
    raise ValueError(f"Неизвестный DATA_SOURCE: {source!r}. Допустимые: simulator, device")


__all__ = ["create_data_source", "DataSource", "SensorReading", "SimulatorSource", "DeviceSource"]
