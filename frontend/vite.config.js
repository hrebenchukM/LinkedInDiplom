import path from "node:path";
import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mockAuthStub = path.resolve(__dirname, "src/features/auth/mockAuthApi.stub.js");
const agentDebugLogPath = path.resolve(__dirname, "..", "debug-306ecf.log");

function agentDebugLogPlugin() {
  return {
    name: "agent-debug-log",
    configureServer(server) {
      server.middlewares.use("/__agent_debug/log", (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const line = body.trim();
            if (line) {
              appendFileSync(agentDebugLogPath, `${line}\n`);
            }
            res.statusCode = 204;
            res.end();
          } catch {
            res.statusCode = 500;
            res.end();
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || "http://localhost:5000";
  const isProductionBuild = mode === "production";

  return {
    plugins: [react(), agentDebugLogPlugin()],
    resolve: {
      alias: isProductionBuild
        ? [{ find: /\/mockAuthApi\.js$/, replacement: mockAuthStub }]
        : [],
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/hubs": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
