"""
TypeDB 3.x Python Driver Patterns
Complete examples for TypeDB Python SDK
"""

import os
import time
import random
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from contextlib import contextmanager

from typedb.driver import (
    TypeDB,
    Credentials,
    DriverOptions,
    TransactionType,
    TransactionOptions,
)
from typedb.driver import TypeDBDriverException


# ============================================================================
# CONNECTION PATTERNS
# ============================================================================

def connect_community_edition():
    """Connect to local TypeDB Community Edition."""
    return TypeDB.driver("localhost:1729")


def connect_cloud():
    """Connect to TypeDB Cloud."""
    credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])
    options = DriverOptions(is_tls_enabled=True)
    return TypeDB.driver(
        "https://cluster.cloud.typedb.com:80",
        credentials,
        options
    )


def connect_enterprise_custom_ca():
    """Connect to TypeDB Enterprise with custom CA certificate."""
    credentials = Credentials("admin", os.environ["TYPEDB_PASSWORD"])
    options = DriverOptions(
        is_tls_enabled=True,
        tls_root_ca_path="/path/to/ca-certificate.pem"
    )
    return TypeDB.driver(
        "https://enterprise-server:1729",
        credentials,
        options
    )


# ============================================================================
# CLIENT WRAPPER CLASS
# ============================================================================

class TypeDBClient:
    """Reusable TypeDB client with connection management."""

    def __init__(self, address: str, database: str,
                 username: str = "admin", password: Optional[str] = None):
        self.address = address
        self.database = database
        self.username = username
        self.password = password or os.environ.get("TYPEDB_PASSWORD", "")
        self.driver = None

    def connect(self):
        """Establish connection to TypeDB."""
        credentials = Credentials(self.username, self.password)
        options = DriverOptions(is_tls_enabled=True)
        self.driver = TypeDB.driver(self.address, credentials, options)

    def close(self):
        """Close connection."""
        if self.driver:
            self.driver.close()
            self.driver = None

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    @contextmanager
    def read_transaction(self, timeout_ms: int = 300_000):
        """Context manager for read transactions."""
        options = TransactionOptions(transaction_timeout_millis=timeout_ms)
        with self.driver.transaction(
            self.database, TransactionType.READ, options=options
        ) as tx:
            yield tx

    @contextmanager
    def write_transaction(self, timeout_ms: int = 300_000):
        """Context manager for write transactions."""
        options = TransactionOptions(transaction_timeout_millis=timeout_ms)
        with self.driver.transaction(
            self.database, TransactionType.WRITE, options=options
        ) as tx:
            yield tx
            tx.commit()

    @contextmanager
    def schema_transaction(self, timeout_ms: int = 300_000):
        """Context manager for schema transactions."""
        options = TransactionOptions(transaction_timeout_millis=timeout_ms)
        with self.driver.transaction(
            self.database, TransactionType.SCHEMA, options=options
        ) as tx:
            yield tx
            tx.commit()


# ============================================================================
# QUERY EXECUTION PATTERNS
# ============================================================================

def basic_read_query(driver, database: str):
    """Execute a basic read query."""
    with driver.transaction(database, TransactionType.READ) as tx:
        result = tx.query("match $u isa user; select $u; limit 10;").resolve()

        for row in result.as_concept_rows():
            user = row.get("u")
            print(f"User IID: {user.get_iid()}")


def read_with_attributes(driver, database: str):
    """Read entities with their attributes."""
    query = """
        match
            $u isa user,
                has id $id,
                has name $name,
                has age $age;
        select $id, $name, $age;
        limit 10;
    """
    with driver.transaction(database, TransactionType.READ) as tx:
        result = tx.query(query).resolve()

        for row in result.as_concept_rows():
            user_id = row.get("id").get_string()
            name = row.get("name").get_string()
            age = row.get("age").get_integer()
            print(f"User: {user_id}, Name: {name}, Age: {age}")


