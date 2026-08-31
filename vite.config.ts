import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Route components are code-split into `?tsr-split=component` virtual modules, which
  // Vite's dep scanner cannot crawl. Deps used only inside page components are therefore
  // invisible to it and would be discovered late, forcing a re-optimize + full reload.
  optimizeDeps: {
    include: [
      "@tanstack/react-form",
      "react-number-format",
      "zustand",
      "zustand/vanilla",
      "zustand/middleware",
      "@base-ui/react",
      "pretty-bytes",
    ],
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
