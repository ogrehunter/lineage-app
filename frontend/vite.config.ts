import { defineConfig, loadEnv } from "vite";
import type { ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig((configEnv: ConfigEnv) => {
  const env = loadEnv(configEnv.mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: true,
      },
      proxy: {
        "/api": {
          target: env.VITE_DEV_API_TARGET,
          changeOrigin: true,
        },
      },
    },
  };
});
