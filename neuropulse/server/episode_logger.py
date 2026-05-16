import json
import aiosqlite
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = str(Path(__file__).parent / "episodes.db")


class EpisodeLogger:
    async def _init(self, db: aiosqlite.Connection) -> None:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS episodes (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time   TEXT NOT NULL,
                end_time     TEXT,
                peak_stress  INTEGER,
                avg_bpm      REAL,
                duration_sec INTEGER,
                analysis_json TEXT
            )
        """)
        await db.commit()

    async def log_episode(self, start_time: str, end_time: str,
                          peak_stress: int, avg_bpm: float, duration_sec: int) -> int:
        async with aiosqlite.connect(DB_PATH) as db:
            await self._init(db)
            cur = await db.execute(
                "INSERT INTO episodes (start_time, end_time, peak_stress, avg_bpm, duration_sec) VALUES (?,?,?,?,?)",
                (start_time, end_time, peak_stress, round(avg_bpm, 1), duration_sec),
            )
            await db.commit()
            return cur.lastrowid

    async def save_analysis(self, episode_id: int, analysis: dict) -> None:
        async with aiosqlite.connect(DB_PATH) as db:
            await self._init(db)
            await db.execute(
                "UPDATE episodes SET analysis_json=? WHERE id=?",
                (json.dumps(analysis), episode_id),
            )
            await db.commit()

    async def get_episodes(self, limit: int = 20) -> list[dict]:
        async with aiosqlite.connect(DB_PATH) as db:
            await self._init(db)
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT * FROM episodes ORDER BY id DESC LIMIT ?", (limit,)
            )
            rows = await cur.fetchall()
        return [self._row_to_dict(dict(r)) for r in rows]

    async def get_episode(self, episode_id: int) -> dict | None:
        async with aiosqlite.connect(DB_PATH) as db:
            await self._init(db)
            db.row_factory = aiosqlite.Row
            cur = await db.execute("SELECT * FROM episodes WHERE id=?", (episode_id,))
            row = await cur.fetchone()
        return self._row_to_dict(dict(row)) if row else None

    def _row_to_dict(self, row: dict) -> dict:
        analysis_json = row.pop("analysis_json", None)
        row["analysis"] = json.loads(analysis_json) if analysis_json else None
        return row
