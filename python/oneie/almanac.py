"""Fetch.ai Almanac registration for uAgents agents."""

from __future__ import annotations
import os
from typing import Any

from uagents import Agent


AGENTVERSE_URL = "https://agentverse.ai"


def register(agent: Agent, meta: dict[str, Any]) -> None:
    """Register agent on Almanac with all skill protocols."""
    api_key = os.environ.get("AGENTVERSE_API_KEY", "")
    endpoint: str = meta.get("agentverse", AGENTVERSE_URL)
    bureau_url: str | None = meta.get("bureau")

    if api_key:
        host = endpoint.removeprefix("https://").removeprefix("http://")
        agent.mailbox = f"{api_key}@{host}"

    if bureau_url:
        return

    for proto in agent.protocols.values():
        digest = getattr(proto, "digest", None)
        if not digest:
            raise RuntimeError(
                f"Protocol '{proto.name}' missing digest — bump version before re-registering"
            )
