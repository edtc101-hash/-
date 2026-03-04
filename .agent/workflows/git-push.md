---
description: 코드를 GitHub에 푸시하는 워크플로우
---

# GitHub 푸시

## 1. 변경사항 확인
// turbo
```bash
git status
```

## 2. 스테이징 및 커밋
```bash
git add -A && git commit -m "커밋 메시지"
```
- 커밋 메시지는 변경 내용을 간결하게 설명

## 3. 푸시
// turbo
```bash
git push origin main
```

## 4. 확인
// turbo
```bash
git log -1 --oneline
```
