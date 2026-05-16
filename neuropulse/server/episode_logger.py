import asyncio
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "episodes.db"


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db() -> None:
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS episodes (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                started_at      TEXT    NOT NULL,
                duration_sec    INTEGER NOT NULL,
                peak_stress     INTEGER NOT NULL,
                avg_bpm         REAL    NOT NULL,
                trigger         TEXT,
                recommendation  TEXT,
                risk_level      TEXT
            )
        """)


_init_db()


async def log_episode(duration: int, peak_stress: int, avg_bpm: float) -> int:
    """Сохраняет эпизод и возвращает его id."""
    started_at = datetime.now(timezone.utc).isoformat()

    def _insert():
        with _get_conn() as conn:
            cur = conn.execute(
                "INSERT INTO episodes (started_at, duration_sec, peak_stress, avg_bpm) VALUES (?, ?, ?, ?)",
                (started_at, duration, peak_stress, round(avg_bpm, 1)),
            )
            return cur.lastrowid

    return await asyncio.to_thread(_insert)


async def save_analysis(episode_id: int, trigger: str, recommendation: str, risk_level: str) -> None:
    def _update():
        with _get_conn() as conn:
            conn.execute(
                "UPDATE episodes SET trigger=?, recommendation=?, risk_level=? WHERE id=?",
                (trigger, recommendation, risk_level, episode_id),
            )

    await asyncio.to_thread(_update)


async def get_last_episodes(limit: int = 20) -> list[dict]:
    def _query():
        with _get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM episodes ORDER BY id DESC LIMIT ?", (limit,)
            ).fetchall()
        return [_row_to_dict(r) for r in rows]

    return await asyncio.to_thread(_query)


async def get_analysis(episode_id: int) -> dict | None:
    def _query():
        with _get_conn() as conn:
            row = conn.execute(
                "SELECT trigger, recommendation, risk_level FROM episodes WHERE id=?",
                (episode_id,),
            ).fetchone()
        return dict(row) if row else None

    return await asyncio.to_thread(_query)


def _row_to_dict(row: sqlite3.Row) -> dict:
    d = dict(row)
    analysis = None
    if d.get("trigger"):
        analysis = {
            "trigger": d.pop("trigger"),
            "recommendation": d.pop("recommendation"),
            "risk_level": d.pop("risk_level"),
        }
    else:
        d.pop("trigger", None)
        d.pop("recommendation", None)
        d.pop("risk_level", None)
    d["analysis"] = analysis
    return d
