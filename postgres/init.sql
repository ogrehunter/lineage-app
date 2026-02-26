/*CREATE TABLE lineage_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id INT,
  job_name TEXT,
  source_schema TEXT,
  source_table TEXT,
  target_schema TEXT,
  target_table TEXT,
  job_avg_runtime_second BIGINT,
  job_avg_runtime_minute INT,
  job_avg_runtime_hour INT,
  job_created_by TEXT,
  loaded_at TIMESTAMP DEFAULT now()
);
*/

CREATE TABLE lineage_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etl_schema TEXT,
  job_id INT,
  job_name TEXT,
  job_created_by TEXT,
  job_created_at DATE,
  tfm_id INT,
  tfm_name TEXT,
  tfm_exec_order INT,
  source_schema TEXT,
  source_table TEXT,
  target_schema TEXT,
  target_table TEXT,
  job_avg_runtime_second BIGINT,
  job_avg_runtime_minute INT,
  job_avg_runtime_hour INT,
  loaded_at TIMESTAMP DEFAULT now()
);

