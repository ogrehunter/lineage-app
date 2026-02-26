# main.py
import os
import time
from dotenv import load_dotenv
from mssql_python import connect as mssql_connect
import psycopg2

from mssql_repository import fetch_sql_jobs
from lineage_builder import LineageBuilder
from pg_repository import insert_edges


def main():
    start = time.perf_counter()
    load_dotenv()

    mssql_conn = mssql_connect(os.getenv("SQL_CONNECTION_STRING"))

    pg_conn = psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )

    jobs = fetch_sql_jobs(mssql_conn)

    service = LineageBuilder()
    edges = service.build_edges(jobs)

    insert_edges(pg_conn, edges)

    print(f"Inserted {len(edges)} lineage edges")
    print(f"Execution time: {time.perf_counter() - start:.4f}s")


if __name__ == "__main__":
    main()
