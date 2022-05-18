/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_CORE_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
