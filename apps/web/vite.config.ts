import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  server: {
    port: 3000,
  },
  experimental: {
    enableNativePlugin: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ["cubing"],
  },
  plugins: [tanstackStart(), react(), tailwindcss()],
})
