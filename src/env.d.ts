/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENTSTACK_API_KEY: string;
  readonly VITE_CONTENTSTACK_MANAGEMENT_TOKEN: string;
  [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
