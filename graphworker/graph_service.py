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

        G = self._collapse_tempview_nodes(G)
        G = self._remove_self_relationships(G)

        if not nx.is_directed_acyclic_graph(G):
            raise Exception("Lineage graph contains cycle")

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
                continue

            preds = list(G.predecessors(temp_node))
            succs = list(G.successors(temp_node))

            for p in preds:
                for s in succs:

                    if p == s:
                        continue

                    job = G[p][temp_node].get("job")

                    if not G.has_edge(p, s):
                        G.add_edge(p, s, job=job)

            G.remove_node(temp_node)

        return G

    # ---------------------------------------------------
    # REMOVE SELF RELATIONSHIP
    # ---------------------------------------------------
    def _remove_self_relationships(self, G: nx.DiGraph):

        self_edges = list(nx.selfloop_edges(G))

        if self_edges:
            G.remove_edges_from(self_edges)

        return G

    # ---------------------------------------------------
    # PUBLIC TRAVERSE
    # ---------------------------------------------------
    def traverse(self, etl_schema: str, schema: str, table: str, max_level: int):

        G = self.load_graph(etl_schema)
        root = f"{schema}.{table}"

        if root not in G:
            return {"nodes": [], "edges": [], "upstream": [], "downstream": []}

        upstream_nodes = self._collect_nodes(G, root, max_level, "upstream")
        downstream_nodes = self._collect_nodes(G, root, max_level, "downstream")

        sub_nodes = set([root])
        sub_nodes.update(upstream_nodes.keys())
        sub_nodes.update(downstream_nodes.keys())

        G_sub = G.subgraph(sub_nodes).copy()

        levels, run_levels = self._compute_levels(G_sub, root)

        # build node list
        nodes = []
        for node in G_sub.nodes():

            s, t = node.split(".")

            nodes.append(
                {
                    "id": node,
                    "schema": s,
                    "table": t,
                    "type": "table",
                    "level": levels.get(node, 0),
                    "run_level": run_levels.get(node, 0),
                }
            )

        # build edge list from graph
        edges = [
            {"from": u, "to": v, "job": d.get("job")}
            for u, v, d in G_sub.edges(data=True)
        ]

        # format upstream
        upstream = []
        for node, level in upstream_nodes.items():

            s, t = node.split(".")

            upstream.append(
                {
                    "schema": s,
                    "table": t,
                    "level": levels.get(node, level),
                    "run_level": run_levels.get(node, 0),
                }
            )

        # format downstream
        downstream = []
        for node, level in downstream_nodes.items():

            s, t = node.split(".")

            downstream.append(
                {
                    "schema": s,
                    "table": t,
                    "level": levels.get(node, level),
                    "run_level": run_levels.get(node, 0),
                }
            )

        return {
            "nodes": nodes,
            "edges": edges,
            "upstream": upstream,
            "downstream": downstream,
        }

    # ---------------------------------------------------
    # COLLECT NODES BY DIRECTION
    # ---------------------------------------------------
    def _collect_nodes(self, G, root, max_level, direction):

        visited = {}
        queue = deque([(root, 0)])

        while queue:

            current, level = queue.popleft()

            if level >= max_level:
                continue

            neighbors = (
                G.predecessors(current)
                if direction == "upstream"
                else G.successors(current)
            )

            for neighbor in neighbors:

                new_level = level + 1

                if new_level > max_level:
                    continue

                if neighbor in visited and visited[neighbor] >= new_level:
                    continue

                visited[neighbor] = new_level
                queue.append((neighbor, new_level))

        return visited

    # ---------------------------------------------------
    # COMPUTE LEVELS
    # ---------------------------------------------------
    def _compute_levels(self, G_sub: nx.DiGraph, root: str):

        if not nx.is_directed_acyclic_graph(G_sub):
            raise ValueError("Graph must be a DAG")

        # visual distance from root
        levels = nx.single_source_shortest_path_length(
            G_sub.to_undirected(),
            root
        )

        # true execution order (longest dependency chain)
        run_levels = {node: 0 for node in G_sub.nodes()}

        for node in nx.topological_sort(G_sub):

            parents = list(G_sub.predecessors(node))

            if parents:
                run_levels[node] = max(run_levels[p] + 1 for p in parents)

        return levels, run_levels
