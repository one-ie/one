# TypeDB Python Driver Reference

> Complete Python driver patterns for TypeDB 3.x

---

## Installation

```bash
pip install typedb-driver
```

---

## Connection Patterns

### Community Edition (Local)

```python
from typedb.driver import TypeDB

# No auth, no TLS
driver = TypeDB.driver("localhost:1729")
```

### TypeDB Cloud

```python
from typedb.driver import TypeDB, Credentials, DriverOptions
import os

credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])
options = DriverOptions(is_tls_enabled=True)

driver = TypeDB.driver(
    "https://cluster-name.cloud.typedb.com:80",
    credentials,
    options
)
```

### TypeDB Enterprise (Custom CA)

```python
from typedb.driver import TypeDB, Credentials, DriverOptions

credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])
options = DriverOptions(
    is_tls_enabled=True,
    tls_root_ca_path="/path/to/ca-certificate.pem"
)

driver = TypeDB.driver(
    "https://your-enterprise-server:1729",
    credentials,
    options
)
```

### Context Manager (Recommended)

```python
with TypeDB.driver(address, credentials, options) as driver:
    # Operations here
    with driver.transaction("database", TransactionType.READ) as tx:
        result = tx.query("match $e isa entity; select $e;").resolve()
    # Driver automatically closed on exit
```

### Manual Lifecycle

```python
driver = TypeDB.driver(address, credentials, options)
try:
    # Operations
    pass
finally:
    driver.close()
```

---

## Database Management

### List Databases

```python
databases = driver.databases.all()
for db in databases:
    print(db.name)
```

### Check Database Exists

```python
if driver.databases.contains("my-database"):
    print("Database exists")
```

### Create Database

```python
driver.databases.create("my-database")
```

### Get Database

```python
db = driver.databases.get("my-database")
```

### Delete Database

```python
db = driver.databases.get("my-database")
db.delete()
```

### Get Schema

```python
db = driver.databases.get("my-database")
schema_str = db.schema()  # Full schema as TypeQL string
type_schema = db.type_schema()  # Type definitions only
```

### Export Database

```python
db = driver.databases.get("my-database")
db.export_to_file("schema.typeql", "data.typedb")
```

### Import Database

```python
driver.databases.import_from_file(
    "new-database",
    "schema.typeql",
    "data.typedb"
)
```

---

## Transaction Types

```python
from typedb.driver import TransactionType

# READ: Read-only queries
# - Fastest, fully concurrent
# - No commit needed
# - Auto-closes when exiting context
TransactionType.READ

# WRITE: Data modifications
# - insert, delete, update, put
# - MUST commit
# - May conflict with other writes
TransactionType.WRITE

# SCHEMA: Schema modifications
# - define, undefine, redefine
# - MUST commit
# - Exclusive lock (blocks other writes)
TransactionType.SCHEMA
```

---

## Query Execution

### Basic Query

```python
with driver.transaction("db", TransactionType.READ) as tx:
    # Query returns a promise
    promise = tx.query("match $u isa user; select $u;")

    # Resolve to get results
    result = promise.resolve()

    # Process results
    for row in result.as_concept_rows():
        user = row.get("u")
        print(user)
```

### Query with Parameters (String Formatting)

```python
# Note: TypeQL doesn't have parameterized queries
# Use string formatting with care (escape values properly)

name = "Alice"
query = f'match $u isa user, has name "{name}"; select $u;'

with driver.transaction("db", TransactionType.READ) as tx:
    result = tx.query(query).resolve()
```

### Write Transaction

```python
with driver.transaction("db", TransactionType.WRITE) as tx:
    # Insert data
    tx.query('insert $u isa user, has name "Alice", has age 30;').resolve()

    # MUST commit or changes are lost
    tx.commit()
```

### Schema Transaction

```python
with driver.transaction("db", TransactionType.SCHEMA) as tx:
    tx.query("""
        define
        attribute status, value string @values("active", "inactive");
        entity user,
            owns status;
    """).resolve()
    tx.commit()
```

### Concurrent Query Submission

```python
with driver.transaction("db", TransactionType.READ) as tx:
    # Submit queries concurrently
    promise1 = tx.query("match $u isa user; select $u;")
    promise2 = tx.query("match $c isa company; select $c;")

    # Resolve in any order
    users = promise1.resolve()
    companies = promise2.resolve()
```

---

## Result Processing

### Concept Rows (SELECT queries)

```python
result = tx.query("match $u isa user, has name $n; select $u, $n;").resolve()

for row in result.as_concept_rows():
    # Get by variable name
    user = row.get("u")
    name = row.get("n")

    # Get by index
    first = row.get_index(0)

    # List all variable names
    for var_name in row.column_names():
        print(var_name)

    # Iterate all concepts
    for concept in row.concepts():
        print(concept)

    # Get query type
    query_type = row.query_type  # READ, WRITE, SCHEMA
```

### Concept Documents (FETCH queries)

