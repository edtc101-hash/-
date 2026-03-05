# CLAUDE.md

## Design Philosophy

이 프로젝트는 **초보자도 쉽게 사용할 수 있는 것을 최우선**으로 한다.
- 설치부터 실행까지 최소 단계
- 에러 메시지는 원인과 해결 방법을 함께 제시
- CLI 옵션은 최소한으로, 기본값으로 바로 동작
- YAML 스펙 작성이 직관적이어야 함

## Quick Install

AI 에이전트가 "설치해줘" 요청을 받으면:

```bash
git clone https://github.com/devswha/cardnews.git
cd cardnews
npm install
```

설치 확인:
```bash
node render.js examples/hello.yaml
# → output/hello/ 에 PNG 생성
```

글로벌 CLI:
```bash
npm link
cardnews examples/hello.yaml
```

Linux에서 Chromium 의존성 에러 발생 시:
```bash
sudo apt-get install -y libgbm1 libnss3 libatk-bridge2.0-0
```

## Project Overview

YAML 스펙을 인스타그램/쓰레드용 카드뉴스 PNG 이미지(1080x1350 @2x)로 변환하는 Node.js CLI 도구.

```
YAML spec → parser.js → template-engine.js (Handlebars) → renderer.js (Puppeteer) → PNG
```

## Tech Stack

- **Runtime**: Node.js (CommonJS modules)
- **Dependencies**: handlebars, js-yaml, puppeteer
- **No build step**: 트랜스파일/번들러 없음, 소스 직접 실행
- **No tests/lint**: 테스트 프레임워크, ESLint, Prettier 없음

## Commands

```bash
# 렌더링
node render.js <yaml-path> [--slide N] [--theme NAME]

# 예시
node render.js examples/hello.yaml
node render.js examples/hello.yaml --theme 8bit
node render.js examples/hello.yaml --slide 2

# 글로벌 CLI
npm link && cardnews examples/hello.yaml
```

출력: `output/{slug}/01.png ~ NN.png`

## Project Structure

```
render.js                  # CLI 엔트리포인트 (args 파싱 → 파이프라인 실행)
src/
  parser.js                # YAML 파싱 + 정규화 (meta, slides)
  template-engine.js       # Handlebars 템플릿 로드 + 렌더링
  renderer.js              # Puppeteer 스크린샷 (1080x1350 @2x)
  blocks/
    index.js               # 블록 레지스트리 (type string → renderer function)
    _utils.js              # 공용 유틸 (escapeHtml, nl2br, highlightWord, clampPercent)
    {block-name}.js        # 12개 블록 렌더러
templates/
  base.html                # HTML wrapper (styles + content 주입)
  cover.html               # 커버 슬라이드
  content.html             # 콘텐츠 슬라이드 (cover/closing 외 전부)
  closing.html             # 클로징 슬라이드
styles/
  tokens.css               # 디자인 토큰 (CSS 변수 46개)
  base.css                 # 글로벌 스타일 + 슬라이드 레이아웃
  layouts.css              # (deprecated, base.css로 이동됨)
  components.css           # 블록 컴포넌트 스타일 (14개)
  themes/
    8bit.css               # 8bit 레트로 테마
examples/
  hello.yaml               # 예제 스펙
```

## Code Conventions

### Naming

| 대상 | 규칙 | 예시 |
|------|------|------|
| JS 변수/함수 | camelCase | `parseSpec`, `renderBlock` |
| JS 파일명 | kebab-case | `template-engine.js`, `before-after.js` |
| CSS 클래스 | BEM-like kebab-case | `.terminal-block`, `.card-item`, `.text-block--muted` |
| YAML 필드 | snake_case | `total_slides`, `highlight_word` |

### Code Style

- CommonJS (`require` / `module.exports`)
- 2 spaces 인덴트
- 더블 쿼트 `"`
- 세미콜론 항상 사용
- 템플릿 리터럴로 HTML 생성

### Error Handling

- 함수 파라미터에 기본값: `function(block = {})`
- `toStringOrDefault()`, `toOptionalNumber()`으로 안전한 타입 변환
- 에러 메시지에 슬라이드 번호, 블록 인덱스, 블록 타입 포함

## Block System (12 types)

모든 블록은 동일한 패턴을 따름:

```javascript
const { escapeHtml, nl2br } = require("./_utils");

module.exports = function renderMyBlock(block = {}) {
  const title = escapeHtml(block.title || "");
  const items = Array.isArray(block.items) ? block.items : [];
  // ... HTML 생성
  return `<div class="my-block">...</div>`;
};
```

### 블록 타입 목록

card-list, terminal-block, code-editor, before-after, step-list, tip-box, info-box, highlight-banner, table, progress-bar, bar-list, text

### 새 블록 추가 절차

1. `src/blocks/{block-name}.js` 생성 (위 패턴 준수)
2. `src/blocks/index.js`의 registry에 등록
3. `styles/components.css`에 CSS 추가 (섹션 구분자 포함)
4. `README.md`에 YAML 사용법 문서화

### 블록 개발 규칙

- `_utils.js`의 `escapeHtml`로 모든 사용자 입력 이스케이프 (XSS 방지)
- 배열 필드는 `Array.isArray()` 체크
- 누락 필드에 기본값 제공
- 순수 HTML 문자열 반환 (부작용 없음)

## CSS Architecture

4-레이어 캐스케이드:

```
tokens.css (변수 정의) → base.css (레이아웃) → components.css (블록 스타일)
```

### Design Tokens (tokens.css)

| 카테고리 | 패턴 | 예시 |
|----------|------|------|
| 색상-팔레트 | `--color-{name}` | `--color-primary: #B8FF01` |
| 색상-배경 | `--color-bg-{layer}` | `canvas < surface < elevated` |
| 색상-텍스트 | `--color-text-{role}` | `primary, body, muted, accent` |
| 간격 | `--space-{size}` | `xs, sm, md, lg, xl, 2xl` |
| 모서리 | `--radius-{size}` | `sm, md, lg, xl, full` |
| 그림자 | `--shadow-{type}` | `card, glow, subtle` |

- 컴포넌트에서 하드코딩 금지, 토큰만 사용
- 예외: 폰트 사이즈는 컴포넌트별 하드코딩 (컨텍스트별 제어)

### Theme System

테마 = `tokens.css`의 CSS 변수를 오버라이드하는 CSS 파일.

```bash
# 새 테마 추가
cp styles/themes/8bit.css styles/themes/my-theme.css
# :root 변수 수정 후
node render.js spec.yaml --theme my-theme
```

## Template System

### 레이아웃 라우팅

| layout 값 | 템플릿 |
|-----------|--------|
| `cover` | cover.html |
| `closing` | closing.html |
| 그 외 전부 | content.html |

### Handlebars 컨텍스트

```
{{meta.title}}        메타 정보 (escaped)
{{slide.title}}       슬라이드 정보 (escaped)
{{page_label}}        페이지 번호 "02 / 07"
{{{blocks_html}}}     렌더링된 블록 HTML (unescaped, triple-brace)
{{{styles_css}}}      CSS 문자열 (unescaped)
```

## YAML Spec 구조

```yaml
meta:
  title: "제목"
  subtitle: "부제목"
  series: "시리즈명"
  tag: "태그"
  author: "작성자"
  author_handle: "@handle"
  total_slides: 7
  created_at: "2026-02-24"

slides:
  - slide: 1
    layout: cover        # cover | content류 | closing
    title: "슬라이드 제목"
    subtitle: "부제"
    blocks:
      - type: terminal-block
        title: "Terminal"
        lines:
          - type: command
            text: "> echo hello"
```
