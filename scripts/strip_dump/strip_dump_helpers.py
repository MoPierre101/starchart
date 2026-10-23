import sqlite3
from pathlib import Path


def open_stripped_database(source_path: Path, destination_path: Path) -> sqlite3.Connection:
    """Create an empty destination database with the source dump attached read-only as 'source'."""
    destination_path.unlink(missing_ok=True)

    # uri=True lets ATTACH accept the "?mode=ro" below; autocommit=True makes each statement its own transaction.
    connection = sqlite3.connect(destination_path, uri=True, autocommit=True)
    connection.execute("ATTACH DATABASE ? AS source", (f"{source_path.resolve().as_uri()}?mode=ro",))

    # The output is rebuilt from the dump whenever it is needed, so crash-safety journals only slow it down.
    connection.execute("PRAGMA main.journal_mode = OFF")
    connection.execute("PRAGMA main.synchronous = OFF")
    return connection


def copy_rows(connection: sqlite3.Connection, table_name: str, select_statement: str) -> None:
    """Create the table with the source's columns, fill it from the SELECT, and print the row count.

    The dump's indexes cannot look up a single column, so write conditions as IN (SELECT ...), which SQLite
    reads once. A condition that searches the source table again for every row (EXISTS) takes hours.
    """
    create_table_like_source(connection, table_name)
    connection.execute(f"INSERT INTO main.{table_name} {select_statement}")
    row_count = connection.execute(f"SELECT COUNT(*) FROM main.{table_name}").fetchone()[0]
    print(f"{table_name}: {row_count:,} rows", flush=True)


def create_table_like_source(connection: sqlite3.Connection, table_name: str) -> None:
    columns = connection.execute(f"PRAGMA source.table_info({table_name})").fetchall()
    column_definitions = ", ".join(build_column_definition(column) for column in columns)
    connection.execute(f"CREATE TABLE main.{table_name} ({column_definitions})")


def build_column_definition(column: tuple) -> str:
    """Keep the declared type (varchar, datetime, decimal) because pgloader uses it to pick Postgres types."""
    _, name, declared_type, is_not_null, _, is_primary_key = column
    definition = f'"{name}" {declared_type}'
    if is_primary_key:
        return f"{definition} PRIMARY KEY"
    if is_not_null:
        return f"{definition} NOT NULL"
    return definition


def to_sql_list(values: tuple[int, ...]) -> str:
    """Turn (1, 2, 3) into the text '(1, 2, 3)' for use after IN."""
    return "(" + ", ".join(str(value) for value in values) + ")"
