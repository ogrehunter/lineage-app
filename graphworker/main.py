from fastapi import FastAPI, HTTPException, Query
from graph_service import LineageGraphService

app = FastAPI()
service = LineageGraphService()


@app.get("/graph/lineage")
def get_lineage(etl: str, schema: str, table: str, level: int = 1):
    result = service.traverse(etl, schema, table, level)

    return {
        "root": {
            "id": f"{schema}.{table}",
            "type": "table",
            "etl_schema": etl,
        },
        **result,
    }


@app.get("/api/lineage/table")
def get_lineage_table(
    etl: str = Query(...),
    schema: str = Query(...),
    table: str = Query(...),
    level: int = 10,
):
    normalized_etl = etl.lower()
    normalized_schema = schema.lower()
    normalized_table = table.lower()

    result = service.traverse(
        normalized_etl,
        normalized_schema,
        normalized_table,
        level,
    )

    return {
        "root": {
            "id": f"{normalized_schema}.{normalized_table}",
            "type": "table",
            "etl_schema": normalized_etl,
        },
        **result,
    }
