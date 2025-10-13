import { defineConfig } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  server: {
    port: 3000,
  },
  experimental: {
    enableNativePlugin: true,
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
  ],
})
