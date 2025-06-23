# 미니 패스워드 매니저 - 클라이언트

## 🔐 보안 우선 비밀번호 관리 툴

미니 패스워드 매니저는 **클라이언트 측 암호화**를 통해 서버가 사용자의 비밀번호를 알 수 없도록 설계된 보안 우선 비밀번호 관리 도구입니다.

## ✨ 주요 기능

### 🛡️ 클라이언트 측 암호화
- 모든 비밀번호는 사용자의 기기에서만 암호화/복호화됩니다
- 서버는 암호화된 데이터만 저장하며, 암호화 키에 접근할 수 없습니다
- 완전한 Zero-Knowledge 아키텍처

### 👤 사용자별 키 격리
- 각 사용자마다 고유한 암호화 키 사용
- 계정 간 완전한 격리로 보안성 강화
- 로그아웃 시 해당 사용자의 키 자동 삭제

### 📱 멀티 디바이스 지원
- QR 코드를 통한 간편한 키 동기화
- 백업 파일 다운로드로 키 복원 가능
- 새 기기에서 기존 키 가져오기 지원

### 🔄 키 라이프사이클 관리
- 최초 로그인 시 자동 키 설정 가이드
- 키 재생성 및 백업 기능
- 안전한 키 가져오기/내보내기

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

## 🔐 보안 아키텍처

### 1. 사용자별 키 관리

```typescript
// 사용자별 고유 키 생성
const userKey = generateAndSaveUserSecretKey(userId)

// 사용자별 키 저장 (localStorage)
const storageKey = `secretKey_user_${userId}`
localStorage.setItem(storageKey, userKey)
```

### 2. 키 설정 플로우

1. **로그인 완료** → 키 존재 여부 확인
2. **키 없음** → KeySetupPage로 자동 이동
3. **새 키 생성** 또는 **기존 키 가져오기** 선택
4. **백업 파일 자동 다운로드** (새 키 생성 시)
5. **키 설정 완료** → 메인 앱 사용 가능

### 3. 키 백업 및 복원

#### 백업 파일 형식
```
미니 패스워드 매니저 - 백업 정보

사용자 ID: user123
사용자 이메일: user@example.com
생성일: 2024-01-01 12:00:00

비밀키: [64자리 암호화 키]

QR 코드 데이터: {"type":"mini-password-manager","version":"1.0","userId":"user123","secretKey":"...","timestamp":1640995200000}

⚠️ 중요: 이 정보를 안전한 곳에 보관하세요.
```

#### QR 코드 데이터 구조
```json
{
  "type": "mini-password-manager",
  "version": "1.0",
  "userId": "user123",
  "secretKey": "[암호화키]",
  "timestamp": 1640995200000
}
```

## 🛠️ 주요 컴포넌트

### KeySetupPage
- 최초 키 설정을 위한 전용 페이지
- 새 키 생성 또는 기존 키 가져오기 선택
- 자동 백업 파일 다운로드
- 단계별 안내 및 오류 처리

### SettingsPage
- 키 관리 및 설정 페이지
- QR 코드 생성 및 표시
- 백업 파일 다운로드
- 키 재생성 (경고 포함)

### AuthService
- 로그아웃 시 사용자별 키 자동 삭제
- 토큰 및 캐시 관리
- 사용자 인증 상태 관리

### SettingsService
- 사용자별 키 생성, 저장, 로드
- QR 코드 데이터 생성 및 파싱
- PDF 백업 데이터 생성
- 키 마스킹 및 보안 함수들

## 📊 보안 특징

### Zero-Knowledge 아키텍처
- 서버는 사용자의 암호화 키를 절대 알 수 없음
- 모든 암호화/복호화는 클라이언트에서만 수행
- 서버는 암호화된 데이터만 저장

### 사용자 격리
- 각 사용자마다 독립적인 암호화 키
- 계정 전환 시 이전 사용자의 키 자동 삭제
- 크로스 사용자 데이터 접근 불가

### 키 보안
- 64자리 랜덤 키 생성
- 안전한 로컬 스토리지 저장
- 키 분실 시를 대비한 백업 시스템

## 🔄 업그레이드 가이드

### 기존 사용자 (레거시 키 → 사용자별 키)

기존의 전역 `secretKey`를 사용하던 사용자들은 다음과 같이 마이그레이션됩니다:

1. **자동 감지**: 로그인 시 사용자별 키 존재 여부 확인
2. **키 설정 페이지**: 키가 없으면 KeySetupPage로 자동 이동
3. **선택 옵션**:
   - 새 키 생성 (기존 데이터 손실 가능성 안내)
   - 기존 키 가져오기 (백업 파일 또는 QR 코드 사용)

### 개발자 가이드

#### 레거시 함수 사용 중단
```typescript
// ❌ 사용 중단 예정
loadSecretKey()
saveSecretKey(key)
refreshSecretKey()
removeSecretKey()
hasSecretKey()

// ✅ 새로운 함수 사용
loadUserSecretKey(userId)
saveUserSecretKey(userId, key)
generateAndSaveUserSecretKey(userId)
removeUserSecretKey(userId)
hasUserSecretKey(userId)
```

## 🚨 중요 보안 알림

### 사용자에게 안내사항
1. **백업 파일 보관**: 암호화 키 백업 파일을 안전한 곳에 보관하세요
2. **키 분실 주의**: 키를 분실하면 암호화된 데이터를 복구할 수 없습니다
3. **QR 코드 보안**: QR 코드 데이터를 타인과 공유하지 마세요
4. **정기적 백업**: 새 기기 추가 시 백업 파일을 업데이트하세요

### 개발자 주의사항
1. **키 검증**: QR 코드 가져오기 시 사용자 ID 검증 필수
2. **에러 처리**: 키 관련 모든 작업에 적절한 에러 처리 구현
3. **로그 보안**: 키 값이 로그에 노출되지 않도록 주의
4. **메모리 관리**: 키 사용 후 메모리에서 안전하게 제거

## 📋 TODO

- [ ] QR 코드 스캐너 라이브러리 통합
- [ ] jsPDF를 사용한 실제 PDF 백업 파일 생성
- [ ] 키 강도 검증 및 향상
- [ ] 오프라인 키 백업 옵션
- [ ] 키 만료 및 자동 갱신 기능

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙋‍♂️ 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해 주세요.
