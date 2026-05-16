import json
import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

SYSTEM = """You are a neurodiversity specialist. Analyze sensory overload episodes for people with autism or Tourette's.
Respond ONLY with valid JSON, no markdown.
Format: {"trigger": "...", "recommendation": "...", "risk_level": "low"|"medium"|"high"}"""


async def analyze_episode(episode: dict) -> dict | None:
    try:
        msg = (
            f"Sensory overload episode:\n"
            f"- Duration: {episode.get('duration_sec')}s\n"
            f"- Peak stress: {episode.get('peak_stress')}%\n"
            f"- Avg BPM: {episode.get('avg_bpm')}\n"
            f"- Started: {episode.get('start_time')}\n"
            "Identify likely trigger, give caregiver recommendation, assess recurrence risk."
        )
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=256,
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": msg},
            ],
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"[ai_client] analysis failed: {e}")
        return None
