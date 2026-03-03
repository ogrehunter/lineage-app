# models.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class SQLJob:
    etl_schema: str
    job_id: int
    job_name: str
    job_created_by: str
    job_created_at: datetime
    tfm_id: int
    tfm_name: str
    tfm_exec_order: int
    runtime_second: Optional[float]
    runtime_minute: Optional[float]
    runtime_hour: Optional[float]
    sql_script: str


@dataclass
class LineageEdge:
    etl_schema: str
    job_id: int
    job_name: str
    job_created_by: str
    job_created_at: datetime
    tfm_id: int
    tfm_name: str
    tfm_exec_order: int
    source_schema: str
    source_table: str
    target_schema: str
    target_table: str
    runtime_second: Optional[float]
    runtime_minute: Optional[float]
    runtime_hour: Optional[float]