```python
result = tx.query("""
    match $u isa user;
    fetch {
        "name": $u.name,
        "age": $u.age
    };
""").resolve()

for doc in result.as_concept_documents():
    print(doc["name"])
    print(doc["age"])
```

### Schema Query Results

```python
result = tx.query("define entity new_type;").resolve()

if result.is_ok():
    print("Schema updated successfully")
```

### Check Result Type

```python
result = tx.query("...").resolve()

if result.is_ok():
    # Schema operation (define/undefine/redefine)
    result.as_ok()
elif result.is_concept_rows():
    # SELECT query
    rows = result.as_concept_rows()
elif result.is_concept_documents():
    # FETCH query
    docs = result.as_concept_documents()
```

---

## Concept Type Checking

### Type Checks

```python
# Instance checks
concept.is_entity()      # Entity instance
concept.is_relation()    # Relation instance
concept.is_attribute()   # Attribute instance
concept.is_instance()    # Any instance

# Type checks
concept.is_entity_type()    # Entity type
concept.is_relation_type()  # Relation type
concept.is_attribute_type() # Attribute type
concept.is_type()           # Any type

# Value check
concept.is_value()       # Raw value
```

### Type Casting

```python
# Cast to specific type
entity = concept.as_entity()
relation = concept.as_relation()
attribute = concept.as_attribute()

entity_type = concept.as_entity_type()
relation_type = concept.as_relation_type()
attribute_type = concept.as_attribute_type()

value = concept.as_value()
```

---

## Value Extraction

### From Attributes

```python
# Direct extraction (throws if wrong type)
attr.get_string()
attr.get_integer()
attr.get_double()
attr.get_decimal()
attr.get_boolean()
attr.get_date()
attr.get_datetime()
attr.get_datetime_tz()
attr.get_duration()
attr.get_struct()

# Safe extraction (returns None if wrong type)
attr.try_get_string()
attr.try_get_integer()
# ... etc
```

### Type Checking for Values

```python
concept.is_string()
concept.is_integer()
concept.is_double()
concept.is_decimal()
concept.is_boolean()
concept.is_date()
concept.is_datetime()
concept.is_datetime_tz()
concept.is_duration()
concept.is_struct()
```

### Instance Identification

```python
# Get internal ID (unique identifier)
iid = entity.get_iid()
iid = relation.get_iid()

# Get type label
label = concept.get_label()

# Get type of instance
type_obj = instance.get_type()

# Get value type description
value_type = attribute.get_value_type()
```

---

## Datetime Handling

### Create Datetime

```python
from typedb.common.datetime import Datetime

# From ISO string
dt = Datetime.fromstring("2025-01-15T10:30:00", tz_name="America/New_York")
dt = Datetime.fromstring("2025-01-15T10:30:00.009257123", tz_name="Europe/London")

# From timestamp
dt = Datetime.fromtimestamp(timestamp_seconds, subsec_nanos, tz_name="UTC")

# UTC variants
dt = Datetime.utcfromstring("2025-01-15T10:30:00")
dt = Datetime.utcfromtimestamp(timestamp_seconds, subsec_nanos)
```

### Datetime Properties

```python
dt.isoformat()          # ISO 8601 string
dt.year
dt.month
dt.day
dt.hour
dt.minute
dt.second
dt.microsecond          # Rounded microseconds
dt.nanos                # Nanoseconds component
dt.total_seconds()      # Total seconds including nanos
dt.datetime_without_nanos  # Standard library datetime
dt.tz_name              # IANA timezone name
dt.offset_seconds       # Offset from UTC
```

### Duration Handling

```python
from typedb.common.duration import Duration

# Parse ISO 8601 duration
duration = Duration.fromstring("P1Y10M7DT15H44M5.00394892S")
duration = Duration.fromstring("P55W")

# Access components
duration.months
duration.days
duration.nanos
```

---

## Transaction Options

### Transaction Timeout

```python
from typedb.driver import TransactionOptions

# Default is 5 minutes
options = TransactionOptions(transaction_timeout_millis=120_000)  # 2 minutes

with driver.transaction("db", TransactionType.WRITE, options=options) as tx:
    # Long-running operations
    pass
```

### Schema Lock Timeout

```python
# Default is 30 seconds
options = TransactionOptions(schema_lock_acquire_timeout_millis=60_000)

with driver.transaction("db", TransactionType.SCHEMA, options=options) as tx:
    # Schema operations
    pass
```

---

## Error Handling

### TypeDB Exceptions

```python
from typedb.driver import TypeDBDriverException

try:
    with driver.transaction("db", TransactionType.WRITE) as tx:
        tx.query("insert invalid query").resolve()
        tx.commit()
except TypeDBDriverException as e:
    error_str = str(e).upper()

    if "QEX" in error_str:
        print("Query execution error")
    elif "TQL" in error_str:
        print("TypeQL parsing error")
    elif "TXN" in error_str:
        print("Transaction error")
    elif "CLI" in error_str:
        print("Client/connection error")
    else:
        print(f"Other error: {e}")
```

