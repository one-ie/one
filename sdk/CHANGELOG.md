# Changelog — @oneie/sdk

## 0.2.0

- `SubstrateClient` class — 12 typed methods for all substrate verbs
- `Outcome<T>` discriminated union — `result | timeout | dissolved | failure`, each with `latency: number`
- New response types: `SignalResponse`, `HighwaysResponse`, `HypothesesResponse`, `MarkDimsResponse`, `DecayResponse`
- Telemetry module — anonymous fire-and-forget signals to api.one.ie; opt-out via `ONEIE_TELEMETRY_DISABLE=1`
- `SDK_VERSION` export — `"0.2.0"`

## 0.1.0

- Initial release: `launch()`, `register()`, URL helpers, storage utils, handoff.
