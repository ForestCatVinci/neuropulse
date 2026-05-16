import json
import os
from anthropic import AsyncAnthropic

client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

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
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=256,
            messages=[{"role": "user", "content": msg}],
            system=SYSTEM,
        )
        return json.loads(response.content[0].text.strip())
    except Exception as e:
        print(f"[claude_client] analysis failed: {e}")
        return None
