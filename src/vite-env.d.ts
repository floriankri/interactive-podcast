/// <reference types="vite/client" />

interface ImportMetaEnv {
  // We keep this empty since we're not using env variables anymore
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
