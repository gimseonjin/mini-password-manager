/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // 추가 환경변수가 있다면 여기에 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
