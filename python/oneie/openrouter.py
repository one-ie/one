"""OpenAI-compatible OpenRouter client for agent tool-calling."""

from __future__ import annotations
import os
import httpx
from typing import Any


OPENROUTER_BASE = "https://openrouter.ai/api/v1"


class OpenRouterClient:
    def __init__(self, api_key: str | None = None, model: str = "anthropic/claude-haiku-4-5"):
        self.api_key = api_key or os.environ["OPENROUTER_API_KEY"]
        self.model = model
        self._client = httpx.Client(
            base_url=OPENROUTER_BASE,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            timeout=60,
        )

    def chat(self, messages: list[dict[str, Any]], **kwargs: Any) -> dict[str, Any]:
        resp = self._client.post("/chat/completions", json={"model": self.model, "messages": messages, **kwargs})
        resp.raise_for_status()
        result: dict[str, Any] = resp.json()
        return result

    def complete(self, prompt: str, **kwargs: Any) -> str:
        result = self.chat([{"role": "user", "content": prompt}], **kwargs)
        content: str = result["choices"][0]["message"]["content"]
        return content
