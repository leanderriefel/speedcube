import { defineConfig, type PluginOption } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const forceEsWorkerFormat: PluginOption = {
  name: "force-es-worker-format",
  enforce: "post",
  config: () => ({
    worker: {
      format: "es",
    },
  }),
  configResolved(resolvedConfig) {
    resolvedConfig.worker.format = "es"
  },
}

export default defineConfig({
  worker: {
    format: "es",
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ["cubing"],
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    nitro({
      config: {
        preset: "vercel",
      },
    }),
    react(),
    tailwindcss(),
    forceEsWorkerFormat,
  ],
})
