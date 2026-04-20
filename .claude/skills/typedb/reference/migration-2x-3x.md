# TypeDB 2.x to 3.x Migration Reference

> Complete guide for migrating from TypeDB 2.x to 3.x

---

## Overview

TypeDB 3.x introduces significant breaking changes. This document provides a comprehensive migration reference.

---

## Core API Changes

### Sessions Eliminated

The biggest change: sessions no longer exist. You now open transactions directly on the driver.

```python
# TypeDB 2.x (OLD - DO NOT USE)
from typedb.client import TypeDB, SessionType, TransactionType

with TypeDB.core_client("localhost:1729") as client:
    with client.session("database", SessionType.DATA) as session:
        with session.transaction(TransactionType.READ) as tx:
            result = tx.query().match("match $p isa person;").get()

# TypeDB 3.x (CORRECT)
from typedb.driver import TypeDB, Credentials, DriverOptions, TransactionType

credentials = Credentials("admin", password)
options = DriverOptions(is_tls_enabled=True)
driver = TypeDB.driver("https://server:80", credentials, options)

with driver.transaction("database", TransactionType.READ) as tx:
    result = tx.query("match $p isa person; select $p;").resolve()
```

### Transaction Types

| 2.x | 3.x | Notes |
|-----|-----|-------|
| `TransactionType.READ` | `TransactionType.READ` | Same |
| `TransactionType.WRITE` | `TransactionType.WRITE` | Same |
| N/A | `TransactionType.SCHEMA` | New type for schema changes |
| `SessionType.DATA` | N/A | Removed (no sessions) |
| `SessionType.SCHEMA` | N/A | Removed (use SCHEMA transaction) |

### Query Execution

```python
# 2.x: Fluent API
result = tx.query().match("match $p isa person;").get()
tx.query().insert("insert $p isa person;")
tx.query().define("define entity person;")

# 3.x: Single query method
result = tx.query("match $p isa person; select $p;").resolve()
tx.query("insert $p isa person;").resolve()
tx.query("define entity person;").resolve()
```

---

## TypeQL Syntax Changes

### Type Declaration

```typeql
# 2.x: Implicit kind via 'sub'
person sub entity;
friendship sub relation;
name sub attribute, value string;

# 3.x: Explicit kind declaration
entity person;
relation friendship;
attribute name, value string;

# 3.x: Subtypes still use 'sub'
entity employee sub person;
relation close-friendship sub friendship;
attribute full-name sub name;
```

### Value Types

| 2.x | 3.x |
|-----|-----|
| `long` | `integer` |
| `double` | `double` (unchanged) |
| `string` | `string` (unchanged) |
| `boolean` | `boolean` (unchanged) |
| `datetime` | `datetime` (unchanged) |

### Query Syntax

```typeql
# GET replaced by SELECT
# 2.x
match $p isa person; get $p;

# 3.x
match $p isa person; select $p;

# Variables: ? prefix removed
# 2.x
match $p isa person, has age ?a; get ?a;

# 3.x (all variables use $)
match $p isa person, has age $a; select $a;
```

### Delete Syntax (CRITICAL)

```typeql
# 2.x: Delete ownership relation
match $p isa person, has name $n;
delete $p has name $n;

# 3.x: Delete the attribute itself
match $p isa person, has name $n;
delete $n;

# 3.x: Delete ownership (keep attribute)
match $p isa person, has name $n;
delete has $n of $p;

# 3.x: Delete role player from relation
match $r isa employment, links (employee: $e);
delete links (employee: $e) of $r;
```

### Abstract Types

```typeql
# 2.x
define
person sub entity, abstract;

# 3.x
define
entity person @abstract;
```

### Annotations Syntax

```typeql
# 2.x: Mixed syntax
person sub entity,
    owns name @key,
    owns email @unique;

# 3.x: Consistent annotation syntax
entity person,
    owns name @key,
    owns email @unique;
```

---

## Cardinality Changes

### Default Cardinalities

| Statement | 2.x Default | 3.x Default |
|-----------|-------------|-------------|
| `plays` | unlimited | `@card(0..)` |
| `owns` | unlimited | `@card(0..1)` |
| `relates` | unlimited | `@card(0..1)` |

### CRITICAL: Cardinality Must Be Explicit

In 3.x, if you want multiple values for an ownership, you MUST specify cardinality:

```typeql
# 2.x: Implicitly allows multiple emails
person sub entity,
    owns email;

# 3.x: Allows only 0-1 emails by default!
entity person,
    owns email;  # Same as @card(0..1)

# 3.x: To allow multiple emails, be explicit
entity person,
    owns email @card(0..);
```

---

## Rules Replaced by Functions

Rules are replaced by functions. Functions require explicit invocation.

```typeql
# 2.x: Rules (automatic inference)
define
rule transitive-friend:
    when {
        (friend: $a, friend: $b) isa friendship;
        (friend: $b, friend: $c) isa friendship;
    } then {
        (friend: $a, friend: $c) isa friendship;
    };

# 3.x: Functions (explicit invocation)
define
fun transitive_friends($person: person) -> { person }:
    match
        { ($person, $friend) isa friendship; }
        or {
            let $intermediate in transitive_friends($person);
            ($intermediate, $friend) isa friendship;
        };
    return { $friend };

# Usage in 3.x
match
    $p isa person, has name "Alice";
    let $friend in transitive_friends($p);
select $friend;
```

