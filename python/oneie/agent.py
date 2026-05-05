"""Load agent.md → Pydantic models → uAgents Protocol."""

from __future__ import annotations
import re
import yaml
from pathlib import Path
from typing import Any

import pydantic
from uagents import Agent as UAgent, Protocol


def _parse_md(path: str) -> tuple[dict[str, Any], str]:
    """Split agent.md into frontmatter dict + body string."""
    text = Path(path).read_text()
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not m:
        return {}, text
    meta: dict[str, Any] = yaml.safe_load(m.group(1)) or {}
    body = text[m.end():]
    return meta, body


def _schema_to_model(name: str, schema: dict[str, Any]) -> type[pydantic.BaseModel]:
    """Build a Pydantic model from a JSON Schema object."""
    props = schema.get("properties", {})
    required = set(schema.get("required", []))
    type_map = {"string": str, "integer": int, "number": float, "boolean": bool}
    fields: dict[str, Any] = {}
    for k, v in props.items():
        t = type_map.get(v.get("type", "string"), str)
        fields[k] = (t, ...) if k in required else (t | None, None)
    return pydantic.create_model(name, **fields)  # type: ignore[call-overload]


class Agent:
    def __init__(self, path: str):
        self.meta, self.prompt = _parse_md(path)
        self.name: str = self.meta.get("name", Path(path).stem)
        self._base = Path(path).parent
        self._protocols: list[Protocol] = []
        self._build_protocols()

    def _build_protocols(self) -> None:
        for skill_name in self.meta.get("skills", []):
            skill_path = self._base / "skills" / f"{skill_name}.md"
            if not skill_path.exists():
                continue
            skill_meta, _ = _parse_md(str(skill_path))
            schema = skill_meta.get("inputSchema") or {}
            if not schema:
                continue
            version: str = str(skill_meta.get("version", "0.1.0"))
            _Model = _schema_to_model(f"{skill_name}_Input", schema)
            proto = Protocol(name=skill_name, version=version)
            self._protocols.append(proto)

    def run(self, seed: str | None = None, mailbox: bool | None = None) -> None:
        from .almanac import register
        use_mailbox = mailbox if mailbox is not None else bool(self.meta.get("mailbox", False))
        agent = UAgent(name=self.name, seed=seed or self.meta.get("seed"))
        for proto in self._protocols:
            agent.include(proto)
        if use_mailbox:
            register(agent, self.meta)
        agent.run()