### Retry Pattern

```python
import time
import random

def execute_with_retry(driver, db, query, max_retries=3):
    for attempt in range(max_retries):
        try:
            with driver.transaction(db, TransactionType.WRITE) as tx:
                tx.query(query).resolve()
                tx.commit()
                return True
        except TypeDBDriverException as e:
            if "conflict" in str(e).lower() and attempt < max_retries - 1:
                # Exponential backoff with jitter
                wait_time = 0.1 * (2 ** attempt) + random.uniform(0, 0.1)
                time.sleep(wait_time)
                continue
            raise
    return False
```

---

## Batch Operations

### Batch Insert (Single Transaction)

```python
def batch_insert(driver, db, items):
    with driver.transaction(db, TransactionType.WRITE) as tx:
        for item in items:
            query = f'insert $x isa item, has name "{item["name"]}";'
            tx.query(query)  # Don't resolve yet
        tx.commit()  # Commit all at once
```

### Batch Insert with Concurrent Promises

```python
def batch_insert_concurrent(driver, db, items):
    with driver.transaction(db, TransactionType.WRITE) as tx:
        promises = []
        for item in items:
            query = f'insert $x isa item, has name "{item["name"]}";'
            promises.append(tx.query(query))

        # Resolve all to catch errors
        for p in promises:
            p.resolve()

        tx.commit()
```

### Chunked Processing

```python
def process_in_chunks(driver, db, items, chunk_size=100):
    for i in range(0, len(items), chunk_size):
        chunk = items[i:i + chunk_size]

        with driver.transaction(db, TransactionType.WRITE) as tx:
            for item in chunk:
                tx.query(f'insert $x isa item, has id "{item}";').resolve()
            tx.commit()
```

---

## Best Practices

### 1. Use Context Managers

```python
# GOOD
with TypeDB.driver(...) as driver:
    with driver.transaction(...) as tx:
        # ...

# AVOID
driver = TypeDB.driver(...)
tx = driver.transaction(...)
# Risk of resource leaks
```

### 2. Reuse Driver Instance

```python
# GOOD: Singleton pattern
class DBClient:
    _instance = None

    @classmethod
    def get_driver(cls):
        if cls._instance is None:
            cls._instance = TypeDB.driver(...)
        return cls._instance

# AVOID: New driver per query
def bad_query():
    driver = TypeDB.driver(...)  # Expensive!
    # ...
```

### 3. Batch Writes

```python
# GOOD: Single transaction
with driver.transaction(db, TransactionType.WRITE) as tx:
    for item in items:
        tx.query(f"insert ...")
    tx.commit()

# AVOID: Transaction per item
for item in items:
    with driver.transaction(db, TransactionType.WRITE) as tx:
        tx.query(f"insert ...")
        tx.commit()  # Too many commits!
```

### 4. Use READ Transactions When Possible

```python
# READ transactions are:
# - Faster (no locking overhead)
# - Fully concurrent
# - Don't require commit
```

### 5. Handle Credentials Securely

```python
import os

# GOOD: Environment variables
credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])

# AVOID: Hardcoded
credentials = Credentials("admin", "password123")  # Never do this!
```

### 6. Enable TLS in Production

```python
options = DriverOptions(is_tls_enabled=True)  # Always in production
```

---

## Complete Example

```python
from typedb.driver import TypeDB, Credentials, DriverOptions, TransactionType
from typedb.driver import TypeDBDriverException
import os

class TypeDBClient:
    def __init__(self, address: str, database: str):
        self.address = address
        self.database = database
        self.driver = None

    def connect(self):
        credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])
        options = DriverOptions(is_tls_enabled=True)
        self.driver = TypeDB.driver(self.address, credentials, options)

    def close(self):
        if self.driver:
            self.driver.close()

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def query_read(self, query: str):
        with self.driver.transaction(self.database, TransactionType.READ) as tx:
            return list(tx.query(query).resolve().as_concept_rows())

    def query_write(self, query: str):
        with self.driver.transaction(self.database, TransactionType.WRITE) as tx:
            tx.query(query).resolve()
            tx.commit()

    def batch_insert(self, queries: list):
        with self.driver.transaction(self.database, TransactionType.WRITE) as tx:
            promises = [tx.query(q) for q in queries]
            for p in promises:
                p.resolve()
            tx.commit()


# Usage
if __name__ == "__main__":
    with TypeDBClient("https://cluster.typedb.com:80", "my-db") as client:
        # Read
        users = client.query_read("match $u isa user; select $u; limit 10;")
        for row in users:
            print(row.get("u"))

        # Write
        client.query_write('insert $u isa user, has name "Alice";')

        # Batch
        inserts = [
            'insert $u isa user, has name "Bob";',
            'insert $u isa user, has name "Carol";',
        ]
        client.batch_insert(inserts)
```
