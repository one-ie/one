# TypeDB 3.0 Complete Reference Skill

> **Version**: TypeDB 3.x (3.0+)
> **Last Updated**: 2026-04-20
> **Purpose**: Comprehensive TypeDB/TypeQL knowledge for Claude Code
> **Primary sources**: TypeQL paper (Dorn & Pribadi, PACMMOD 2024, *Best Newcomer Award* at SIGMOD/PODS 2024) · TypeDB lecture series (Vaticle YouTube, 2023–2024) · "Inside TypeDB: The Next Chapter" (Dec 2025) · TypeDB 3.0 roadmap ([GitHub #6764](https://github.com/typedb/typedb/issues/6764))

---

## Table of Contents

1. [Overview](#overview) — includes *Fourth Category of Database* and *Queries as Types* framing
2. [Critical Syntax Rules](#critical-syntax-rules)
3. [Schema Definition](#schema-definition)
4. [Data Pipelines](#data-pipelines)
5. [Query Operations](#query-operations)
6. [Functions](#functions)
7. [Patterns](#patterns)
8. [Annotations](#annotations)
9. [Value Types](#value-types)
10. [Python Driver](#python-driver)
11. [Transaction Management](#transaction-management)
12. [Best Practices](#best-practices)
13. [Query Optimization](#query-optimization)
14. [Complete Keyword Reference](#complete-keyword-reference)
15. [Mental Models (Type Theory, Polymorphism, Dependent Types)](#mental-models-type-theory-polymorphism-dependent-types)
16. [Canonical Polymorphic Example: Filesystem + Ownership](#canonical-polymorphic-example-filesystem--ownership)
17. [TypeDB 3.x Feature Deep Dive](#typedb-3x-feature-deep-dive) — cascade, structs, list attrs, `@index`, functions, MVCC
18. [Production Deployment & Scaling](#production-deployment--scaling)
19. [Development Tools & Ecosystem](#development-tools--ecosystem) — Studio, Vibe Querying, Cloud, LSP
20. [SQL → TypeQL: Concrete Contrasts](#sql--typeql-concrete-contrasts)
21. [Works With /sui](#works-with-sui--the-same-ontology-two-deterministic-fires)
22. [Production Patterns: Classifier Functions, Thing Collapse, Symmetric Routing](#production-patterns-classifier-functions-thing-collapse-symmetric-routing) — from `src/schema/world.tql`
23. [Project-Specific Patterns](#project-specific-patterns)

---

## Overview

TypeDB is a strongly-typed, polymorphic, transactional database using the **Polymorphic Entity-Relation-Attribute (PERA)** data model. TypeQL is its declarative query language. The **PERA model** and its **Queries as Types** principle were published at SIGMOD/PODS 2024 (Dorn & Pribadi, PACMMOD 2024, Article 110, *Best Newcomer Award*) — DOI [10.1145/3651611](https://dl.acm.org/doi/10.1145/3651611).

### The Fourth Category of Database

TypeDB is positioned as a **fourth category of database**, generalizing the first three:

1. **Relational** — tables, rows, foreign keys
2. **Graph** — nodes, edges, labels
3. **Document** — nested JSON-like trees, flexible schema
4. **Polymorphic (TypeDB)** — entities, relations, attributes with type polymorphism, interface-based role playing, and type-theoretic query semantics

TypeDB 3.x is written in **Rust** (rewritten from Java in 2024–2025) and is "competitive and surpassing Neo4j" on their first Rust optimization pass (per "Inside TypeDB: The Next Chapter", Dec 2025). It's especially aimed at:
- **Knowledge graphs** and semantic-driven applications
- **Intelligent / agentic systems** that need polymorphic reasoning
- **Complex domain models** where inheritance, role-based access, and multi-value constraints matter

### Queries as Types (the core mental model)

TypeQL's design inverts SQL's operational worldview. In SQL you write a *plan* (scan, filter, project). In TypeQL you describe a **type** — and that type *is* the query:

```typeql
# This pattern describes a type: "(user, name) pairs where user owns name"
match
  $u isa user, has name $n;
select $u, $n;
```

This is a generalization of Wadler's *Propositions as Types* into **Queries as Types**. Consequences:
- **Composability** — types compose (dependent types), queries stay concise as schemas grow.
- **Polymorphism by default** — `$x isa vehicle` matches cars, bikes, drones without rewriting.
- **Planner freedom** — declarative intent lets the optimizer reorder, parallelize, index freely.

### Core Concepts

- **Entity Types**: Independent objects that exist without dependencies
- **Relation Types**: **Dependent types** — their instances depend on instances of other types (role players). Explicit n-ary dependency makes integrity, cascade, and indexing explicit.
- **Attribute Types**: Store primitive values, identified by their value. Immutable by identity.
- **Roles**: **Interfaces** that types implement to participate in relations (think typeclasses / traits).
- **Ownership**: Types declare what attributes they own. `plays` declares roles they fulfill.
- **Type Hierarchies**: Single-inheritance subtyping with `sub`. Works on entities, relations, AND attributes.
- **Type Functions**: `fun` declarations replace 2.x `rule`; dependent-type subtyping generalizes Datalog-like reasoning.

### Connection Details (TypeDB Cloud)

```python
from typedb.driver import TypeDB, Credentials, DriverOptions, TransactionType

# Connect to TypeDB Cloud
credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])
options = DriverOptions(is_tls_enabled=True)
driver = TypeDB.driver("https://server.cluster.typedb.com:80", credentials, options)

# Open transaction (no sessions in 3.0!)
with driver.transaction("database-name", TransactionType.READ) as tx:
    result = tx.query("match $e isa entity; select $e; limit 10;").resolve()
```

---

## Critical Syntax Rules

### MUST-KNOW RULES

| Feature | Correct TypeDB 3.0 |
|---------|-------------------|
| Sessions | **NO SESSIONS** - transactions directly on driver |
| Concept API | **DROPPED** — all operations go through TypeQL queries |
| Query syntax | `match ... select` |
| Delete syntax | `delete $attr;` (NOT `delete $e has attr $attr;`) |
| Value type: integer | `integer` (NOT `long`) |
| Value type: float | `double` |
| Type declaration | `entity person` (root types) or `entity employee sub person` (subtypes) |
| Variables | All use `$` |
| Functions | `fun name() -> type:` (replaces rules) |
| Attributes | **CANNOT** own attributes. **CANNOT** play roles. Model as entities if you need either. |
| Role aliasing | `relates group as owned` — a subtype relation can rename an inherited role |
| List attributes | `attribute emails, value string[];` — 3.x-only syntax for list-valued attributes |
| Struct values | `struct address { street: string, city: string };` — 3.x compound values |

### Transaction Pattern (No Sessions!)

```python
# CORRECT - Direct transaction on driver
with driver.transaction("database", TransactionType.READ) as tx:
    result = tx.query("match $p isa person; select $p;").resolve()
```

### Delete Syntax (CRITICAL!)

```typeql
# CORRECT: Delete the attribute itself
match $p isa person, has name $n;
delete $n;

# CORRECT: Delete ownership (keep attribute, remove from owner)
delete has $n of $p;
```

### Schema Declaration

```typeql
# Root type declaration
entity person;
relation friendship;
attribute name, value string;

# Subtype declaration (uses sub)
entity employee sub person;
```

---

## Schema Definition

### Entity Types

```typeql
define

# Basic entity
entity person;

# Entity with ownership
entity user,
    owns username @key,
    owns email @unique,
    owns age;

# Abstract entity (cannot be instantiated)
entity content @abstract;

# Entity with role playing
entity company,
    plays employment:employer,
    plays ownership:owner;

# Subtype inheritance
entity employee sub person,
    owns employee-id @key,
    plays employment:employee;
```

### Relation Types

```typeql
define

# Basic relation with roles
relation friendship,
    relates friend @card(2);  # Exactly 2 friends

# Relation with different roles
relation employment,
    relates employer @card(1),     # One employer
    relates employee @card(1..);   # One or more employees

# Relation with attributes
relation transaction,
    relates buyer,
    relates seller,
    owns amount,
    owns timestamp;

# Abstract relation
relation interaction @abstract,
    relates subject,
    relates content;

# Relation with role specialization
relation content-engagement sub interaction,
    relates author as subject;  # 'author' specializes 'subject'
```

### Attribute Types

```typeql
define

# Basic attributes with value types
attribute name, value string;
attribute age, value integer;          # NOT 'long'
attribute score, value double;         # NOT 'float'
attribute balance, value decimal;
attribute active, value boolean;
attribute birth-date, value date;
attribute created-at, value datetime;
attribute created-with-tz, value datetime-tz;
attribute duration, value duration;

# Attribute with regex constraint
attribute email, value string @regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

# Attribute with value constraint
attribute status, value string @values("pending", "active", "completed", "cancelled");

# Attribute with range constraint
attribute percentage, value double @range(0.0..100.0);

# Independent attribute (survives without owner)
attribute log-entry, value string @independent;

# Attribute subtype
attribute full-name sub name;
```

### Ownership Declarations

```typeql
define

entity person,
    owns name @card(1..3),      # 1 to 3 names
    owns email @key,            # Unique identifier
    owns phone @unique,         # Unique but optional
    owns nickname @card(0..);   # Any number

# Ownership with ordering
entity playlist,
    owns song @card(0..) @distinct;  # Unique songs only
```

### Complete Schema Example

```typeql
define

# Attributes
attribute id, value string;
attribute name, value string;
attribute email, value string @regex("^.*@.*\\..*$");
attribute age, value integer @range(0..150);
attribute balance, value decimal;
attribute timestamp, value datetime-tz;
attribute status, value string @values("active", "inactive", "pending");

# Entities
entity person @abstract,
    owns id @key,
    owns name @card(1),
    owns email @unique,
    owns age;

entity user sub person,
    owns balance,
    plays friendship:friend,
    plays employment:employee;

entity company,
    owns id @key,
    owns name,
    plays employment:employer;

# Relations
relation friendship,
    relates friend @card(2);

relation employment,
    relates employer @card(1),
    relates employee @card(1..),
    owns timestamp,
    owns status;
```

### Undefine (Remove Schema Elements)

```typeql
# Remove a type
undefine user;

# Remove ownership from a type
undefine owns email from user;

# Remove role playing from a type
undefine plays friendship:friend from user;

# Remove a role from a relation
undefine relates employee from employment;

# Remove an annotation
undefine @unique from user owns email;

# Remove a function
undefine fun calculate_score;
```

### Redefine (Modify Schema Elements)

```typeql
# Redefine type hierarchy (one change per query)
redefine user sub page;

# Redefine attribute value type
redefine karma value integer;

# Redefine annotation
redefine email value string @regex("^.*@typedb\\.com$");

# Redefine role specialization
redefine fathership relates father as parent;
```

---

## Data Pipelines

TypeQL queries are **pipelines** of stages. Each stage accepts a stream of answers and outputs a stream.

### Pipeline Categories

- **Write Pipelines**: Contain insert, delete, update, or put stages
- **Read Pipelines**: Only retrieve data (match, fetch, select)

### Pipeline Stages

| Stage | Purpose | Transaction Type |
|-------|---------|------------------|
| `match` | Find existing data | READ, WRITE, SCHEMA |
| `insert` | Create new data | WRITE |
| `delete` | Remove data | WRITE |
| `update` | Modify single-cardinality data | WRITE |
| `put` | Insert if not exists | WRITE |
| `fetch` | Format output as JSON | READ |
| `select` | Keep specified variables | READ |
| `reduce` | Aggregate results | READ |
| `sort` | Order results | READ |
| `limit` | Restrict result count | READ |
| `offset` | Skip initial results | READ |
| `distinct` | Remove duplicates | READ |
| `require` | Filter elements with variables | READ |
| `with` | Define ad-hoc functions | READ |

---

## Query Operations

### Match (Read Data)

```typeql
# Basic match
match $u isa user;
select $u;

# Match with attributes
match
    $u isa user,
        has name $n,
        has age $a;
select $u, $n, $a;

# Match with conditions
match
    $u isa user, has age $a;
    $a >= 18;
select $u;

# Match relations
match
    $f isa friendship,
        links (friend: $u1, friend: $u2);
    $u1 has name "Alice";
select $u2;

# Match with negation
match
    $u isa user;
    not { $u has status "inactive"; };
select $u;

# Match with disjunction (OR)
match
    $u isa user;
    { $u has status "active"; } or { $u has status "pending"; };
select $u;

# Match with optional
match
    $u isa user, has name $n;
    try { $u has email $e; };  # Optional email
select $n, $e;
```

### Insert (Create Data)

```typeql
# Insert entity with attributes
insert $u isa user,
    has id "user-001",
    has name "Alice",
    has age 30;

# Insert multiple entities
insert
    $u1 isa user, has id "u1", has name "Alice";
    $u2 isa user, has id "u2", has name "Bob";

# Match-Insert (create based on existing data)
match
    $u1 isa user, has name "Alice";
    $u2 isa user, has name "Bob";
insert
    $f isa friendship, links (friend: $u1, friend: $u2);

# Insert relation with attributes
insert
    $e isa employment,
        links (employer: $company, employee: $person),
        has timestamp 2025-01-15T10:00:00,
        has status "active";
```

### Delete (Remove Data)

```typeql
# Delete an entity (cascades to relations and owned attributes)
match $u isa user, has id "user-001";
delete $u;

# Delete an attribute (the attribute value itself)
match
    $u isa user, has id "user-001";
    $u has email $e;
delete $e;

# Delete ownership (keep attribute, remove from owner)
match
    $u isa user, has id "user-001";
    $u has nickname $n;
delete has $n of $u;

# Delete role player from relation
match
    $f isa friendship, links (friend: $u);
    $u has id "user-001";
delete links (friend: $u) of $f;

# Delete relation
match $f isa friendship;
delete $f;
```

### Update (Modify Single-Cardinality Data)

```typeql
# Update works ONLY for @card(0..1) or @card(1)
match $u isa user, has id "user-001";
update $u has status "inactive";

# Update replaces the value or adds if none exists
match $u isa user, has name "Alice";
update $u has age 31;
```

### Put (Upsert - Insert if Not Exists)

```typeql
# Put entire pattern
put $u isa user, has id "user-001", has name "Alice";

# Put is all-or-nothing
# If ANY part doesn't match, entire pattern is inserted
put
    $u isa user, has id "user-001";
    $u has status "active";
```

### Select (Project Variables)

```typeql
# Select specific variables
match $u isa user, has name $n, has age $a;
select $n, $a;

# Select with expressions
match
    $u isa user, has age $a;
    let $next_year = $a + 1;
select $u, $next_year;
```

### Fetch (JSON Output)

```typeql
# Basic fetch
match $u isa user;
fetch {
    "name": $u.name,
    "email": $u.email
};

# Fetch with subquery
match $u isa user;
fetch {
    "user": $u.name,
    "friends": [
        match ($u, $friend) isa friendship;
        fetch { "friend_name": $friend.name };
    ]
};

# Fetch all attributes
match $u isa user;
fetch {
    "user_data": { $u.* }
};
```

### Reduce (Aggregations)

```typeql
# Count
match $u isa user;
reduce $count = count;

# Multiple aggregations
match $u isa user, has age $a;
reduce
    $count = count,
    $avg_age = mean($a),
    $max_age = max($a),
    $min_age = min($a),
    $total_age = sum($a);

# Group by
match
    $u isa user, has status $s, has age $a;
reduce $count = count, $avg = mean($a) groupby $s;

# Available aggregation functions:
# count, sum, mean, median, min, max, std, list
```

### Sort, Limit, Offset

```typeql
# Sort ascending (default)
match $u isa user, has age $a;
select $u, $a;
sort $a;

# Sort descending
match $u isa user, has score $s;
select $u, $s;
sort $s desc;

# Multiple sort keys
match $u isa user, has name $n, has age $a;
select $n, $a;
sort $a desc, $n asc;

# Pagination
match $u isa user;
select $u;
sort $u;
offset 20;
limit 10;
```

### Distinct

```typeql
# Remove duplicate results
match
    $f isa friendship, links (friend: $u);
select $u;
distinct;
```

---

## Functions

Functions replace rules from TypeDB 2.x. They are **read-only** query abstractions.

### Function Syntax

```typeql
define

# Scalar function (returns single value)
fun user_age($user: user) -> integer:
    match $user has age $a;
    return first $a;

# Stream function (returns multiple values)
fun user_friends($user: user) -> { user }:
    match ($user, $friend) isa friendship;
    return { $friend };

# Tuple function (returns multiple values per row)
fun user_info($user: user) -> string, integer:
    match $user has name $n, has age $a;
    return first $n, $a;

# Aggregation function
fun friend_count($user: user) -> integer:
    match ($user, $friend) isa friendship;
    return count($friend);

# Recursive function (transitive closure)
fun reachable($from: node) -> { node }:
    match
        { $_ isa edge, links (from: $from, to: $to); }
        or {
            let $mid in reachable($from);
            $_ isa edge, links (from: $mid, to: $to);
        };
    return { $to };
```

### Using Functions in Queries

```typeql
# Using scalar function
match
    $u isa user;
    let $age = user_age($u);
    $age > 18;
select $u;

# Using stream function
match
    $u isa user, has name "Alice";
    let $friend in user_friends($u);
select $friend;

# Using tuple function
match
    $u isa user;
    let $name, $age = user_info($u);
select $name, $age;
```

### Ad-hoc Functions with `with`

```typeql
with
    fun is_adult($u: user) -> boolean:
        match $u has age $a; $a >= 18;
        return first true;
match
    $u isa user;
    let $adult = is_adult($u);
    $adult == true;
select $u;
```

---

## Inference Rules (Emergence Patterns)

TypeDB inference rules derive NEW facts automatically from existing data. This is the foundation for emergent intelligence.

### Basic Classification Rule

```typeql
define

rule elite-pattern:
    when {
        $e isa signal-edge,
            has win-rate $wr,
            has trail-pheromone $tp,
            has traversal-count $tc;
        $wr >= 0.75;
        $tp >= 70.0;
        $tc >= 50;
    } then {
        $e has tier "elite";
    };
```

### Danger Detection

```typeql
define

rule danger-zone:
    when {
        $e isa signal-edge,
            has win-rate $wr,
            has alarm-pheromone $ap;
        $wr < 0.40;
        $ap >= 25.0;
    } then {
        $e has tier "danger";
    };
```

### Chained Rules (Hardening)

```typeql
define

# This rule depends on elite-pattern rule firing first
rule hardening-candidate:
    when {
        $e isa signal-edge,
            has tier "elite",         # DERIVED from elite-pattern rule
            has traversal-count $tc,
            has trail-pheromone $tp;
        $tc >= 100;
        $tp >= 80.0;
    } then {
        $e has hardening-ready true;
    };
```

### Rule with Disjunction (OR)

```typeql
define

rule high-funding-opportunity:
    when {
        $f isa funding-snapshot, has funding-rate $rate;
        { $rate > 0.001; } or { $rate < -0.001; };
    } then {
        $f has severity "high";
    };
```

### Rule with Computed Value

```typeql
define

rule reliable-detector:
    when {
        $d isa detector,
            has total-predictions $tp,
            has correct-predictions $cp;
        $tp >= 20;
        ?acc = $cp / $tp;
        ?acc >= 0.60;
    } then {
        $d has pheromone-level ?acc;
    };
```

### Superhighway Detection

```typeql
define

rule superhighway-edge:
    when {
        $e isa signal-edge,
            has trail-pheromone $tp,
            has traversal-count $tc;
        $tp >= 85.0;
        $tc >= 100;
    } then {
        $e has is-superhighway true;
    };
```

### Querying Derived Facts

```typeql
# tier = "elite" is DERIVED by inference rule, not inserted
match $e isa signal-edge, has tier "elite";
select $e;

# Find hardening candidates (derived from chained rules)
match $e isa signal-edge, has hardening-ready true;
select $e;
```

---

## Patterns

### Conjunctions (AND)

```typeql
# Statements separated by semicolons form conjunctions
match
    $u isa user;
    $u has name "Alice";
    $u has age $a;
    $a > 18;
select $u;
```

### Disjunctions (OR)

```typeql
match
    $u isa user;
    { $u has status "active"; } or { $u has status "pending"; };
select $u;

# Multiple branches
match
    $u isa user;
    { $u has role "admin"; }
    or { $u has role "moderator"; }
    or { $u has role "editor"; };
select $u;
```

### Negations (NOT)

```typeql
match
    $u isa user;
    not { $u has status "deleted"; };
select $u;

# Negation with relations
match
    $u isa user;
    not { ($u) isa ban; };
select $u;
```

### Optionals (TRY)

```typeql
# Optional attribute
match
    $u isa user, has name $n;
    try { $u has email $e; };
select $n, $e;  # $e may be null

# Optional relation
match
    $u isa user;
    try { ($u, $manager) isa management; };
select $u, $manager;
```

### Variable Scope

- Variables have scope within their block `{ ... }` or the entire pattern
- Variables in ALL branches of a disjunction are in parent scope
- Variables in negations are scoped to the negation block

---

## Annotations

### Cardinality Annotations

```typeql
# Exact count
relates friend @card(2);        # Exactly 2

# Range
owns email @card(0..1);         # 0 or 1
owns phone @card(1..);          # 1 or more
owns nickname @card(0..);       # Any number (default for owns)

# Unlimited
plays role @card(0..);          # Default for plays
```

### Uniqueness Annotations

```typeql
# @key: Every owner has exactly one, unique across all owners
owns username @key;

# @unique: Unique across owners, but optional
owns email @unique;

# @subkey: Composite key from multiple attributes
owns first_name @subkey("full_name");
owns last_name @subkey("full_name");
```

### Value Constraint Annotations

```typeql
# @values: Enumerated values
attribute status, value string @values("active", "inactive", "pending");

# @range: Numeric/date range
attribute age, value integer @range(0..150);
attribute score, value double @range(0.0..100.0);

# @regex: String pattern
attribute email, value string @regex("^[^@]+@[^@]+\\.[^@]+$");

# @distinct: Unique values in owned list
owns tag @card(0..) @distinct;
```

### Behavioral Annotations

```typeql
# @abstract: Cannot be instantiated
entity content @abstract;

# @independent: Attribute survives without owners
attribute log_entry, value string @independent;

# @cascade: Delete behavior for relations
relation ownership,
    relates owner @cascade,      # Delete relation when owner deleted
    relates owned;
```

---

## Value Types

| Type | Description | Example |
|------|-------------|---------|
| `boolean` | true/false | `true`, `false` |
| `integer` | 64-bit signed | `42`, `-100` |
| `double` | IEEE 754 double | `3.14`, `1e-10` |
| `decimal` | Fixed-point | `123.456` |
| `string` | UTF-8 text | `"Hello"` |
| `date` | ISO 8601 date | `2025-01-15` |
| `datetime` | Date + time | `2025-01-15T10:30:00` |
| `datetime-tz` | With timezone | `2025-01-15T10:30:00+08:00` |
| `duration` | ISO 8601 duration | `P1Y2M3DT4H5M6S` |

### Value Literals in Queries

```typeql
insert $u isa user,
    has active true,
    has age 30,
    has score 95.5,
    has balance 1234.56,
    has name "Alice",
    has birth_date 1994-05-15,
    has created_at 2025-01-15T10:30:00,
    has created_with_tz 2025-01-15T10:30:00+08:00;
```

---

## Python Driver

### Installation

```bash
pip install typedb-driver
```

### Connection

```python
from typedb.driver import TypeDB, Credentials, DriverOptions, TransactionType

# Community Edition (no auth, no TLS)
driver = TypeDB.driver("localhost:1729")

# TypeDB Cloud / Enterprise
credentials = Credentials("username", "password")
options = DriverOptions(
    is_tls_enabled=True,
    tls_root_ca_path="/path/to/ca.pem"  # Optional for custom CA
)
driver = TypeDB.driver(
    "https://cluster.typedb.com:80",
    credentials,
    options
)

# Context manager recommended
with TypeDB.driver(address, credentials, options) as driver:
    # Operations here
    pass
```

### Database Management

```python
# List databases
databases = driver.databases.all()

# Check if exists
exists = driver.databases.contains("my-database")

# Create database
driver.databases.create("my-database")

# Get database
db = driver.databases.get("my-database")

# Delete database
db.delete()

# Get schema
schema_str = db.schema()
```

### Transaction Types

```python
from typedb.driver import TransactionType

# READ: Read-only queries, concurrent
TransactionType.READ

# WRITE: Data modifications (insert, delete, update, put)
TransactionType.WRITE

# SCHEMA: Schema modifications (define, undefine, redefine)
TransactionType.SCHEMA
```

### Query Execution

```python
# Read transaction
with driver.transaction("my-database", TransactionType.READ) as tx:
    # Execute query
    promise = tx.query("match $u isa user; select $u; limit 10;")
    result = promise.resolve()

    # Process results
    for row in result.as_concept_rows():
        user = row.get("u")
        print(f"User: {user.get_iid()}")

        # Get attributes
        if user.is_entity():
            entity = user.as_entity()
            # Access via subsequent queries

# Write transaction
with driver.transaction("my-database", TransactionType.WRITE) as tx:
    tx.query('insert $u isa user, has name "Alice";').resolve()
    tx.commit()  # MUST commit!

# Schema transaction
with driver.transaction("my-database", TransactionType.SCHEMA) as tx:
    tx.query("define entity new_type;").resolve()
    tx.commit()
```

### Result Processing

```python
# Concept Rows (for select queries)
result = tx.query("match $u isa user, has name $n; select $u, $n;").resolve()
for row in result.as_concept_rows():
    user = row.get("u")           # Get by variable name
    name = row.get("n")

    # Type checking
    if user.is_entity():
        entity = user.as_entity()
        iid = entity.get_iid()

    if name.is_attribute():
        attr = name.as_attribute()
        value = attr.get_string()  # or get_integer(), get_double(), etc.

# Concept Documents (for fetch queries)
result = tx.query("""
    match $u isa user;
    fetch { "name": $u.name, "age": $u.age };
""").resolve()
for doc in result.as_concept_documents():
    print(doc["name"])
    print(doc["age"])

# Schema queries (define/undefine/redefine)
result = tx.query("define entity new_entity;").resolve()
if result.is_ok():
    print("Schema updated successfully")
```

### Type Checking and Casting

```python
# Type checks
concept.is_entity()
concept.is_relation()
concept.is_attribute()
concept.is_entity_type()
concept.is_relation_type()
concept.is_attribute_type()
concept.is_type()
concept.is_instance()
concept.is_value()

# Type casting
entity = concept.as_entity()
relation = concept.as_relation()
attribute = concept.as_attribute()

# Value extraction
attr.get_string()
attr.get_integer()
attr.get_double()
attr.get_decimal()
attr.get_boolean()
attr.get_date()
attr.get_datetime()
attr.get_datetime_tz()
attr.get_duration()

# Safe extraction (returns None if wrong type)
attr.try_get_string()
attr.try_get_integer()
```

### Transaction Options

```python
from typedb.driver import TransactionOptions

# Set transaction timeout (default 5 minutes)
options = TransactionOptions(transaction_timeout_millis=120_000)  # 2 minutes

# Set schema lock timeout (default 30 seconds)
options = TransactionOptions(schema_lock_acquire_timeout_millis=60_000)

with driver.transaction("db", TransactionType.WRITE, options=options) as tx:
    # ...
```

### Error Handling

```python
from typedb.driver import TypeDBDriverException

try:
    with driver.transaction("db", TransactionType.WRITE) as tx:
        tx.query("insert $u isa user, has name 'Alice';").resolve()
        tx.commit()
except TypeDBDriverException as e:
    if "QEX" in str(e).upper():
        print("Query execution error")
    elif "TQL" in str(e).upper():
        print("TypeQL parsing error")
    else:
        print(f"Driver error: {e}")
```

### Batch Operations

```python
# Batch insert with concurrent promises
with driver.transaction("db", TransactionType.WRITE) as tx:
    promises = []
    for item in items:
        query = f"insert $x isa item, has name '{item}';"
        promises.append(tx.query(query))

    # Resolve all
    for p in promises:
        p.resolve()

    tx.commit()

# Chunked batch processing
def insert_batch(driver, items, chunk_size=100):
    for i in range(0, len(items), chunk_size):
        chunk = items[i:i + chunk_size]
        with driver.transaction("db", TransactionType.WRITE) as tx:
            for item in chunk:
                tx.query(f"insert $x isa item, has name '{item}';").resolve()
            tx.commit()
```

---

## Transaction Management

### Transaction Characteristics

| Type | Reads | Data Writes | Schema Writes | Concurrency |
|------|-------|-------------|---------------|-------------|
| READ | Yes | No | No | Fully concurrent |
| WRITE | Yes | Yes | No | May conflict on commit |
| SCHEMA | Yes | Yes | Yes | Exclusive (blocks writes) |

### Snapshot Isolation

- Transactions operate on snapshots taken at open time
- Changes visible within transaction, not to others until commit
- ACID guarantees up to snapshot isolation

### Commit Behavior

```python
# Write transactions MUST commit
with driver.transaction("db", TransactionType.WRITE) as tx:
    tx.query("insert ...").resolve()
    tx.commit()  # Required!

# Read transactions auto-close, no commit needed
with driver.transaction("db", TransactionType.READ) as tx:
    result = tx.query("match ...").resolve()
    # Auto-closes when exiting context

# Explicit rollback
with driver.transaction("db", TransactionType.WRITE) as tx:
    try:
        tx.query("insert ...").resolve()
        if something_wrong:
            tx.rollback()  # Discard changes
            return
        tx.commit()
    except:
        # Transaction auto-rollbacks on exception
        raise
```

### Conflict Handling

```python
import time
import random

def write_with_retry(driver, query, max_retries=3):
    for attempt in range(max_retries):
        try:
            with driver.transaction("db", TransactionType.WRITE) as tx:
                tx.query(query).resolve()
                tx.commit()
                return True
        except TypeDBDriverException as e:
            if "conflict" in str(e).lower() and attempt < max_retries - 1:
                wait_time = 0.1 * (2 ** attempt) + random.uniform(0, 0.1)
                time.sleep(wait_time)
                continue
            raise
    return False
```

---

## Best Practices

### Connection Management

```python
# DO: Use context managers
with TypeDB.driver(address, credentials, options) as driver:
    with driver.transaction("db", TransactionType.READ) as tx:
        # ...

# DO: Reuse single driver instance
class DatabaseClient:
    def __init__(self):
        self.driver = TypeDB.driver(address, credentials, options)

    def close(self):
        self.driver.close()

# DON'T: Create new drivers per query
def bad_query():
    driver = TypeDB.driver(...)  # Expensive!
    # ...
    driver.close()
```

### Query Patterns

```python
# DO: Batch operations
with driver.transaction("db", TransactionType.WRITE) as tx:
    for item in items:
        tx.query(f"insert $x isa item, has name '{item}';")
    tx.commit()

# DON'T: One transaction per insert
for item in items:
    with driver.transaction("db", TransactionType.WRITE) as tx:
        tx.query(f"insert $x isa item, has name '{item}';").resolve()
        tx.commit()  # Too many commits!
```

### Security

```python
# DO: Use environment variables for credentials
import os
credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])

# DO: Enable TLS in production
options = DriverOptions(is_tls_enabled=True)

# DON'T: Hardcode credentials
credentials = Credentials("admin", "password123")  # Bad!
```

---

## Query Optimization

### Predicate Pushdown

```typeql
# FAST: Constraints in single match stage
match
    $u isa user;
    $u has username "john_1";
select $u;

# SLOW: Constraints across stages
match $u isa user;
match $u has username "john_1";  # Large intermediate result!
select $u;
```

### Type Specificity

```typeql
# FAST: Use specific type
match $s isa scout, has fitness $f;
select $s, $f;

# SLOW: Generic type with late filtering
match
    $a isa ant, has fitness $f;  # Scans all ants
    $a isa scout;  # Late type restriction
select $a, $f;
```

### Avoid Cartesian Products

```typeql
# BAD: N x M combinations
match
    $a isa agent;
    $b isa agent;
select $a, $b;

# GOOD: Connected through relation
match
    $a isa agent;
    $b isa agent;
    (parent: $a, child: $b) isa reproduction;
select $a, $b;
```

### Use Limits for Exploration

```typeql
# GOOD: Limit exploratory queries
match $u isa user;
select $u;
limit 10;

# BAD: No limit on large datasets
match $u isa user;
select $u;  # Could return millions
```

### Batch Inserts

```typeql
# GOOD: Single transaction
insert
    $a1 isa agent, has id "a1";
    $a2 isa agent, has id "a2";
    $a3 isa agent, has id "a3";

# BAD: Multiple transactions
insert $a1 isa agent, has id "a1";
-- commit --
insert $a2 isa agent, has id "a2";
-- commit --
```

### Existence Checks

```typeql
# Efficient existence check
match $x isa user, has email "test@example.com";
reduce $exists = count;
-- Check if $exists > 0

# Or with early exit
match $x isa user, has email "test@example.com";
limit 1;
```

---

## Complete Keyword Reference

### Schema Keywords

| Keyword | Purpose | Example |
|---------|---------|---------|
| `define` | Begin schema definition | `define entity user;` |
| `undefine` | Remove schema element | `undefine user;` |
| `redefine` | Modify schema element | `redefine user sub page;` |
| `entity` | Define entity type | `entity person;` |
| `relation` | Define relation type | `relation friendship;` |
| `attribute` | Define attribute type | `attribute name, value string;` |
| `struct` | Define struct type | `struct address;` |
| `sub` | Define subtype | `entity employee sub person;` |
| `relates` | Define relation role | `relates friend;` |
| `plays` | Type plays role | `plays friendship:friend;` |
| `owns` | Type owns attribute | `owns name;` |
| `value` | Attribute value type | `value string;` |
| `as` | Role specialization | `relates author as subject;` |
| `fun` | Define function | `fun name() -> type:` |

### Data Pipeline Keywords

| Keyword | Purpose | Example |
|---------|---------|---------|
| `match` | Find existing data | `match $u isa user;` |
| `insert` | Create data | `insert $u isa user;` |
| `delete` | Remove data | `delete $u;` |
| `update` | Modify data | `update $u has age 31;` |
| `put` | Insert if not exists | `put $u isa user;` |
| `fetch` | JSON output | `fetch { "name": $u.name };` |
| `select` | Project variables | `select $u, $n;` |
| `reduce` | Aggregate | `reduce $count = count;` |
| `sort` | Order results | `sort $a desc;` |
| `limit` | Restrict count | `limit 10;` |
| `offset` | Skip results | `offset 20;` |
| `distinct` | Remove duplicates | `distinct;` |
| `require` | Filter nulls | `require $optional;` |
| `with` | Ad-hoc functions | `with fun f() -> ...` |

### Pattern Keywords

| Keyword | Purpose | Example |
|---------|---------|---------|
| `or` | Disjunction | `{ ... } or { ... };` |
| `not` | Negation | `not { $u has status "deleted"; };` |
| `try` | Optional | `try { $u has email $e; };` |
| `isa` | Type constraint | `$u isa user;` |
| `has` | Attribute ownership | `$u has name "Alice";` |
| `links` | Relation role | `links (friend: $u);` |
| `is` | Variable equality | `$a is $b;` |
| `let` | Assign expression | `let $x = $a + $b;` |
| `in` | Iterate stream | `let $x in function();` |
| `contains` | Substring match | `$s contains "test";` |
| `like` | Regex match | `$s like "^test.*";` |

### Aggregation Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `count` | Count items | `reduce $c = count;` |
| `sum` | Sum values | `reduce $s = sum($val);` |
| `mean` | Average | `reduce $avg = mean($val);` |
| `median` | Median | `reduce $med = median($val);` |
| `min` | Minimum | `reduce $min = min($val);` |
| `max` | Maximum | `reduce $max = max($val);` |
| `std` | Std deviation | `reduce $std = std($val);` |
| `list` | Collect to list | `reduce $items = list($item);` |

### Annotations

| Annotation | Purpose | Example |
|------------|---------|---------|
| `@abstract` | Cannot instantiate | `entity content @abstract;` |
| `@key` | Unique identifier | `owns id @key;` |
| `@unique` | Unique optional | `owns email @unique;` |
| `@subkey` | Composite key | `owns part @subkey("composite");` |
| `@card` | Cardinality | `owns name @card(1..3);` |
| `@values` | Enum values | `@values("a", "b", "c");` |
| `@range` | Value range | `@range(0..100);` |
| `@regex` | String pattern | `@regex("^[a-z]+$");` |
| `@distinct` | Unique in list | `owns tag @distinct;` |
| `@independent` | Survives unowned | `@independent;` |
| `@cascade` | Delete behavior | `relates owner @cascade;` |

---

## Mental Models (Type Theory, Polymorphism, Dependent Types)

These are the ideas that make TypeQL feel inevitable rather than arbitrary. They're the difference between writing valid TypeQL and writing *idiomatic* TypeQL. Sources: the 2024 PACMMOD paper and TypeDB's 2023–2024 lecture series (`MF2vaEo3o58`, `2S0zPXQCy0U`, `IJomvpKbevk`, `LMzZoq6fUqg` on the Vaticle YouTube channel).

### Queries as Types

SQL view: a query is a *plan* — an operational recipe of joins, filters, projections that transforms tables into tables.

TypeQL view: a query is a *type* — a declarative description of the domain of data you want. The pattern **is** the type.

```typeql
# Reads as: "the type of (u, n) pairs where u is a user and u owns name n"
match $u isa user, has name $n;
```

The planner is free to reorder, parallelize, index, push predicates — it just has to preserve the type. This is why TypeQL schemas stay small as systems grow: you don't need a new query for every shape of question, because polymorphism is baked into the type system.

### Relations as Dependent Types

A relation in TypeDB is a **dependent type**: its instances depend on instances of its role players. Formally, `friendship` is parameterized by two `person`s; you cannot instantiate it without them.

```typeql
define
relation friendship,
  relates friend @card(2);
```

Consequences:
- **Integrity** — you can't create a relation pointing at nothing (contrast: SQL allows NULL foreign keys, graph DBs allow dangling edges).
- **Cascade** — deleting a role player can trigger deletion of the relation (`@cascade`), because the relation *depends* on the player.
- **n-ary** — relations aren't stuck at binary (unlike property graphs' edges). `relation meeting, relates organizer, relates attendee, relates venue;`

### Interface Polymorphism (Role Playing)

Roles are **interfaces**. Multiple unrelated types can implement the same role, and relations referencing that role automatically work for all implementers.

```typeql
define
entity person, plays adoption:parent, plays adoption:child;
entity company, plays adoption:parent;   # companies can adopt (projects, subsidiaries)
entity organization, plays adoption:parent;
relation adoption,
  relates parent,
  relates child;
```

A single query works for every combination — person→person, company→person, organization→person — with no rewriting. When a new type joins (`entity foundation, plays adoption:parent;`), existing queries automatically include it.

This is why Haskell calls them *typeclasses*, Rust calls them *traits*, and TypeDB calls them *roles*. Same idea, applied to a database.

### Abstract Types and Subtyping

Entities, relations, AND attributes can be abstract and subtyped — this is richer than any of the three classical database paradigms.

```typeql
define
entity resource @abstract, owns id, plays ownership:resource;
entity file sub resource, owns path;
entity directory sub resource, owns path;

attribute id @abstract, value string;
attribute email sub id;
attribute path sub id;
```

A query against `$r isa resource` returns files AND directories. A query against `$x has id` returns anything with *any* subtype of `id` — email, path, anything added later.

---

## Canonical Polymorphic Example: Filesystem + Ownership

This schema (from the TypeDB Fundamentals docs) is the canonical teaching example for polymorphism. It demonstrates abstract entities, role aliasing in subrelations, abstract attribute hierarchies, and polymorphic fetch.

```typeql
define

# Actors
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

# Abstract base + concrete resources
entity resource @abstract,
    owns id,
    owns created-timestamp,
    owns modified-timestamp,
    plays resource-ownership:resource;

entity file sub resource,
    owns path;

entity directory sub resource,
    owns path;

# Abstract relation + role aliasing in subrelations
relation ownership @abstract,
    relates owned,
    relates owner;

relation group-ownership sub ownership,
    relates group as owned,            # subrelation renames the inherited role
    relates group-owner as owner;

relation resource-ownership sub ownership,
    relates resource as owned,
    relates resource-owner as owner;

# Abstract attribute hierarchy
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

### Polymorphic fetch over this schema

```typeql
# Returns every resource of every subtype (files AND directories)
# with all their timestamps (created AND modified, since both sub event-timestamp).
match
  $resource isa resource;
fetch {
  "resource": {
    "id": $resource.id,
    "event-timestamp": [ $resource.event-timestamp ],
  }
};
```

The `[...]` brackets around `$resource.event-timestamp` tell `fetch` this is a multi-valued projection. Because the resource owns `created-timestamp` and `modified-timestamp` (both subtypes of `event-timestamp`), the polymorphic fetch returns both.

---

## TypeDB 3.x Feature Deep Dive

These are 3.0+ features that change how you model data. Previously unavailable in 2.x.

### Cascading Delete

Delete semantics are explicit via `@cascade` on relation roles. When the annotated role player is deleted, the relation itself is also deleted.

```typeql
define
relation ownership,
    relates owner @cascade,   # if owner deleted → delete relation
    relates owned;

# A single delete of $folder cascades to all ownership relations
# where $folder plays owner.
match $folder isa directory, has path "/tmp/old";
delete $folder;
```

Use case: cleaning up role-based access control (RBAC) — delete a user, their ownership edges go too.

### Struct Value Types

Compose multi-field values without reifying them as entities.

```typeql
define

struct address {
    street:      string,
    city:        string,
    postal-code: string,
    country:     string,
}

attribute home-address, value address;

entity person, owns home-address @card(0..1);

# Insert
insert $p isa person,
    has home-address (
        street: "123 Main St",
        city: "Portland",
        postal-code: "97214",
        country: "USA"
    );

# Match by a struct field (project from the struct)
match
  $p isa person, has home-address $addr;
  $addr.city == "Portland";
select $p;
```

Use structs for values that are always copied together and have no identity of their own — otherwise, prefer an entity + relation.

### List Attributes

3.x native list-valued attributes are distinct from multi-cardinality ownership.

```typeql
define
attribute tags, value string[];        # list value type
entity article, owns tags;

insert $a isa article,
    has tags ["typedb", "polymorphism", "type-theory"];

match $a isa article, has tags $ts;
select $ts;                            # returns the list as one value
```

Rule of thumb: use a **list attribute** when order matters or the collection is consumed atomically. Use `@card(0..)` multi-ownership when each element is independently queryable (e.g., multiple emails where you want to match on any one).

### Relation Indexing

Mark high-cardinality lookup roles with `@index` for planner hints.

```typeql
define
relation friendship,
    relates friend @card(2) @index;

# Planner prioritizes indexed-role lookup for:
match $f isa friendship, links (friend: $alice, friend: $other);
  $alice has name "Alice";
select $other;
```

### Functions (replace 2.x `rule`)

Rules are gone. Functions are the only way to express derivation logic in 3.x.

```typeql
define
fun reachable-cities($from: city) -> { $to: city } :
  match
    ($from, $to) isa flight;
  return { $to };

# Transitively: fun with recursive call (bounded by type system)
fun reachable-transitively($from: city) -> { $to: city } :
  match
    { ($from, $direct) isa flight; }
    or
    { reachable-cities($from) contains $mid;
      reachable-transitively($mid) contains $direct; };
  return { $direct };

# Use in a query
match
  $nyc isa city, has name "New York";
  let $dests = reachable-transitively($nyc);
select $dests;
```

Functions can return streams (`{ ... }`), single values (`scalar`), or structs. They compose in pipelines and let the planner see through the abstraction.

### MVCC + Temporal (under the hood)

TypeDB 3.x uses **MVCC** internally. Every transaction is tagged with a version; old versions are retained for a configurable TTL. The API to read-at-version is **not yet exposed** (per "Inside TypeDB: The Next Chapter", Dec 2025 — "probably not more than a day or two of work to expose"). Track:

```
# When exposed, expected surface:
with driver.transaction(db, TransactionType.READ, at_version=42) as tx:
    ...
```

Design implication: you can already treat your data as time-travelable for audit/testing purposes; the exposure is a driver-level unlock, not a storage migration.

---

## Production Deployment & Scaling

### Architecture (3.x)

- **Core**: Rewritten in Rust (2024–2025). Old Java codebase retired; Rust rewrite is GA as of TypeDB 3.0.
- **Storage**: RocksDB as the key-value layer; TypeDB's type-level indexing built on top.
- **Cluster**: Highly-available cluster mode (Raft-replicated) — single writer, multiple readers. Rust HA cluster was in final preview as of Dec 2025 (`LS6C4Gl9ldU`).

### Scale markers (from Dec 2025 all-hands)

| Metric | Status |
|--------|--------|
| Single-node data size | Tested beyond 1 TB |
| Benchmark comparison | Competitive with and surpassing Neo4j on first Rust-optimization pass |
| Read scaling | Horizontal via Raft cluster replicas |
| Write scaling | Single master; partitioned writes on roadmap |
| Cloud free tier | Always available, no credit card |

### Operational checklist

- Set **transaction timeout** explicitly if you query long ranges — default is 5 minutes, which bites large migrations.
- Set **schema lock timeout** only in schema transactions — default 30 seconds is usually fine.
- Prefer **TypeDB Cloud** or HA cluster for anything user-facing — single-node is for dev, demos, and embedded use.
- **Snapshot isolation** is the model. Reads never block writes and vice versa; conflicts surface at commit time → catch `ConflictException` and retry (exponential backoff — see "Error Handling" section).

---

## Development Tools & Ecosystem

### TypeDB Studio (web-based)

Web IDE for TypeDB, also downloadable as a local package. Connects to any local TypeDB server, TypeDB Cloud, or any HTTP-accessible endpoint. Schema visualization, query runner, result graph view.

- Hosted: https://studio.typedb.com
- Local download: https://typedb.com/downloads

Migration note: older docs reference the **Kotlin desktop** Studio — that's retired. Current Studio is browser-native.

### Vibe Querying (alpha — agentic TypeQL)

LLM-powered natural-language → TypeQL, currently running on GPT-5. Available in TypeDB Studio and the docs chatbot.

- Good for: exploration, scaffolding, "show me something like X".
- Not good for: production queries without review. It still makes mistakes on domain-specific type names.
- Recommended pattern: generate → paste into Studio → adjust → commit the TypeQL, not the prompt.

### TypeDB Cloud

- **Free tier**: always available, 1 GB storage, no credit card.
- **Security Center** + **MFA** + configurable **backups** since 2025.
- Python connection (same code works for self-hosted, Cloud, or HA cluster):

```python
from typedb.driver import TypeDB, Credentials, DriverOptions, TransactionType
import os

credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])
options = DriverOptions(is_tls_enabled=True)
driver = TypeDB.driver(
    "https://my-cluster.typedb.cloud:1729",   # Cloud
    credentials,
    options,
)
```

**Port 1729** is canonical — not 80, not 443. The HTTP API prefix is `/v1/`.

### Language Server Protocol (on roadmap)

TypeDB team announced (Dec 2025) an incoming **`analyze`** endpoint — returns type annotations for a query without executing it — plus LSP support for VS Code, JetBrains, Vim. Expected through 2025. Until then, the console and Studio's inline diagnostics are the fastest feedback loop.

### Ecosystem libraries (community-maintained)

- **Pydantic** integration for model (de)serialization.
- **CSV / JSON loaders** for bulk import.
- **IDE syntax plugins** for VS Code, IntelliJ (before the LSP ships).

---

## SQL → TypeQL: Concrete Contrasts

### Simple filter + projection

```sql
-- SQL
SELECT p.product_name, p.unit_price
FROM   products p
JOIN   categories c ON p.category_id = c.category_id
WHERE  c.category_name = 'Beverages';
```

```typeql
# TypeQL — the relation (category-assignment) IS the join
match
  $cat isa category, has name "Beverages";
  $prod isa product, has product-name $pname, has unit-price $price;
  (assigned: $prod, category: $cat) isa category-assignment;
select $pname, $price;
```

Differences:
- **Relation is first-class** — no foreign-key column, no `JOIN ON`. The relation `category-assignment` models the membership explicitly.
- **Polymorphic by default** — if later you add `entity beverage sub product;`, this query returns beverages automatically.
- **No nullable join columns** — a relation either exists between role players or it doesn't. No NULL tri-state.

### Reachability (graph-style)

```cypher
// Neo4j
MATCH path = (c1:City {name: "New York"})-[:FLIGHT*1..3]->(c2:City {name: "London"})
RETURN path
```

```typeql
# TypeQL — reachability is a type function, not a path operator
define
fun flight-reachable($from: city, $hops: integer) -> { $to: city } :
  match
    { $hops == 1; ($from, $to) isa flight; }
    or
    { $hops > 1;
      ($from, $mid) isa flight;
      let $rest = flight-reachable($mid, $hops - 1);
      $to == $rest; };
  return { $to };

match
  $nyc isa city, has name "New York";
  let $cities = flight-reachable($nyc, 3);
  $cities has name "London";
select $cities;
```

In Neo4j, variable-length path is a query-language primitive. In TypeQL, it's a **user-definable function** — which means any reachability logic (weighted, filtered by attribute, cross-type) is equally expressible without new syntax.

---

## Works With /sui — The Same Ontology, Two Deterministic Fires

`src/schema/sui.tql:1` already put it best: **"The same ontology. Two deterministic fires."** TypeDB is the learning, classification fire (hypotheses, frontiers, tags — cheap to write, rich to query). Move is the permanent, economic fire (path revenue, escrow, treasury — expensive to write, cheap to trust). The runtime is the fast nervous system between them. Both skills speak the same vocabulary by design — `strength`, `resistance`, `revenue`, `path`, `unit` — so the bridge is a **1:1 rename, not a translation**.

### Canonical crosswalk

`src/schema/sui.tql` (336 lines) is the Rosetta Stone — every Move struct has a matching TQL entity, every Move function has a matching TQL `fun`. Read it when names or shapes drift. The runtime schema is `src/schema/world.tql`; `sui.tql` is the parallel declaration that proves the two layers agree. The canonical ontology (6 dimensions, stable) is `src/schema/one.tql`.

### Attribute mapping (Move struct ⇌ TypeDB attribute)

| Move field (`one.move`)         | TQL attribute (`world.tql`)    | Move type   | TQL type | Direction                     |
|---------------------------------|--------------------------------|-------------|----------|-------------------------------|
| `Unit.id` (address)             | `unit.sui-unit-id`             | address     | string   | Sui → TQL on `mirrorActor()`  |
| *derived by* `addressFor(uid)`  | `unit.wallet`                  | address     | string   | Runtime → TQL on agent sync   |
| `Unit.name`                     | `unit.name`                    | String      | string   | bidirectional                 |
| `Unit.balance`                  | `unit.balance`                 | u64         | double   | Sui → TQL via `absorb()`      |
| **`Path.strength`**             | **`path.strength`**            | u64         | double   | bidirectional — load-bearing  |
| **`Path.resistance`**           | **`path.resistance`**          | u64         | double   | bidirectional — load-bearing  |
| `Path.revenue`                  | `path.revenue`                 | u64         | double   | Sui → TQL via `absorb()`      |
| `Path.id` (address)             | `path.sui-path-id`             | address     | string   | Sui → TQL on mirror           |
| `Highway.id` (address)          | `path.sui-highway-id`          | address     | string   | Sui → TQL on `mirrorHarden()` |
| `Signal.payload` (vector<u8>)   | `signal.data`                  | bytes       | string   | one-way, usually TQL-only     |

**Name drift to know about:** Move still has `struct Colony` (one.move:71). TypeDB moved to `entity group` per `docs/dictionary.md`, but the Move contract hasn't been migrated yet because that requires a package upgrade. When reading bridge code, treat Move `Colony` as TQL `group`.

**Load-bearing invariant:** `strength` and `resistance` share the same name in both layers. If you rename one, rename both — `bridge.ts` is a pass-through, there's no translation logic. Type-width (`u64` ↔ `double`) is handled by JSON serialization at the bridge; don't write TQL queries that assume sub-integer precision on these columns.

### Bridge contract (`src/engine/bridge.ts`, 479 lines)

| Function                          | Fires when                  | Maps                                                                   |
|-----------------------------------|-----------------------------|------------------------------------------------------------------------|
| `mirrorMark(from, to, amount?)`   | every `persist.mark()`       | Runtime strength++ → Sui `mark_path()`                                   |
| `mirrorWarn(from, to, amount?)`   | every `persist.warn()`       | Runtime resistance++ → Sui `warn_path()`                                 |
| `mirrorPay(from, to, amount)`     | L4 payment signal            | Runtime payment → Sui `pay()` → `Path.revenue +=`                        |
| `mirrorHarden(from, to)`          | L6 highway promotion         | TQL harden → Sui `harden_path()` → Highway object created                |
| `mirrorActor(uid, name)`          | `/api/agents/register`       | `addressFor(uid)` + `createUnit()` → writes `wallet` + `sui-unit-id` back |
| `resolve(uid)`                    | before any outbound Sui call | TQL lookup → `{ wallet, unitId }` — no on-chain twin? dissolve           |
| `resolvePath(from, to)`           | on-chain path ops            | TQL `sui-path-id` lookup — memoized via edge cache                       |
| `absorb(cursor?)`                 | `/api/absorb` cron (1 min)   | Sui events → TQL writes: UnitCreated, Marked, Warned, Paid, Hardened     |
| `settleEscrow(...)` *(Phase 3)*   | `releaseEscrow()` succeeds   | on-chain settlement → TQL `path.revenue` + `path.strength` mark          |

**Guarantee:** `mirror*` functions are fire-and-forget. They never block the TypeDB write or the runtime signal loop. If Sui is down, TypeDB still learns; pheromone re-converges when `absorb()` catches up. That's why it's safe to use `writeSilent()` / `writeTracked()` semantics at the TypeDB layer — the bridge can always replay.

### TQL queries that read on-chain state

```typeql
# Find units with an on-chain twin
match $u isa unit, has wallet $w, has sui-unit-id $s;
select $u, $w, $s;

# Paths that accumulated real revenue on-chain
match $p isa path, has revenue $r, has sui-path-id $id;
$r > 0.0;
select $p, $r, $id;
sort $r desc;

# Hardened highways (frozen on-chain)
match $p isa path, has sui-highway-id $hw;
select $p, $hw;
```

### When to load /sui alongside this skill

- Adding a field to a Move struct that needs off-chain query — the TQL attribute must match
- Touching `src/move/one/sources/one.move` path/signal logic — `src/schema/one.tql` and `docs/dictionary.md` are the source of truth for names
- Debugging why `absorb()` isn't writing to TypeDB — check `world.tql` accepts the attribute type
- Writing a TQL `fun` that needs an on-chain twin — see `src/schema/sui.tql` for parallel function signatures
- Querying `unit.wallet` values — they're derived by `addressFor(uid)` in `src/lib/sui.ts`, not always stored

---

## Production Patterns: Classifier Functions, Thing Collapse, Symmetric Routing

These three patterns come from **`src/schema/world.tql`** — the ONE substrate's live runtime schema — and are worth learning because they turn abstract ideas ("Queries as Types", polymorphism, role interfaces) into code that's actually short, composable, and fast to query. Cross-reference: `packages/typedb-inference-patterns/` has the lesson-by-lesson version; this section is the distillation.

### Pattern 1 — The Deterministic Sandwich as a Function Chain

A **deterministic sandwich** wraps a probabilistic operation (usually an LLM call) in a pre-check and a post-check, so the indeterminism is bounded on both sides. In TypeQL 3.x, every slice of the sandwich is a **typed function** returning either `first true` (boolean pass) or a stream.

```typeql
# src/schema/world.tql:536–567 — the sandwich, verbatim shape

# PRE: Can this receiver handle this skill? (capability check)
fun can_receive($u: unit, $sk: skill) -> boolean:
    match (provider: $u, offered: $sk) isa capability;
    return first true;

# PRE: Is the path to this receiver safe? (not toxic)
fun is_safe($from: unit, $to: unit) -> boolean:
    match (source: $from, target: $to) isa path,
          has strength $s, has resistance $a;
    return first if ($a > $s and $a >= 10.0) then false else true;

# PRE: Is the signal within budget?
fun within_budget($u: unit, $sk: skill, $amount: double) -> boolean:
    match (provider: $u, offered: $sk) isa capability, has price $p;
    return first if ($amount >= $p) then true else false;

# POST: Does the referenced unit still exist?
fun unit_exists($uid: string) -> boolean:
    match $u isa unit, has uid $uid;
    return first true;

# POST: Is a unit performing well enough to trust its output?
fun is_trustworthy($u: unit) -> boolean:
    match $u has success-rate $sr, has sample-count $sc;
    return first if ($sr >= 0.50 or $sc < 10) then true else false;

# COMPOSED: All the PRE checks as a single type assertion
fun preflight($from: unit, $to: unit, $sk: skill) -> boolean:
    match (provider: $to, offered: $sk) isa capability;
          (source: $from, target: $to) isa path,
          has strength $s, has resistance $a;
    return first if ($a > $s and $a >= 10.0) then false else true;
```

**Why this is elegant:**

1. **Each check is a type, not a subroutine.** `is_safe($from, $to)` declares the type "this path is safe". The planner decides whether to evaluate it by scanning strength/resistance, by checking an index, or by proving it vacuously. You never write "first look up strength, then compare".

2. **`return first if ... then ... else ...`** is the TypeDB 3.x idiom for boolean classifiers. The body is a single conditional expression. No side effects, no cascading rules, no rule-firing order to debug.

3. **Composition is just another function.** `preflight()` inlines the match patterns of its children rather than calling them — this lets the planner see the whole constraint set and pick the cheapest plan. (Calling three separate functions would force three sequential lookups.)

4. **Negative space stays declarative.** `is_trustworthy` returns `true` when `sr >= 0.50 OR sc < 10` — new agents are trusted by default because we have no evidence against them. That's a domain rule encoded as a type, not as a runtime `if`.

### Pattern 2 — The `thing` Collapse (Polymorphism as Entity-Level Union)

Instead of modeling plan, cycle, task, and skill as four separate entities, the canonical ontology (`src/schema/one.tql:47–84`) **collapses them into one `thing` entity** discriminated by a `thing-type` attribute. Attributes specific to each kind (`task-status`, `cycles-planned`, `goal`) live on the shared entity, unused for non-matching kinds.

```typeql
entity thing,
    owns tid @key,
    owns name,
    owns thing-type,                 # "skill" | "task" | "plan" | "service"
    owns price,
    owns tag @card(0..),
    # Task-only (meaningful when thing-type='task')
    owns task-status,                 # open/blocked/picked/done/verified/failed/dissolved
    owns task-effort,
    owns task-value,
    owns exit-condition,
    # Plan-only (meaningful when thing-type='plan')
    owns goal,
    owns cycles-planned,
    owns escape-condition,
    # Rubric (post-verify, any thing-type)
    owns rubric-fit,
    owns rubric-form,
    owns rubric-truth,
    owns rubric-taste,
    plays capability:offered,
    plays blocks:blocker,
    plays blocks:blocked,
    plays containment:container,
    plays containment:contained,
    plays production:producer,
    plays production:produced;
```

**When to use it:**

- The concepts share >50% of their attributes and all their relations.
- You want polymorphic queries that span all kinds (`match $t isa thing, has tag "P0";` returns tasks AND plans AND skills tagged P0).
- The kinds aren't large enough to warrant physical partitioning.

**When to avoid it:**

- A concept has strict invariants enforced by NOT NULL (TypeDB doesn't enforce attribute presence by `thing-type`; you'd need a function to validate).
- You need compile-time guarantees that "only tasks have `task-status`". The collapse is dynamic typing inside a static system.

**Filter pattern (the "discriminated fetch"):**

```typeql
# Only things that are tasks AND open
fun open_tasks() -> { thing } :
    match
        $t isa thing, has thing-type "task", has task-status "open";
    return { $t };

# Polymorphic priority: works across kinds because all own priority-score
fun top_by_priority($kind: string) -> { thing } :
    match
        $t isa thing, has thing-type $kind, has priority-score $p;
    sort $p desc; limit 10;
    return { $t };
```

Compare this with the maximalist `src/schema/world.tql` (787 lines, separate `task` entity with its own `task-id`, `task-status`, `priority-formula`, etc.). The **skinny ontology** (`one.tql`) uses the collapse for flexibility; the **runtime schema** (`world.tql`) uses separate entities for performance and strict typing. Both are valid — the choice depends on how much schema change you expect.

### Pattern 3 — Symmetric Routing via Shared-Variable Unification

When you have a relation "X matches Y on tag", you usually need both directions — "what Y's match this X" AND "what X's match this Y". In SQL this is two separate queries. In TypeQL, both queries share the same match pattern; only the return changes.

```typeql
# src/schema/world.tql:752–775 — verbatim symmetric pair

# "What tasks can this unit work on?" (unit → tasks)
fun tasks_for_unit($u: unit) -> { task } :
    match
        $u has tag $tag;
        $t isa task, has tag $tag,
            has done false, has task-status "open";
    return { $t };

# "Which units can do this task?" (task → units)
fun units_for_task($t: task) -> { unit } :
    match
        $t has tag $tag;
        $u isa unit, has tag $tag, has status "active";
    return { $u };

# "Best unit for this task": tag overlap × pheromone strength
fun best_unit_for_task($t: task) -> unit :
    match
        $t has tag $tag;
        $u isa unit, has tag $tag, has status "active";
        (source: $any, target: $u) isa path, has strength $s;
    sort $s desc; limit 1;
    return $u;
```

**Why this is "Queries as Types" at its cleanest:**

- The `$tag` variable is shared between `$u has tag $tag` and `$t has tag $tag`. TypeQL **unifies** these — there must exist at least one tag value that both sides agree on. No `JOIN ON` clause, no foreign key; the type constraint IS the join.

- The pattern is symmetric because the *type* of "unit-task matches on tag" doesn't care about direction. Only the *projection* (`return { $t }` vs `return { $u }`) picks a side.

- `best_unit_for_task` composes the matching pattern with a *third* constraint (pheromone strength on an incoming path). Notice `(source: $any, target: $u)` — `$any` is bound but unconstrained; we don't care WHO marked the path, only that SOMEONE marked it. That's a free variable in the type.

### Pattern 4 — Classification by Cascade (the `path_status` function)

One more worth lifting out. The substrate labels every path with one of five statuses using a single function whose body is a nested conditional:

```typeql
# src/schema/world.tql:523–530
fun path_status($e: path) -> string:
    match $e has strength $s, has resistance $a, has traversals $t;
    return first
        if ($a > $s and $a >= 10.0)             then "toxic"
        else if ($s >= 50.0)                    then "highway"
        else if ($s >= 10.0 and $s < 50.0 and $t < 10) then "fresh"
        else if ($s > 0.0 and $s < 5.0)         then "fading"
        else "active";
```

The rules compose top-down — `toxic` wins over `highway` if both apply, `highway` wins over `fresh`. In 2.x this would be five chained `rule`s with priority annotations. In 3.x it's one function, and the cascade order is visible in the source. Debugging path status is now a single function call.

**Adjacent pattern — reading the label:**

```typeql
match
    $p isa path, has strength $s;
    let $status = path_status($p);
    $status == "highway";
select $p, $s;
```

The result reads like English: "paths whose status is highway". The function is a verb (`path_status(p)`) that returns a type-tagged string. This is the L2 "quality rule" from `packages/typedb-inference-patterns/LOOPS.md` — classification without explicit rule firing.

---

## Project-Specific Patterns

### Signal-Edge Operations (Trading)

```typeql
# Define signal-edge
define
attribute edge-id, value string;
attribute from-state-id, value string;
attribute to-signal-direction, value string;
attribute win-count, value integer;
attribute loss-count, value integer;
attribute total-pnl, value double;
attribute edge-trail-level, value double;

entity signal-edge,
    owns edge-id @key,
    owns from-state-id,
    owns to-signal-direction,
    owns win-count,
    owns loss-count,
    owns total-pnl,
    owns edge-trail-level;

# Query high-performing edges
match
    $e isa signal-edge,
        has edge-id $id,
        has edge-trail-level $level,
        has total-pnl $pnl;
    $level >= 20.0;
    $pnl > 0;
select $id, $level, $pnl;
sort $pnl desc;
limit 20;

# Update edge statistics
match
    $e isa signal-edge, has edge-id "edge-001";
    $e has win-count $old_wins;
delete $old_wins;
insert $e has win-count 15;
```

### Pheromone Trail Patterns

```typeql
# Deposit pheromone
match $e isa signal-edge, has edge-id "edge-001";
update $e has edge-trail-level 25.5;

# Find superhighways (high-pheromone trails)
match
    $e isa signal-edge,
        has edge-id $id,
        has edge-trail-level $level;
    $level >= 20.0;
select $id, $level;
sort $level desc;
limit 10;

# Decay all pheromones by 10%
match
    $e isa signal-edge, has edge-trail-level $old;
    let $new = $old * 0.9;
delete $old;
insert $e has edge-trail-level $new;
```

### Live Prediction Tracking

```typeql
define
attribute prediction-id, value string;
attribute pattern-name, value string;
attribute predicted-direction, value string;
attribute verified-1m, value boolean;
attribute verified-5m, value boolean;
attribute verified-1h, value boolean;

entity live-prediction,
    owns prediction-id @key,
    owns pattern-name,
    owns predicted-direction,
    owns verified-1m,
    owns verified-5m,
    owns verified-1h;

# Insert prediction
insert $p isa live-prediction,
    has prediction-id "pred-001",
    has pattern-name "volume_breakout",
    has predicted-direction "long";

# Update verification
match $p isa live-prediction, has prediction-id "pred-001";
update $p has verified-1m true;

# Query pattern accuracy
match
    $p isa live-prediction,
        has pattern-name $name,
        has verified-1h $correct;
    $correct == true;
reduce $wins = count groupby $name;
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  TypeDB 3.0 Quick Reference                                 │
├─────────────────────────────────────────────────────────────┤
│  CONNECT                                                    │
│  driver = TypeDB.driver(url, Credentials(u, p), Options)    │
│                                                             │
│  TRANSACTIONS (no sessions!)                                │
│  with driver.transaction(db, TransactionType.READ) as tx:   │
│      result = tx.query("...").resolve()                     │
│      tx.commit()  # only for WRITE/SCHEMA                   │
│                                                             │
│  TRANSACTION TYPES                                          │
│  READ   - read only, concurrent                             │
│  WRITE  - data modifications                                │
│  SCHEMA - schema changes                                    │
│                                                             │
│  SCHEMA: define / undefine / redefine                       │
│  DATA:   match / insert / delete / update / put             │
│  OUTPUT: select / fetch / reduce                            │
│  STREAM: sort / limit / offset / distinct                   │
│                                                             │
│  VALUE TYPES                                                │
│  integer (not long!), double, decimal, boolean              │
│  string, date, datetime, datetime-tz, duration              │
│                                                             │
│  DELETE SYNTAX (3.0)                                        │
│  delete $attr;           # delete attribute                 │
│  delete has $attr of $e; # delete ownership                 │
│  delete $e;              # delete entity/relation           │
│                                                             │
│  ANNOTATIONS                                                │
│  @key, @unique, @card(n..m), @abstract                      │
│  @values(), @range(), @regex(), @independent                │
└─────────────────────────────────────────────────────────────┘
```

---

## References

### External

- [TypeDB Documentation](https://typedb.com/docs)
- [TypeQL Reference](https://typedb.com/docs/typeql-reference/)
- [Python Driver Reference](https://typedb.com/docs/reference/typedb-grpc-drivers/python/)
- [TypeDB 2.x to 3.x Migration](https://typedb.com/docs/reference/typedb-2-vs-3/)
- [Query Optimization Guide](https://typedb.com/docs/maintenance-operation/troubleshooting/optimizing-queries/)
- [TypeQL Paper · Dorn & Pribadi · PACMMOD 2024](https://dl.acm.org/doi/10.1145/3651611) — Best Newcomer Award, SIGMOD/PODS 2024
- [Vaticle YouTube Channel](https://www.youtube.com/c/vaticle) — lecture series on type theory and polymorphic modeling

### In-repo

- `src/schema/one.tql` — canonical 6-dimension ontology (stable, 272 lines). See *Pattern 2 — The `thing` Collapse* for the polymorphic-union move it demonstrates.
- `src/schema/world.tql` — live substrate schema (787 lines) with classifier functions, deterministic-sandwich pre/post-checks, symmetric-routing pair. Source for the *Production Patterns* section above.
- `src/schema/sui.tql` — on-chain mirror of the same ontology. Proves the model bridges to a value-bearing substrate (Move). See the *Works With /sui* section above.
- `packages/typedb-inference-patterns/` — lesson-by-lesson version of the 6 patterns that `world.tql` distills. The `standalone/*.tql` files are PRE-3.x (banner-marked); the `runtime/colony.ts` is 3.x-compliant; the README is the rule→fun translation guide.
- `.claude/skills/typedb/reference/research-notes-2026-04.md` — source notes behind this skill's 2026-04 refinement: PACMMOD paper, 3.0 roadmap, Vaticle lectures, "Inside TypeDB: The Next Chapter".
- `.claude/skills/typedb/reference/migration-2x-3x.md` — mechanical 2.x→3.x translations (sessions, Concept API, rule→fun, long→integer, delete syntax).
- `.claude/skills/typedb/reference/python-driver.md` — deeper Python-driver reference than the summary in this file.
- `.claude/skills/typedb/examples/` — working TQL files: schema-patterns, query-patterns, python-patterns.
