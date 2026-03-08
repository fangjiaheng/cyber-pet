/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENCLAW_TOKEN?: string
  readonly VITE_OPENCLAW_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
