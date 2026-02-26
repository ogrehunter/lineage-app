# mssql_repository.py
from typing import List
from models import SQLJob

ETL_SCHEMAS = ["dbetl_prod", "dbetl_t2_t3", "dbetl_surrounding"]


def fetch_sql_jobs(conn) -> List[SQLJob]:
    jobs = []
    cur = conn.cursor()

    for etl_schema in ETL_SCHEMAS:
        query = f"""
        SELECT DISTINCT 
            A.job_id, A.job_name, A.job_created_by, A.job_created_date, A.tfm_id, A.tfm_name, A.exec_order,  
            B.avg_runtime_second job_avg_runtime_second, B.avg_runtime_minute job_avg_runtime_minute,
            B.avg_runtime_hour job_avg_runtime_hour, A.sql_script
        FROM (
                SELECT
                    jc.job_id,
                    jc.job_name,
                    jc.etl_layer,
                    jc.is_enabled AS is_job_enabled,
                    jc.notes job_notes,
                    jc.cluster_code,
                    jc.created_date job_created_date,
                    jc.created_by job_created_by,
                    tc.tfm_id,
                    tc.tfm_name,
                    tc.tfm_query,
                    tc.schema_json_id,
                    tc.json_src_column,
                    tc.tfm_additional_vars,
                    tc.exec_order,
                    tc.is_enabled tfm_is_enabled,
                    tc.notes tfm_notes,
                    tc.created_date tfm_created_date,
                    tc.created_by tfm_created_by,
                    lc.load_id,
                    lc.load_name,
                    lc.tgt_table_name,
                    lc.tgt_path,
                    lc.tgt_format,
                    lc.table_catalog,
                    lc.mode,
                    lc.scd2_params,
                    lc.extra_params,
                    lc.created_date load_created_date,
                    lc.created_by load_created_by,
                    CASE
                        WHEN lc.load_id IS NOT NULL
                        THEN LOWER(CONCAT('INSERT INTO ', lc.table_catalog, ' ', tc.tfm_query))
                        ELSE LOWER(CONCAT('CREATE VIEW ', tc.tfm_name, ' AS ', tc.tfm_query))
                        END AS sql_script
                FROM {etl_schema}.dbo.job_config jc
                LEFT JOIN {etl_schema}.dbo.transform_config tc
                    ON jc.job_id = tc.job_id
                LEFT JOIN {etl_schema}.dbo.load_config lc
                    ON tc.tfm_id = lc.tfm_id
                WHERE jc.is_enabled = 'Y'
                AND tc.is_enabled = 'Y'
                        ) A
        LEFT JOIN 
                (
                SELECT job_id,
                    COUNT(CASE WHEN status = 'SUCCEEDED' THEN 1 END) succeeded_count,
                    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) failed_count,
                    COUNT(CASE WHEN status = 'RUNNING' THEN 1 END) running_count, 
                    COUNT(1) total_run,
                    AVG(CASE WHEN status = 'SUCCEEDED' THEN datediff(SECOND, start_time, end_time) END) AS avg_runtime_second,
                    AVG(CASE WHEN status = 'SUCCEEDED' THEN datediff(SECOND, start_time, end_time) END)/60 AS avg_runtime_minute,
                    AVG(CASE WHEN status = 'SUCCEEDED' THEN datediff(SECOND, start_time, end_time) END)/3600 AS avg_runtime_hour
                FROM {etl_schema}.dbo.job_summary_log
                GROUP BY job_id
                ) B ON A.job_id=b.job_id
        """
        

        cur.execute(query)

        for row in cur.fetchall():
            jobs.append(
                SQLJob(
                    etl_schema=etl_schema,
                    job_id=row[0],
                    job_name=row[1],
                    job_created_by=row[2],
                    job_created_at=row[3],
                    tfm_id=row[4],
                    tfm_name=row[5],
                    tfm_exec_order=row[6],
                    runtime_second=row[7],
                    runtime_minute=row[8],
                    runtime_hour=row[9],
                    sql_script=row[-1],
                )
            )

    return jobs
