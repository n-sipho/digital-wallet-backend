import http from "node:http";
import dotenv from "dotenv";
dotenv.config();
import ngrok from "@ngrok/ngrok";
import { logger } from "./src/utils/logger";

const TARGET_PORT = 3000;
const PROXY_PORT = 3005;

// 1. Create a logging reverse proxy that intercepts and logs HTTP traffic
const proxyServer = http.createServer((req, res) => {
  const start = Date.now();
  logger.info(
    { method: req.method, url: req.url },
    `--> [INCOMING] ${req.method} ${req.url}`,
  );

  const forwardReq = http.request(
    {
      hostname: "127.0.0.1",
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: "cloud-nine-wallet-backend", // Preserves host header for Rafiki
      },
    },
    (targetRes) => {
      const duration = Date.now() - start;
      logger.info(
        {
          method: req.method,
          url: req.url,
          status: targetRes.statusCode,
          duration: `${duration}ms`,
        },
        `<-- [RESPONSE] ${req.method} ${req.url} ${targetRes.statusCode} (${duration}ms)`,
      );

      res.writeHead(targetRes.statusCode || 500, targetRes.headers);
      targetRes.pipe(res);
    },
  );

  forwardReq.on("error", (err) => {
    logger.error(
      { err, url: req.url },
      `Failed to forward request to port ${TARGET_PORT}`,
    );
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad Gateway" }));
  });

  req.pipe(forwardReq);
});

// 2. Start ngrok pointing to the logging proxy
(async function startTunnel() {
  proxyServer.listen(PROXY_PORT, async () => {
    try {
      const listener = await ngrok.forward({
        addr: PROXY_PORT, // ngrok now forwards to our logging proxy first
        authtoken_from_env: true,
        domain: process.env.NGROK_DOMAIN,
        onStatusChange: (status) => {
          logger.info(`[ngrok] Status: ${status}`);
        },
      });

      logger.info(
        `Ingress established at ${listener.url()} -> forwarding to :${TARGET_PORT}`,
      );
    } catch (error) {
      logger.error({ err: error }, "[ngrok] Failed to establish tunnel");
      process.exit(1);
    }
  });
})();

// Graceful shutdown
const handleShutdown = async () => {
  logger.info("Closing proxy and ngrok tunnel...");
  proxyServer.close();
  await ngrok.disconnect();
  await ngrok.kill();
  process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
