import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
import tailwindcss from "@tailwindcss/vite";
import process from "process";
import dotenv from "dotenv";
dotenv.config();

for (const k of ['VITE_BETTERFROST_URL', 'VITE_OGMIOS_URL']) {
  if (!process.env[k]) {
    throw new Error(`Missing environment variable: ${k}`);
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [wasm(), react(), tailwindcss()],
  build: {
    target: "esnext",
  },
  server: {
    watch: {
      ignored: ["**/.direnv/**"],
    },
    cors: true,
    proxy: {
      '/betterfrost': {
        target: process.env.VITE_BETTERFROST_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/betterfrost/, ""),
      },
      '/ogmios': {
        target: process.env.VITE_OGMIOS_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ogmios/, ""),
      },
    },

    host: "0.0.0.0",
  },
});
