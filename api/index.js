import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();

const GRAPH_URL = process.env.GRAPH_URL;

const fastify = Fastify({
  logger: true,
});

// Enable CORS
await fastify.register(cors, {
  origin: true,
});

// Route
fastify.get("/api/lineage/table", async (request, reply) => {
  const { etl, schema, table, level } = request.query;

  if (!etl || !schema || !table) {
    return reply.status(400).send({
      error: "etl, schema, and table are required",
    });
  }

  const maxLevel = level ? Number(level) : 10;

  try {
    const response = await fetch(
      `${GRAPH_URL}/graph/lineage?etl=${etl}&schema=${schema}&table=${table}&level=${maxLevel}`,
    );

    if (!response.ok) {
      const text = await response.text();
      return reply.status(response.status).send({
        error: "Graphworker error",
        detail: text,
      });
    }

    const data = await response.json();
    return reply.send(data);
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({
      error: "Graph service unavailable",
    });
  }
});

// Start server
try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
