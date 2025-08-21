# PPT 맞춤법 검사기 배포 가이드

## 🚀 Vercel 배포 방법

### 1. 준비사항
- GitHub 계정
- Vercel 계정 (GitHub 연동)
- OpenAI API 키

### 2. 배포 단계

#### Step 1: 코드를 GitHub에 업로드
```bash
git init
git add .
git commit -m "Initial commit: PPT 맞춤법 검사기"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

#### Step 2: Vercel에서 프로젝트 임포트
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "New Project" 클릭
3. GitHub 레포지토리 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Step 3: 환경 변수 설정
Vercel 프로젝트 설정에서 다음 환경 변수 추가:

```
OPENAI_API_KEY = your_openai_api_key_here
APP_PASSWORD = ppt2025
```

#### Step 4: 배포
- "Deploy" 버튼 클릭
- 자동으로 빌드 및 배포 진행

### 3. 도메인 설정 (선택사항)
- Vercel Dashboard → Settings → Domains
- 커스텀 도메인 추가 가능

## 🔧 로컬 개발 환경 설정

### 1. 의존성 설치
```bash
# 프론트엔드
npm install

# 백엔드 (개발용)
cd api
pip install -r requirements.txt
```

### 2. 환경 변수 설정
`.env.local` 파일 생성:
```
OPENAI_API_KEY=your_openai_api_key_here
APP_PASSWORD=ppt2025
```

### 3. 개발 서버 실행
```bash
# 프론트엔드만 (프로덕션 환경)
npm run dev

# 백엔드 포함 (개발 환경)
# Terminal 1: 프론트엔드
npm run dev

# Terminal 2: 백엔드
cd api
uvicorn main:app --reload --port 8000
```

## 📝 사용법

### 1. 애플리케이션 접속
- 배포된 URL 또는 `http://localhost:3000` 접속

### 2. 인증
- 기본 암호: `ppt2025`
- 환경 변수 `APP_PASSWORD`로 변경 가능

### 3. 파일 업로드 및 검사
1. PowerPoint 파일(.pptx) 업로드 (최대 50MB)
2. "맞춤법 검사 시작" 클릭
3. 검사 결과 확인 및 수정할 오류 선택
4. "수정 후 다운로드" 클릭

## ⚠️ 주의사항

### 보안
- OpenAI API 키를 안전하게 보관
- 앱 암호를 정기적으로 변경
- HTTPS 사용 권장

### 제한사항
- 파일 크기: 최대 50MB
- 지원 형식: .pptx만 지원
- 임시 파일은 30분 후 자동 삭제

### 성능
- 큰 파일의 경우 처리 시간이 오래 걸릴 수 있음
- OpenAI API 사용량에 따른 요금 발생

## 🛠️ 문제 해결

### 일반적인 오류

#### "파일 업로드 실패"
- 파일 크기 50MB 이하 확인
- .pptx 형식 확인
- 인터넷 연결 확인

#### "맞춤법 검사 실패"
- OpenAI API 키 확인
- API 사용량 한도 확인

#### "다운로드 실패"
- 브라우저 팝업 차단 해제
- 다운로드 권한 확인

### 로그 확인
- Vercel Dashboard → Functions → 로그 확인
- 개발 환경: 브라우저 개발자 도구 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 환경 변수 설정
2. API 키 유효성
3. 파일 형식 및 크기
4. 브라우저 호환성

---

🎉 **배포 완료!** 이제 PowerPoint 맞춤법 검사기를 사용할 수 있습니다.