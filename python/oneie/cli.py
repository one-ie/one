"""oneie run — entry point for the Python agent runtime."""

import click
from pathlib import Path


@click.group()
def main() -> None:
    """ONE agent CLI."""


@main.command()
@click.argument("path", type=click.Path(exists=True, path_type=Path))
@click.option("--seed", default=None, help="Agent seed phrase for deterministic address")
@click.option("--mailbox/--no-mailbox", default=None, help="Override mailbox setting from frontmatter")
def run(path: Path, seed: str | None, mailbox: bool | None) -> None:
    """Load agent.md and run on Fetch.ai uAgents network."""
    from .agent import Agent
    agent = Agent(str(path))
    click.echo(f"Starting agent '{agent.name}' from {path}")
    agent.run(seed=seed, mailbox=mailbox)


if __name__ == "__main__":
    main()