def fetch_as_json(driver, database: str):
    """Fetch data as JSON documents."""
    query = """
        match $u isa user;
        fetch {
            "id": $u.id,
            "name": $u.name,
            "age": $u.age
        };
    """
    with driver.transaction(database, TransactionType.READ) as tx:
        result = tx.query(query).resolve()

        for doc in result.as_concept_documents():
            print(f"ID: {doc['id']}")
            print(f"Name: {doc['name']}")
            print(f"Age: {doc['age']}")


def aggregation_query(driver, database: str):
    """Execute aggregation queries."""
    query = """
        match $u isa user, has age $a;
        reduce
            $count = count,
            $avg = mean($a),
            $max = max($a),
            $min = min($a);
    """
    with driver.transaction(database, TransactionType.READ) as tx:
        result = tx.query(query).resolve()

        for row in result.as_concept_rows():
            count = row.get("count").get_integer()
            avg = row.get("avg").get_double()
            max_age = row.get("max").get_integer()
            min_age = row.get("min").get_integer()
            print(f"Count: {count}, Avg: {avg:.1f}, Max: {max_age}, Min: {min_age}")


def group_by_query(driver, database: str):
    """Execute group by aggregation."""
    query = """
        match $u isa user, has status $s, has age $a;
        reduce $count = count, $avg_age = mean($a) groupby $s;
    """
    with driver.transaction(database, TransactionType.READ) as tx:
        result = tx.query(query).resolve()

        for row in result.as_concept_rows():
            status = row.get("s").get_string()
            count = row.get("count").get_integer()
            avg_age = row.get("avg_age").get_double()
            print(f"Status: {status}, Count: {count}, Avg Age: {avg_age:.1f}")


# ============================================================================
# WRITE PATTERNS
# ============================================================================

