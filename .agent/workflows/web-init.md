---
description: 새로운 웹 프로젝트를 초기화하는 워크플로우
---

# 웹 프로젝트 초기화

## 1. 프로젝트 타입 결정
사용자에게 프로젝트 타입을 확인:
- **정적 사이트** (HTML/CSS/JS) → 2a 진행
- **Vite 앱** (React/Vue/Vanilla) → 2b 진행
- **Next.js 앱** → 2c 진행

## 2a. 정적 사이트 초기화
// turbo
```bash
mkdir -p css js images
touch index.html css/style.css js/main.js
```
- `index.html`에 기본 HTML5 보일러플레이트 작성
- `css/style.css`에 CSS 리셋 및 디자인 토큰(CSS 변수) 설정
- Google Fonts CDN 링크 추가

## 2b. Vite 프로젝트 초기화
// turbo
```bash
npx -y create-vite@latest --help
```
// turbo
```bash
npx -y create-vite@latest ./ --template vanilla
npm install
```

## 2c. Next.js 프로젝트 초기화
// turbo
```bash
npx -y create-next-app@latest --help
```
// turbo
```bash
npx -y create-next-app@latest ./ --use-npm
```

## 3. Git 커밋
// turbo
```bash
git add -A && git commit -m "Initial project setup"
```

## 4. 개발 서버 실행
```bash
npm run dev
```
또는 정적 사이트:
```bash
python3 -m http.server 8080
```
