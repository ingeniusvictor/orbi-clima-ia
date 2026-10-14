/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OC22_ATMOSPHERIC_TRANSITIONS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