def insert_entity(driver, database: str, user_id: str, name: str, age: int):
    """Insert a single entity."""
    query = f'''
        insert $u isa user,
            has id "{user_id}",
            has name "{name}",
            has age {age};
    '''
    with driver.transaction(database, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


def insert_relation(driver, database: str, user1_id: str, user2_id: str):
    """Insert a relation between two entities."""
    query = f'''
        match
            $u1 isa user, has id "{user1_id}";
            $u2 isa user, has id "{user2_id}";
        insert
            $f isa friendship, links (friend: $u1, friend: $u2);
    '''
    with driver.transaction(database, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


def update_attribute(driver, database: str, user_id: str, new_age: int):
    """Update a single-cardinality attribute."""
    query = f'''
        match $u isa user, has id "{user_id}";
        update $u has age {new_age};
    '''
    with driver.transaction(database, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


def delete_and_insert_pattern(driver, database: str, user_id: str, new_name: str):
    """Delete old value and insert new (for any cardinality)."""
    query = f'''
        match
            $u isa user, has id "{user_id}";
            $u has name $old;
        delete $old;
        insert $u has name "{new_name}";
    '''
    with driver.transaction(database, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


def delete_entity(driver, database: str, user_id: str):
    """Delete an entity."""
    query = f'''
        match $u isa user, has id "{user_id}";
        delete $u;
    '''
    with driver.transaction(database, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


def upsert_entity(driver, database: str, user_id: str, name: str):
    """Insert if not exists (put)."""
    query = f'''
        put $u isa user, has id "{user_id}", has name "{name}";
    '''
    with driver.transaction(database, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


# ============================================================================
# BATCH OPERATIONS
# ============================================================================

def batch_insert_single_transaction(driver, database: str, users: List[Dict]):
    """Batch insert in a single transaction."""
    with driver.transaction(database, TransactionType.WRITE) as tx:
        for user in users:
            query = f'''
                insert $u isa user,
                    has id "{user['id']}",
                    has name "{user['name']}",
                    has age {user['age']};
            '''
            tx.query(query)  # Don't resolve yet

        tx.commit()  # Commit all at once


def batch_insert_concurrent_promises(driver, database: str, users: List[Dict]):
    """Batch insert with concurrent promise resolution."""
    with driver.transaction(database, TransactionType.WRITE) as tx:
        promises = []

        for user in users:
            query = f'''
                insert $u isa user,
                    has id "{user['id']}",
                    has name "{user['name']}";
            '''
            promises.append(tx.query(query))

        # Resolve all promises to catch errors
        for promise in promises:
            promise.resolve()

        tx.commit()


def batch_insert_chunked(driver, database: str, users: List[Dict],
                         chunk_size: int = 100):
    """Batch insert in chunks for large datasets."""
    for i in range(0, len(users), chunk_size):
        chunk = users[i:i + chunk_size]

        with driver.transaction(database, TransactionType.WRITE) as tx:
            for user in chunk:
                query = f'''
                    insert $u isa user,
                        has id "{user['id']}",
                        has name "{user['name']}";
                '''
                tx.query(query).resolve()

            tx.commit()

        print(f"Inserted chunk {i // chunk_size + 1}")


# ============================================================================
# ERROR HANDLING & RETRY
# ============================================================================

def execute_with_retry(driver, database: str, query: str,
                       max_retries: int = 3) -> bool:
    """Execute write query with retry on conflict."""
    for attempt in range(max_retries):
        try:
            with driver.transaction(database, TransactionType.WRITE) as tx:
                tx.query(query).resolve()
                tx.commit()
                return True
        except TypeDBDriverException as e:
            error_str = str(e).lower()
            if "conflict" in error_str and attempt < max_retries - 1:
                # Exponential backoff with jitter
                wait_time = 0.1 * (2 ** attempt) + random.uniform(0, 0.1)
                time.sleep(wait_time)
                continue
            raise
    return False


def safe_query(driver, database: str, query: str) -> Optional[Any]:
    """Execute query with error handling."""
    try:
        with driver.transaction(database, TransactionType.READ) as tx:
            return tx.query(query).resolve()
    except TypeDBDriverException as e:
        error_str = str(e).upper()

        if "QEX" in error_str:
            print(f"Query execution error: {e}")
        elif "TQL" in error_str:
            print(f"TypeQL parsing error: {e}")
        elif "TXN" in error_str:
            print(f"Transaction error: {e}")
        else:
            print(f"Driver error: {e}")

        return None


# ============================================================================
# SCHEMA OPERATIONS
# ============================================================================

def define_schema(driver, database: str, schema: str):
    """Define schema in database."""
    with driver.transaction(database, TransactionType.SCHEMA) as tx:
        tx.query(f"define {schema}").resolve()
        tx.commit()


def create_user_schema(driver, database: str):
    """Create a complete user schema."""
    schema = """
        define

        # Attributes
        attribute id, value string;
        attribute name, value string;
        attribute email, value string @regex("^[^@]+@[^@]+\\.[^@]+$");
        attribute age, value integer @range(0..150);
        attribute status, value string @values("active", "inactive", "pending");
        attribute created_at, value datetime-tz;

        # Entities
        entity user,
            owns id @key,
            owns name @card(1),
            owns email @unique,
            owns age,
            owns status,
            owns created_at,
            plays friendship:friend;

        # Relations
        relation friendship,
            relates friend @card(2);
    """
    with driver.transaction(database, TransactionType.SCHEMA) as tx:
        tx.query(schema).resolve()
        tx.commit()


def get_schema(driver, database: str) -> str:
    """Get full schema as TypeQL string."""
    db = driver.databases.get(database)
    return db.schema()


# ============================================================================
# DATABASE MANAGEMENT
# ============================================================================

def create_database_if_not_exists(driver, database: str):
    """Create database if it doesn't exist."""
    if not driver.databases.contains(database):
        driver.databases.create(database)
        print(f"Created database: {database}")
    else:
        print(f"Database already exists: {database}")


def delete_database(driver, database: str):
    """Delete a database."""
    if driver.databases.contains(database):
        db = driver.databases.get(database)
        db.delete()
        print(f"Deleted database: {database}")


def list_databases(driver) -> List[str]:
    """List all databases."""
    return [db.name for db in driver.databases.all()]


# ============================================================================
# RESULT PROCESSING UTILITIES
# ============================================================================

@dataclass
class User:
    """User data class."""
    id: str
    name: str
    age: Optional[int] = None
    email: Optional[str] = None


def query_users_as_objects(driver, database: str, limit: int = 100) -> List[User]:
    """Query users and return as dataclass objects."""
    query = f"""
        match
            $u isa user,
                has id $id,
                has name $name;
            try {{ $u has age $age; }};
            try {{ $u has email $email; }};
        select $id, $name, $age, $email;
        limit {limit};
    """

    users = []
    with driver.transaction(database, TransactionType.READ) as tx:
        result = tx.query(query).resolve()

        for row in result.as_concept_rows():
            user_id = row.get("id").get_string()
            name = row.get("name").get_string()

            age_concept = row.get("age")
            age = age_concept.get_integer() if age_concept else None

            email_concept = row.get("email")
            email = email_concept.get_string() if email_concept else None

            users.append(User(id=user_id, name=name, age=age, email=email))

    return users


def check_entity_exists(driver, database: str, entity_type: str,
                        key_attr: str, key_value: str) -> bool:
    """Check if an entity exists."""
    query = f'''
        match $e isa {entity_type}, has {key_attr} "{key_value}";
        reduce $count = count;
    '''
    with driver.transaction(database, TransactionType.READ) as tx:
        result = tx.query(query).resolve()

        for row in result.as_concept_rows():
            count = row.get("count").get_integer()
            return count > 0

    return False


# ============================================================================
# TIMING AND METRICS
# ============================================================================

def timed_query(tx, query: str, warn_threshold: float = 0.5):
    """Execute query with timing."""
    start = time.perf_counter()
    result = tx.query(query).resolve()
    elapsed = time.perf_counter() - start

    if elapsed > warn_threshold:
        print(f"SLOW QUERY ({elapsed:.2f}s): {query[:100]}...")

    return result, elapsed


class QueryMetrics:
    """Track query performance metrics."""

    def __init__(self):
        self.queries = []

    def record(self, query: str, elapsed: float):
        self.queries.append({"query": query[:100], "elapsed": elapsed})

    def summary(self):
        if not self.queries:
            return {}

        times = [q["elapsed"] for q in self.queries]
        times.sort()

        return {
            "count": len(times),
            "total": sum(times),
            "mean": sum(times) / len(times),
            "p50": times[len(times) // 2],
            "p95": times[int(len(times) * 0.95)] if len(times) >= 20 else None,
            "p99": times[int(len(times) * 0.99)] if len(times) >= 100 else None,
            "max": max(times),
        }


# ============================================================================
# COMPLETE EXAMPLE USAGE
# ============================================================================

def main():
    """Complete example demonstrating TypeDB 3.x patterns."""

    # Connect to TypeDB Cloud
    credentials = Credentials("admin", os.environ.get("TYPEDB_PASSWORD", ""))
    options = DriverOptions(is_tls_enabled=True)

    with TypeDB.driver(
        "https://cluster.cloud.typedb.com:80",
        credentials,
        options
    ) as driver:

        database = "example-db"

        # Create database if needed
        create_database_if_not_exists(driver, database)

        # Define schema
        create_user_schema(driver, database)

        # Insert test data
        test_users = [
            {"id": "u1", "name": "Alice", "age": 30},
            {"id": "u2", "name": "Bob", "age": 25},
            {"id": "u3", "name": "Carol", "age": 35},
        ]
        batch_insert_single_transaction(driver, database, test_users)

        # Query data
        users = query_users_as_objects(driver, database)
        for user in users:
            print(f"User: {user.name}, Age: {user.age}")

        # Aggregation
        aggregation_query(driver, database)

        # Check existence
        exists = check_entity_exists(driver, database, "user", "id", "u1")
        print(f"User u1 exists: {exists}")


if __name__ == "__main__":
    main()
