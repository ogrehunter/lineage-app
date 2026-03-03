# lineage_service.py

from typing import List

from models import SQLJob, LineageEdge
from parser import extract_table_lineage


class LineageBuilder:
    """
    Build lineage edges from SQL jobs.

    Responsibility:
    - Iterate over jobs
    - Extract table lineage
    - Enrich with job metadata
    - Return LineageEdge list
    """

    def build_edges(self, jobs: List[SQLJob]) -> List[LineageEdge]:

        edges: List[LineageEdge] = []

        for job in jobs:

            if not job.sql_script:
                continue

            try:
                lineage_entries = extract_table_lineage(job.sql_script)

            except Exception as exc:
                # IMPORTANT: log, do not silently ignore
                print(f"[LineageBuilder] Failed to parse job {job.job_id}: {exc}")
                continue

            for entry in lineage_entries:

                edges.append(
                    LineageEdge(
                        etl_schema=job.etl_schema,
                        job_id=job.job_id,
                        job_name=job.job_name,
                        job_created_by=job.job_created_by,
                        job_created_at=job.job_created_at,
                        tfm_id=job.tfm_id,
                        tfm_name=job.tfm_name,
                        tfm_exec_order=job.tfm_exec_order,
                        source_schema=entry.source_schema,
                        source_table=entry.source_table,
                        target_schema=entry.target_schema,
                        target_table=entry.target_table,
                        runtime_second=job.runtime_second,
                        runtime_minute=job.runtime_minute,
                        runtime_hour=job.runtime_hour,
                    )
                )

        return edges
