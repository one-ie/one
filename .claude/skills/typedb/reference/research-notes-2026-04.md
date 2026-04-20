# TypeDB Paper Corpus — Research Notes

Collected 2026-04-20. Source: TypeDB blog, fundamentals docs, and the TypeDB 3.0 GitHub roadmap (ACM paper itself is paywalled).

## 1. TypeQL (PACMMOD 2024) — Dorn & Pribadi

**Venue:** ACM SIGMOD/PODS 2024, Proceedings of the ACM on Management of Data 2.2 (PODS), Article 110, May 2024.
**Award:** Best Newcomer Award, SIGMOD/PODS 2024.
**DOI:** 10.1145/3651611.
**Canonical URL:** https://typedb.com/papers/typeql-theory

### Core thesis

The paper introduces the **Polymorphic Entity-Relation-Attribute (PERA) data model**, grounded in modern type theory, accessible through classical conceptual modeling, queried via TypeQL.

### Key technical contributions

1. **"Queries as Types"** — a generalization of Wadler's "Propositions as Types". In TypeQL, *the user constructs types in order to formulate queries*. This is the philosophical pivot away from SQL's operational model (sequences of table transformations).
2. **Relations as dependent types** — characterized as "dependent types that hold unique object identifiers".
3. **Attributes as independent or dependent types** — dependent attributes hold literal values.
4. **Type functions** — an emergent feature where dependent types and subtypes mix, "neatly generalizes Datalog-like reasoning".
5. **Subtyping + polymorphism** — TypeQL uses "interfaces" where other languages say "typeclasses" (Haskell) or "traits" (Rust).

### Contrast with other query languages

- **SQL** — operates on tables, algebraic/operational viewpoint. Queries are sequences that transform tables into tables.
- **NoSQL/Document** — aggregation pipelines over documents, no type system.
- **Cypher / SPARQL** — pattern-based and declarative, but "lack a sophisticated type system".

## 2. TypeDB 3.0 — GitHub Roadmap (Issue #6764)

**Source:** https://github.com/typedb/typedb/issues/6764

### API breaking changes

- **Sessions removed** — replaced by three transaction types (read / write / schema).
- **Thing / Type hidden** — removed from public-facing interfaces.
- **Concept API dropped** — replaced by enhanced TypeQL. All operations go through queries now.

### TypeQL language additions

- **Functions** — replace `rule` syntax from 2.x (now the only way to express derivation logic).
- **Pipelines** — chainable streaming operations across all clauses (the big one).
- **Cascading delete** — delete one thing, cascades to dependent attributes.
- **Default dependent attributes**.
- **Struct value types** — compound values.
- **List attribute ownerships** — `owns name[]`.
- **Compound keys** — roles can act as keys.
- **Abstract attribute hierarchies** — abstract attributes without forcing a value type.
- **Attributes forbidden from playing roles or owning attributes** — enforces a cleaner model.
- **Enumerated value restrictions** — `value X @values("a", "b")`.
- **Regex as annotations**.

### Relation implementation

- Indexed relations (query optimizer).
- Virtualized role instances (memory overhead reduction).

### Rejected proposals

- Immutable relations.
- Prohibition on playing identical roles multiple times in one relation.

## 3. Fundamentals — Polymorphic Schema Example

Canonical example from https://typedb.com/fundamentals/typedb-polymorphic-database
This is the "filesystem / user-group / resource" schema TypeDB uses to teach polymorphism.

```typeql
define

entity user,
    owns email,
    owns password-hash,
    owns created-timestamp,
    owns active,
    plays resource-ownership:resource-owner;

entity admin sub user,
    plays group-ownership:group-owner;

entity user-group,
    owns name,
    owns created-timestamp,
    plays group-ownership:group,
    plays resource-ownership:resource-owner;

entity resource @abstract,
    owns id,
    owns created-timestamp,
    owns modified-timestamp,
    plays resource-ownership:resource;

entity file sub resource,
    owns path;

entity directory sub resource,
    owns path;

relation ownership @abstract,
    relates owned,
    relates owner;

relation group-ownership sub ownership,
    relates group as owned,
    relates group-owner as owner;

relation resource-ownership sub ownership,
    relates resource as owned,
    relates resource-owner as owner;

attribute id @abstract, value string;
attribute email sub id;
attribute name sub id;
attribute path sub id;
attribute password-hash, value string;
attribute event-timestamp @abstract, value datetime;
attribute created-timestamp sub event-timestamp;
attribute modified-timestamp sub event-timestamp;
attribute active, value boolean;
```

**What it teaches:**
- Abstract entities (`@abstract`) with `sub` inheritance.
- Relation inheritance with **role aliasing**: `relates group as owned` (subtype role renames a supertype role but keeps hierarchy).
- Abstract attribute hierarchies: `attribute id @abstract, value string;` with `attribute email sub id;`.
- Interface polymorphism via `plays X:Y`.

### Polymorphic query example

```typeql
match
  $resource isa resource;
fetch {
  "resource": {
    "id": $resource.id,
    "event-timestamp": [ $resource.event-timestamp ],
  }
};
```

Returns every resource + every subtype (file, directory). The square brackets on `event-timestamp` indicate this is a **list** — because `created-timestamp` and `modified-timestamp` are both subtypes of `event-timestamp` and a resource owns one of each, the polymorphic fetch returns both.

## 4. "Inside TypeDB: The Next Chapter" — Dec 2025

Highlights from the latest company all-hands (Callum = interim CEO, Joshua = CTO):

- **TypeDB 3.0 delivered early 2025** — "we delivered TypeDB 3 which is what we believe to be the most commercially viable version".
- **Rust rewrite** — "after we spent some time rebuilding it in Rust and extending the language further". Highly-available cluster is the next rewrite target.
- **Positioning** — "fourth category of database" alongside relational, graph, document.
- **Benchmarks** — "competitive and surpassing Neo4j" on their first Rust optimization pass.
- **TypeDB Studio** — now web-based (was Kotlin desktop), connects to any local or TypeDB Cloud server over HTTP.
- **Vibe Querying** — agentic TypeQL-generation on GPT-5, embedded in docs, studio, chatbot.
- **Knowledge graphs** — repositioned as the primary commercial use case alongside "intelligent systems" and "agentic apps".
- **Commercial pivot** — after 10 years as a research org, 2025 was the year they "shifted from research-focused organization to a commercial company".

## 5. Video corpus index

See `/tmp/typedb-research/videos/index.tsv`. 15 talks, 2021–2026, 640K plain text.

Most relevant for a refined skill:
- `e0lmTSb-rzY` — Introduction to TypeDB and TypeQL (the canonical onboarding, 5,360 views).
- `LMzZoq6fUqg` — Intro to TypeDB - A New Programming Paradigm (2024 presentation).
- `IJomvpKbevk` — Lecture: The Polymorphic Data Model With Types (87 mins, 2024, SIGMOD-paper deep-dive).
- `MF2vaEo3o58` — Lecture: Type Theory as the Unifying Foundation (Nov 2023).
- `2S0zPXQCy0U` — Lecture: Why We Need a Polymorphic Database (Dec 2023).
- `LS6C4Gl9ldU` — Inside TypeDB: The Next Chapter (Dec 2025, latest).
- `ffGXheePzKQ` / `-qtqIpl2ntw` / `2YUUPm_O3mU` — Origins podcast series (Rust rewrite context).
- `XZWV3NlnMJA` — Inference in TypeDB (2021, but still relevant to how functions generalize the old rules).
