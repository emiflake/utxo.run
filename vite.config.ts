import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
import tailwindcss from "@tailwindcss/vite";

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

    host: "0.0.0.0",
  },
});