### Key Differences

| Aspect | Rules (2.x) | Functions (3.x) |
|--------|-------------|-----------------|
| Execution | Automatic (inference) | Explicit (must call) |
| Storage | Materialized | Computed on demand |
| Recursion | Limited | Full support with tabling |
| Arguments | None | Type-checked parameters |
| Returns | Inserts data | Returns stream/value |

---

## Attribute Changes

### Attributes Cannot Own Attributes

In 3.x, attributes can no longer own other attributes. This must be resolved before migration.

```typeql
# 2.x: Allowed (but problematic)
define
bio sub attribute, value string,
    owns bio-version;
bio-version sub attribute, value integer;

# 3.x: NOT ALLOWED - Must restructure
# Option 1: Move to parent entity
define
attribute bio, value string;
attribute bio-version, value integer;
entity page,
    owns bio,
    owns bio-version;

# Option 2: Use struct (when available)
```

### Resolution Steps

1. Identify attributes that own other attributes
2. Move ownership to parent entity/relation
3. Update queries to access via parent

---

## Undefine/Redefine Changes

### Undefine Targets Explicitly

```typeql
# 2.x: Undefine ownership
undefine person owns email;

# 3.x: Use 'from' keyword
undefine owns email from person;

# Undefine annotation
undefine @unique from person owns email;

# Undefine role
undefine relates friend from friendship;
```

### Redefine Single Change

```typeql
# 3.x: Only ONE change per redefine query
redefine user sub page;  # Change supertype

# Multiple changes require multiple queries
redefine attribute karma value integer;
redefine @regex("^.*@typedb.com$") from email;
```

---

## Driver API Changes

### Package Import

```python
# 2.x
from typedb.client import TypeDB, SessionType, TransactionType

# 3.x
from typedb.driver import TypeDB, Credentials, DriverOptions, TransactionType
```

### Result Handling

```python
# 2.x
result = tx.query().match("match $p isa person;").get()
for concept_map in result:
    person = concept_map.get("p")

# 3.x
result = tx.query("match $p isa person; select $p;").resolve()
for row in result.as_concept_rows():
    person = row.get("p")
```

### Concept Access

```python
# 2.x: Thing
if thing.is_entity():
    entity = thing.as_entity()

# 3.x: Instance (renamed from Thing)
if instance.is_entity():
    entity = instance.as_entity()
```

### Try Methods

```python
# 2.x: Throws exception on missing
value = attribute.get_value()

# 3.x: Try methods return None
value = attribute.try_get_value()  # Returns None if not attribute
```

---

## Export/Import Process

### Step 1: Export from 2.x

```bash
# While 2.x server is running
typedb server export \
    --database=mydb \
    --port=1729 \
    --schema=schema-2x.typeql \
    --data=data.typedb
```

### Step 2: Convert Schema

Transform the exported schema:

```bash
# Manual transformation required
# 1. Change type declarations
# 2. Update value types (long -> integer)
# 3. Add explicit cardinalities
# 4. Convert rules to functions
# 5. Remove attribute-owns-attribute
# 6. Change abstract keyword to @abstract
```

### Step 3: Import to 3.x

```bash
# Using TypeDB Console 3.x
typedb console

# In console
database import mydb /path/to/schema-3x.typeql /path/to/data.typedb
```

---

## Temporarily Unavailable Features

The following 2.x features are not yet available in 3.x:

1. **Instantiation restrictions via `as`** for inherited `owns`/`plays`
2. **Horizontal scaling** for Cloud and Enterprise
3. **Node.js, C, C++, and C# drivers** (use available languages or HTTP)

---

## Migration Checklist

- [ ] Update driver package imports
- [ ] Remove all session usage
- [ ] Change type declarations to explicit kinds
- [ ] Update `long` to `integer` value types
- [ ] Replace `get` with `select` in queries
- [ ] Fix delete syntax (delete attribute, not ownership)
- [ ] Add explicit cardinality annotations
- [ ] Convert rules to functions
- [ ] Fix attribute-owns-attribute patterns
- [ ] Change `abstract` keyword to `@abstract` annotation
- [ ] Update undefine syntax with `from` keyword
- [ ] Test all queries in 3.x console
- [ ] Update driver error handling

---

## Common Migration Errors

### "Unknown keyword: get"
```
Solution: Replace 'get' with 'select'
```

### "Cannot delete ownership this way"
```
Solution: Use 'delete $attr;' not 'delete $e has attr $attr;'
```

### "Unknown value type: long"
```
Solution: Replace 'long' with 'integer'
```

### "Sessions not supported"
```
Solution: Remove session usage, open transactions directly on driver
```

### "Cardinality violation"
```
Solution: Add explicit @card() annotations for multi-valued ownership
```
