---
name: Web Development
description: 웹 애플리케이션 개발을 위한 기본 스킬 가이드. HTML/CSS/JS 기반 정적 사이트부터 React/Next.js/Vite 기반 동적 앱까지 포괄합니다.
---

# Web Development Skill

## 기술 스택 (Technology Stack)

### 1. Core (기본)
- **HTML5**: 시맨틱 구조, SEO 최적화
- **CSS3**: Vanilla CSS, Flexbox, Grid, 반응형 디자인, 미디어 쿼리
- **JavaScript (ES6+)**: 모듈, async/await, DOM 조작

### 2. 프레임워크 (선택)
- **Vite**: 빠른 빌드 도구 (React, Vue, Vanilla JS 지원)
- **Next.js**: SSR/SSG, App Router, API Routes
- **React**: 컴포넌트 기반 UI 라이브러리

### 3. 스타일링
- **Vanilla CSS**: 기본 (추천)
- **TailwindCSS**: 사용자 요청 시에만 사용 (버전 확인 필수)
- **CSS Modules**: 컴포넌트 스코프 스타일링

### 4. 패키지 관리
- **npm**: Node.js 패키지 매니저
- **npx**: 일회성 스크립트 실행

---

## 프로젝트 초기화 방법

### 정적 웹사이트 (HTML/CSS/JS)
```bash
# 기본 파일 구조 생성
mkdir -p css js images
touch index.html css/style.css js/main.js
```

### Vite 프로젝트
```bash
# 먼저 옵션 확인
npx -y create-vite@latest --help
# 현재 디렉토리에 초기화
npx -y create-vite@latest ./ --template vanilla
npm install
npm run dev
```

### Next.js 프로젝트
```bash
# 먼저 옵션 확인
npx -y create-next-app@latest --help
# 현재 디렉토리에 초기화
npx -y create-next-app@latest ./ --use-npm
npm run dev
```

---

## 디자인 원칙

### 필수 요소
1. **모던 미학**: 그라디언트, 글래스모피즘, 다크 모드
2. **반응형**: 모바일 → 태블릿 → 데스크탑
3. **마이크로 애니메이션**: hover, transition, transform
4. **타이포그래피**: Google Fonts (Inter, Roboto, Outfit 등)
5. **컬러 팔레트**: HSL 기반 일관된 색상 체계

### 코드 품질
- 시맨틱 HTML (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`)
- BEM 네이밍 또는 CSS 변수 활용
- 모든 인터랙티브 요소에 고유 ID 부여
- `<h1>` 페이지당 1개, 제목 계층 구조 준수

---

## SEO 체크리스트
- [ ] `<title>` 태그 (각 페이지 고유)
- [ ] `<meta name="description">` 메타 설명
- [ ] Open Graph 태그 (`og:title`, `og:description`, `og:image`)
- [ ] 시맨틱 HTML5 요소 사용
- [ ] `alt` 속성 (모든 이미지)
- [ ] 모바일 뷰포트 메타 태그
- [ ] favicon 설정

---

## 개발 서버 실행
```bash
# 정적 사이트 (Python 간이 서버)
python3 -m http.server 8080

# Vite / Next.js
npm run dev
```

---

## 배포
- **정적 사이트**: GitHub Pages, Netlify, Vercel
- **Next.js**: Vercel (추천), Netlify
- **일반 Node.js**: Railway, Render, Fly.io

---

## 참고 자료
- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/)
- [Google Fonts](https://fonts.google.com/)
- [CSS Tricks](https://css-tricks.com/)
