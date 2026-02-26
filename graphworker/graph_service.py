import networkx as nx
import psycopg2
import os
from collections import deque


class LineageGraphService:

    def __init__(self):
        self.graphs = {}

    # ---------------------------------------------------
    # LOAD GRAPH + COLLAPSE TEMPVIEW
    # ---------------------------------------------------
    def load_graph(self, etl_schema: str):

        if etl_schema in self.graphs:
            return self.graphs[etl_schema]

        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            dbname=os.getenv("POSTGRES_DB"),
            port=5432,
        )

        cur = conn.cursor()
        cur.execute(
            """
            SELECT source_schema,
                   source_table,
                   target_schema,
                   target_table,
                   job_name
            FROM lineage_edges
            WHERE etl_schema = %s
            """,
            (etl_schema,),
        )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        G = nx.DiGraph()

        # Build raw graph
        for source_schema, source_table, target_schema, target_table, job in rows:

            source_id = f"{source_schema}.{source_table}"
            target_id = f"{target_schema}.{target_table}"

            G.add_node(
                source_id,
                type="table",
                schema=source_schema,
                table=source_table,
            )

            G.add_node(
                target_id,
                type="table",
                schema=target_schema,
                table=target_table,
            )

            G.add_edge(source_id, target_id, job=job)

        # Collapse TempView nodes
        G = self._collapse_tempview_nodes(G)

        self.graphs[etl_schema] = G
        return G

    # ---------------------------------------------------
    # COLLAPSE TEMPVIEW NODES
    # ---------------------------------------------------
    def _collapse_tempview_nodes(self, G: nx.DiGraph):

        temp_nodes = [
            node
            for node, data in G.nodes(data=True)
            if data.get("schema") == "TempView"
        ]

        for temp_node in temp_nodes:

            if temp_node not in G:
                continue  # might already be removed

            preds = list(G.predecessors(temp_node))
            succs = list(G.successors(temp_node))

            for p in preds:
                for s in succs:

                    if p == s:
                        continue

                    # Preserve job from predecessor → temp_node
                    job = G[p][temp_node].get("job")

                    if not G.has_edge(p, s):
                        G.add_edge(p, s, job=job)

            G.remove_node(temp_node)

        return G

    # ---------------------------------------------------
    # PUBLIC TRAVERSE
    # ---------------------------------------------------
    def traverse(self, etl_schema: str, schema: str, table: str, max_level: int):

        G = self.load_graph(etl_schema)
        root = f"{schema}.{table}"

        if root not in G:
            return {"nodes": [], "edges": [], "upstream": [], "downstream": []}

        sub_nodes = set([root])
        edges = []

        upstream = self._traverse_direction(
            G, root, max_level, direction="upstream", sub_nodes=sub_nodes, edges=edges
        )

        downstream = self._traverse_direction(
            G, root, max_level, direction="downstream", sub_nodes=sub_nodes, edges=edges
        )

        nodes = []
        for node in sub_nodes:
            s, t = node.split(".")
            nodes.append(
                {
                    "id": node,
                    "schema": s,
                    "table": t,
                    "type": "table",
                }
            )

        return {
            "nodes": nodes,
            "edges": edges,
            "upstream": upstream,
            "downstream": downstream,
        }

    # ---------------------------------------------------
    # DEPTH-AWARE DIRECTIONAL BFS
    # ---------------------------------------------------
    def _traverse_direction(
        self,
        G,
        root,
        max_level,
        direction,
        sub_nodes,
        edges,
    ):

        visited = {root: 0}
        queue = deque([(root, 0)])
        results = []

        while queue:
            current, level = queue.popleft()

            if level >= max_level:
                continue

            if direction == "upstream":
                neighbors = G.predecessors(current)
            else:
                neighbors = G.successors(current)

            for neighbor in neighbors:

                new_level = level + 1

                if new_level > max_level:
                    continue

                # Depth-aware pruning
                if neighbor in visited and visited[neighbor] >= new_level:
                    continue

                visited[neighbor] = new_level
                queue.append((neighbor, new_level))
                sub_nodes.add(neighbor)

                if direction == "upstream":
                    job = G[neighbor][current].get("job")
                    edges.append(
                        {
                            "from": neighbor,
                            "to": current,
                            "job": job,
                        }
                    )
                else:
                    job = G[current][neighbor].get("job")
                    edges.append(
                        {
                            "from": current,
                            "to": neighbor,
                            "job": job,
                        }
                    )

                s, t = neighbor.split(".")
                results.append(
                    {
                        "schema": s,
                        "table": t,
                        "level": new_level,
                        "via": job,
                    }
                )

        return results
