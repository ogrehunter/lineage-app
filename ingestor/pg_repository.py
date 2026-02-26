# pg_repository.py
from typing import List
from psycopg2.extras import execute_values
from models import LineageEdge


def insert_edges(pg_conn, edges: List[LineageEdge]):

    if not edges:
        return

    with pg_conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE lineage_edges")

    rows = [
        (
            e.etl_schema,
            e.job_id,
            e.job_name,
            e.job_created_by,
            e.job_created_at,
            e.tfm_id,
            e.tfm_name,
            e.tfm_exec_order,
            e.source_schema,
            e.source_table,
            e.target_schema,
            e.target_table,
            e.runtime_second,
            e.runtime_minute,
            e.runtime_hour,
        )
        for e in edges
    ]

    with pg_conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO lineage_edges
            (
                etl_schema,
                job_id,
                job_name,
                job_created_by,
                job_created_at,
                tfm_id,
                tfm_name,
                tfm_exec_order,
                source_schema,
                source_table,
                target_schema,
                target_table,
                job_avg_runtime_second,
                job_avg_runtime_minute,
                job_avg_runtime_hour
            )
            VALUES %s
            """,
            rows,
            page_size=1000,
        )

    pg_conn.commit()
