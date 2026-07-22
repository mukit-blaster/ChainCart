import http from "node:http";
import { buildApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { initSocket } from "./realtime/socket";

const app = buildApp();
const server = http.createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  logger.info(`API ready on :${env.PORT}`);
});

const shutdown = (signal: string) => () => {
  logger.info(`${signal} received — shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", shutdown("SIGTERM"));
process.on("SIGINT", shutdown("SIGINT"));
