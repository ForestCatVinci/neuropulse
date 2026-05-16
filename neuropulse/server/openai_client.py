import json
import os
from datetime import datetime, timezone

from openai import AsyncOpenAI

from episode_logger import save_analysis, get_last_episodes

_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """Ты — специалист по нейроразнообразию. Анализируй эпизоды сенсорной перегрузки
у людей с аутизмом или синдромом Туретта. Отвечай ТОЛЬКО валидным JSON без markdown.
Формат: {"trigger": "...", "recommendation": "...", "risk_level": "low"|"medium"|"high"}
- trigger: вероятный триггер (1 предложение на русском)
- recommendation: рекомендация опекуну (1 предложение на русском)
- risk_level: оценка риска повторения"""


async def analyze_episode(episode_id: int) -> None:
    """Запрашивает анализ у OpenAI и сохраняет результат в БД."""
    # берём последние эпизоды, чтобы найти нужный
    episodes = await get_last_episodes(limit=20)
    episode = next((e for e in episodes if e["id"] == episode_id), None)
    if not episode:
        return

    now = datetime.now(timezone.utc)
    hour = now.hour
    weekday = now.strftime("%A")

    user_msg = (
        f"Эпизод сенсорной перегрузки:\n"
        f"- Длительность: {episode['duration_sec']} секунд\n"
        f"- Пиковый стресс: {episode['peak_stress']}%\n"
        f"- Средний BPM: {episode['avg_bpm']}\n"
        f"- Время суток: {hour}:00, {weekday}\n"
        f"Определи вероятный триггер, дай рекомендацию и оцени риск."
    )

    try:
        response = await _client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.4,
            max_tokens=256,
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)

        await save_analysis(
            episode_id=episode_id,
            trigger=data.get("trigger", "Неизвестно"),
            recommendation=data.get("recommendation", "—"),
            risk_level=data.get("risk_level", "medium"),
        )
    except Exception as e:
        # не ломаем основной процесс — анализ опциональный
        print(f"[openai_client] Ошибка анализа эпизода {episode_id}: {e}")
