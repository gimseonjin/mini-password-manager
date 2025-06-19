# 미니 패스워드 매니저 - 클라이언트

React + TypeScript로 구축된 미니 패스워드 매니저의 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

- **사용자 인증**: 회원가입, 로그인, 로그아웃
- **JWT 토큰 관리**: 자동 토큰 갱신 및 세션 관리
- **반응형 UI**: 모던하고 직관적인 사용자 인터페이스
- **타입 안전성**: TypeScript로 개발된 완전한 타입 안전성

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript
- **상태 관리**: Context API + useReducer
- **라우팅**: React Router v6
- **스타일링**: Bootstrap 5
- **HTTP 클라이언트**: Fetch API
- **개발 도구**: Vite

## 📋 요구사항

- Node.js 16.x 이상
- npm 또는 yarn
- 실행 중인 백엔드 서버 (기본: http://localhost:3001)

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 백엔드 서버 URL
REACT_APP_API_URL=http://localhost:3001
```

### 3. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

## 🌐 API 연동

이 클라이언트는 다음 백엔드 API 엔드포인트와 통신합니다:

### 인증 API
- `POST /api/v1/user/register` - 사용자 회원가입
- `POST /api/v1/user/login` - 사용자 로그인  
- `POST /api/v1/user/refresh` - 토큰 갱신
- `GET /api/v1/user/me` - 현재 사용자 정보 조회

### 헬스 체크
- `GET /health` - 서버 상태 확인

## 📁 프로젝트 구조

```
src/
├── components/         # 재사용 가능한 UI 컴포넌트
│   ├── Header.tsx     # 헤더 컴포넌트
│   └── Sample.jsx     # 샘플 컴포넌트
├── pages/             # 페이지 컴포넌트
│   ├── HomePage.tsx   # 홈 페이지
│   └── LoginPage.tsx  # 로그인/회원가입 페이지
├── services/          # API 서비스
│   ├── api.js         # 기본 API 유틸리티
│   └── authService.ts # 인증 관련 API 서비스
├── context/           # Context API
│   └── AppContext.tsx # 전역 상태 관리
├── types/             # TypeScript 타입 정의
│   └── auth.ts        # 인증 관련 타입
├── hooks/             # 커스텀 훅
├── utils/             # 유틸리티 함수
├── styles/            # 글로벌 스타일
├── App.tsx            # 루트 컴포넌트
└── main.tsx          # 진입점
```

## 🔐 인증 시스템

### 토큰 관리
- **Access Token**: API 요청 시 사용되는 JWT 토큰
- **자동 갱신**: 토큰 만료 시 자동으로 갱신 시도
- **로컬 스토리지**: 토큰을 브라우저 로컬 스토리지에 안전하게 저장

### 보안 기능
- JWT Bearer 토큰 인증
- 자동 토큰 만료 처리
- 안전한 로그아웃 (토큰 완전 제거)
- 세션 복원 (페이지 새로고침 시)

## 🎨 UI/UX 특징

- **모던 디자인**: 그라디언트와 블러 효과를 활용한 현대적 디자인
- **반응형**: 모바일, 태블릿, 데스크톱 모든 디바이스 지원
- **인터랙티브**: 호버 효과와 부드러운 트랜지션
- **사용자 친화적**: 직관적인 로그인/회원가입 탭 전환
- **에러 처리**: 명확한 에러 메시지와 로딩 상태 표시

## 🔄 상태 관리

Context API와 useReducer를 사용한 중앙집중식 상태 관리:

```typescript
interface AppState {
  user: AuthUser | null      // 현재 로그인한 사용자
  theme: 'light' | 'dark'   // 테마 설정
  loading: boolean          // 로딩 상태
  error: string | null      // 에러 메시지
}
```

## 🚨 에러 처리

- **네트워크 에러**: 연결 실패 시 사용자 친화적 메시지
- **인증 에러**: 잘못된 자격 증명에 대한 명확한 피드백
- **폼 검증**: 클라이언트 사이드 입력 검증
- **서버 에러**: HTTP 상태 코드별 적절한 에러 메시지

## 🧪 개발 가이드

### 새로운 컴포넌트 추가
1. `src/components/` 폴더에 `.tsx` 파일 생성
2. TypeScript 인터페이스로 props 타입 정의
3. React.memo()를 활용한 성능 최적화 고려

### API 서비스 확장
1. `src/types/` 에서 필요한 타입 정의
2. `src/services/` 에서 API 함수 구현
3. 에러 처리 및 타입 안전성 보장

### 상태 관리 확장
1. `AppContext.tsx`에서 새로운 action 타입 추가
2. reducer 함수에 새로운 케이스 추가
3. 컴포넌트에서 dispatch 사용

## 📝 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 배포 전 확인사항
- [ ] 환경 변수 설정 확인
- [ ] API 엔드포인트 URL 검증
- [ ] HTTPS 설정 (프로덕션 환경)
- [ ] CORS 정책 확인

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
