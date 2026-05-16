import math
from dataclasses import dataclass

from data_source.base import SensorReading

# Личный базовый BPM пользователя
BASELINE_BPM = 68

# RMSSD-границы: выше — спокойно, ниже — стресс
RMSSD_LOW = 20.0   # максимальный стресс
RMSSD_HIGH = 50.0  # минимальный стресс

# Насколько сильно BPM-отклонение влияет на итоговый стресс (0–1)
BPM_WEIGHT = 0.3
RMSSD_WEIGHT = 0.7


@dataclass
class StressResult:
    stress: int          # 0–100
    rmssd: float         # мс
    bpm: float
    alert: bool          # stress >= 90


def calculate_stress(reading: SensorReading) -> StressResult:
    rmssd = _compute_rmssd(reading.rr_intervals)

    # RMSSD → стресс: низкий RMSSD = высокий стресс
    rmssd_clamped = max(RMSSD_LOW, min(RMSSD_HIGH, rmssd))
    rmssd_stress = 1.0 - (rmssd_clamped - RMSSD_LOW) / (RMSSD_HIGH - RMSSD_LOW)

    # BPM-отклонение от базового
    bpm_deviation = max(0.0, reading.bpm - BASELINE_BPM)
    bpm_stress = min(1.0, bpm_deviation / (96 - BASELINE_BPM))

    combined = RMSSD_WEIGHT * rmssd_stress + BPM_WEIGHT * bpm_stress
    stress = round(combined * 100)

    return StressResult(
        stress=stress,
        rmssd=round(rmssd, 2),
        bpm=reading.bpm,
        alert=stress >= 90,
    )


def _compute_rmssd(rr_intervals: list[float]) -> float:
    if len(rr_intervals) < 2:
        return RMSSD_HIGH  # нет данных → считаем спокойным

    diffs = [rr_intervals[i] - rr_intervals[i - 1] for i in range(1, len(rr_intervals))]
    mean_sq = sum(d ** 2 for d in diffs) / len(diffs)
    return math.sqrt(mean_sq)
