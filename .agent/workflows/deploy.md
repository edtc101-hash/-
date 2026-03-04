---
description: 웹사이트를 GitHub Pages로 배포하는 워크플로우
---

# GitHub Pages 배포

## 1. 배포 준비
프로젝트 루트에 정적 파일(`index.html`)이 있는지 확인

## 2. GitHub Pages 활성화
GitHub 저장소 → Settings → Pages → Source를 `main` 브랜치로 설정

## 3. 최신 코드 푸시
// turbo
```bash
git add -A && git commit -m "Deploy to GitHub Pages" && git push origin main
```

## 4. 배포 확인
배포 URL: `https://<username>.github.io/<repo-name>/`
- 예: `https://edtc101-hash.github.io/-/`
- 배포까지 1~2분 소요될 수 있음
