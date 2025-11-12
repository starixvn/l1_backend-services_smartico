/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SIGNALR_HUB_URL: string;
  readonly VITE_USER_ID: string;
  readonly VITE_ENABLE_SIGNALR: string;
  readonly VITE_ENABLE_MOCK_DATA: string;
  readonly VITE_CACHE_TTL: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
