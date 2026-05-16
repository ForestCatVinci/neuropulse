import math
from dataclasses import dataclass

BASELINE_BPM = 68
RMSSD_HIGH = 50.0
RMSSD_LOW = 15.0


@dataclass
class StressResult:
    stress: int
    rmssd: float
    bpm: float
    alert: bool


class StressEngine:
    def calculate(self, bpm: float, rr_intervals: list[float]) -> StressResult:
        rmssd = self._rmssd(rr_intervals)
        rmssd_clamped = max(RMSSD_LOW, min(RMSSD_HIGH, rmssd))
        rmssd_stress = (RMSSD_HIGH - rmssd_clamped) / (RMSSD_HIGH - RMSSD_LOW) * 100

        bpm_stress = max(0.0, (bpm - BASELINE_BPM) * 0.5)
        stress = int(min(100, max(0, rmssd_stress * 0.7 + bpm_stress * 0.3)))

        return StressResult(stress=stress, rmssd=round(rmssd, 2), bpm=round(bpm, 1), alert=stress >= 90)

    def _rmssd(self, rr: list[float]) -> float:
        if len(rr) < 2:
            return RMSSD_HIGH
        diffs = [rr[i] - rr[i - 1] for i in range(1, len(rr))]
        return math.sqrt(sum(d ** 2 for d in diffs) / len(diffs))
