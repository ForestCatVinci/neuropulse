import os
from dotenv import load_dotenv
from .simulator import SimulatorSource, BiometricData
from .device import DeviceSource

load_dotenv()

_instance: SimulatorSource | DeviceSource | None = None


def get_data_source() -> SimulatorSource | DeviceSource:
    global _instance
    if _instance is None:
        source = os.getenv("DATA_SOURCE", "simulator").lower()
        if source == "simulator":
            _instance = SimulatorSource()
        elif source == "device":
            url = os.getenv("DEVICE_WS_URL", "ws://192.168.1.100:81")
            _instance = DeviceSource(url)
        else:
            raise ValueError(f"Unknown DATA_SOURCE: {source!r}")
    return _instance


__all__ = ["get_data_source", "SimulatorSource", "DeviceSource", "BiometricData"]
