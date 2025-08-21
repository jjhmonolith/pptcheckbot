# PPT 맞춤법 검사기

PowerPoint 교재를 자동으로 교정하는 AI 기반 웹 애플리케이션

## 🚀 기능

- 🔐 패스워드 기반 보안 인증
- 📄 PowerPoint(.pptx) 파일 업로드
- 🤖 AI 기반 맞춤법 검사 
- ✏️ 오류 선택적 수정
- 📥 수정된 파일 자동 다운로드

## 💻 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Framer Motion, Lucide React
- **API**: Next.js API Routes
- **AI**: OpenAI ChatGPT API
- **배포**: Vercel

## 🔧 설치 및 실행

### 1. 클론 및 의존성 설치

```bash
git clone https://github.com/jjhmonolith/pptcheckbot.git
cd pptcheckbot
npm install
```

### 2. 환경변수 설정

`.env.local` 파일 생성:

```bash
# 앱 접속 패스워드
APP_PASSWORD=ppt2025

# OpenAI API 키
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 로컬 실행

```bash
npm run dev
```

http://localhost:3000 에서 접속

## 🌐 Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jjhmonolith/pptcheckbot)

### 배포 시 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정하세요:

- `APP_PASSWORD`: 앱 접속용 패스워드
- `OPENAI_API_KEY`: OpenAI API 키

## 📖 사용법

1. 설정된 패스워드로 로그인
2. `.pptx` 파일 업로드 (최대 5MB)
3. 맞춤법 검사 시작
4. 발견된 오류 확인 및 선택
5. 수정된 파일 다운로드

## 🛠️ 개발

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린트
npm run lint
```

## 📝 라이선스

MIT License

---

🤖 Generated with [Claude Code](https://claude.ai/code)
