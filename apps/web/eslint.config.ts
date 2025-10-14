import { fileURLToPath } from "node:url"
import { includeIgnoreFile } from "@eslint/compat"
import eslint from "@eslint/js"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"

const localGitignorePath = fileURLToPath(
  new URL("./.gitignore", import.meta.url),
)
const rootGitignorePath = fileURLToPath(
  new URL("../../.gitignore", import.meta.url),
)

export default defineConfig([
  includeIgnoreFile(localGitignorePath, "Imported local .gitignore patterns"),
  includeIgnoreFile(rootGitignorePath, "Imported root .gitignore patterns"),
  eslint.configs.recommended,
  tseslint.configs.strict,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
])
