from fastapi import FastAPI
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
