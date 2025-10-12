import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

const srcDir = fileURLToPath(new URL("./src", import.meta.url))

export default defineConfig({
  server: {
    port: 3000,
  },
  experimental: {
    enableNativePlugin: true,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "~": resolve(srcDir),
    },
  },
  optimizeDeps: {
    exclude: ["cubing"],
  },
  plugins: [tanstackStart(), react(), tailwindcss()],
})
