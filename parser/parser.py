"""
Extract table-level lineage from INSERT/CTAS SQL using SQLGlot.

Responsibility:
- Parse SQL
- Extract (source → target) table relationships
- Return structured results

No graph logic. No traversal. No querying.
Those belong in GraphWorker.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Set, Tuple
from sanitizer import sanitize_sql

# from validator import validate_sql

import sqlglot
from sqlglot import exp

# ============================================================
# Data Model
# ============================================================


@dataclass(frozen=True)
class TableLineage:
    source_schema: str
    source_table: str
    target_schema: str
    target_table: str


# ============================================================
# Internal Helpers
# ============================================================


def _table_parts(table: exp.Table) -> Tuple[str, str]:
    """
    Extract (schema, table) from SQLGlot Table expression.
    """

    if isinstance(table.this, exp.Identifier):
        table_name = table.this.name
    else:
        table_name = table.name

    if table.catalog and table.db:
        schema = f"{table.catalog}.{table.db}"
    else:
        schema = table.db or table.catalog or "TempView"

    return schema, table_name


def _cte_names(select_expr: exp.Expression) -> Set[str]:
    """
    Collect all CTE names in a SELECT expression.
    """
    return {
        cte.alias_or_name for cte in select_expr.find_all(exp.CTE) if cte.alias_or_name
    }


def _collect_sources(select_expr: exp.Expression) -> Set[Tuple[str, str]]:
    """
    Collect all source tables from a SELECT expression,
    excluding CTEs and optimizer hints.
    """

    cte_names = _cte_names(select_expr)
    sources: Set[Tuple[str, str]] = set()

    for table in select_expr.find_all(exp.Table):

        # Skip optimizer hints
        if (
            table.find_ancestor(exp.Hint) is not None
            or table.find_ancestor(exp.JoinHint) is not None
        ):
            continue

        # Skip CTE references
        if table.name in cte_names:
            continue

        sources.add(_table_parts(table))

    return sources


# ============================================================
# Public API
# ============================================================


def extract_table_lineage(
    sql: str,
    dialect: Optional[str] = "spark",
) -> List[TableLineage]:
    """
    Parse SQL and extract table-level lineage.

    Supports:
    - INSERT INTO ... SELECT
    - CREATE TABLE AS SELECT
    - CREATE VIEW AS SELECT

    Args:
        sql: One or more SQL statements.
        dialect: SQLGlot dialect (default: spark).

    Returns:
        List of TableLineage entries.
    """

    # validate_sql(sql)
    cleaned = sanitize_sql(sql)
    statements = sqlglot.parse(
        cleaned,
        read=dialect,
        error_level="ignore",
    )

    lineage: List[TableLineage] = []

    for stmt in statements:

        # ------------------------------------------------------
        # INSERT INTO target SELECT ...
        # ------------------------------------------------------
        if isinstance(stmt, exp.Insert):

            target = stmt.this
            select_expr = stmt.expression

            if not isinstance(target, exp.Table):
                continue

            if select_expr is None:
                continue

            sources = _collect_sources(select_expr)

            target_schema, target_table = _table_parts(target)

            for src_schema, src_table in sorted(sources):
                lineage.append(
                    TableLineage(
                        source_schema=src_schema,
                        source_table=src_table,
                        target_schema=target_schema,
                        target_table=target_table,
                    )
                )

            continue

        # ------------------------------------------------------
        # CREATE TABLE/VIEW AS SELECT
        # ------------------------------------------------------
        if isinstance(stmt, exp.Create):

            kind = stmt.args.get("kind")

            if kind not in {"TABLE", "VIEW"}:
                continue

            target = stmt.this
            select_expr = stmt.expression

            if not isinstance(target, exp.Table):
                continue

            if select_expr is None:
                continue

            sources = _collect_sources(select_expr)

            target_schema, target_table = _table_parts(target)

            # Views are treated as TempView
            if kind == "VIEW":
                target_schema = "TempView"

            for src_schema, src_table in sorted(sources):
                lineage.append(
                    TableLineage(
                        source_schema=src_schema,
                        source_table=src_table,
                        target_schema=target_schema,
                        target_table=target_table,
                    )
                )

    return lineage


def extract_table_lineage_pairs(
    sql: str,
    dialect: Optional[str] = "spark",
) -> List[Tuple[str, str, str, str]]:
    """
    Return lineage as simple tuples.

    Format:
    (source_schema, source_table, target_schema, target_table)
    """

    return [
        (
            l.source_schema,
            l.source_table,
            l.target_schema,
            l.target_table,
        )
        for l in extract_table_lineage(sql, dialect)
    ]


# ============================================================
# Public Exports
# ============================================================

__all__ = [
    "TableLineage",
    "extract_table_lineage",
    "extract_table_lineage_pairs",
]
