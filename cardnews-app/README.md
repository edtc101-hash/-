# cardnews

YAML 스펙 하나로 인스타그램/쓰레드용 카드뉴스 이미지(1080x1350 @2x)를 생성하는 CLI 도구.

```
YAML spec → render.js (Handlebars + Puppeteer) → PNG images
```

## Quick Start

```bash
# 설치
git clone https://github.com/calvin-kim/cardnews.git
cd cardnews
npm install

# 렌더링
node render.js examples/hello.yaml

# 테마 적용
node render.js examples/hello.yaml --theme 8bit

# 특정 슬라이드만
node render.js examples/hello.yaml --slide 2
```

출력: `output/{slug}/01.png ~ NN.png`

## 글로벌 CLI 설치

```bash
npm link
cardnews examples/hello.yaml
```

## YAML 스펙 작성법

### 기본 구조

```yaml
meta:
  title: "제목"
  subtitle: "부제목"
  series: "시리즈명"
  tag: "태그"
  total_slides: 7
  created_at: "2026-02-24"

slides:
  - slide: 1
    layout: cover
    title: "커버 제목"
    subtitle: "커버 부제"

  - slide: 2
    layout: howto
    title: "슬라이드 제목"
    subtitle: "슬라이드 부제"
    blocks:
      - type: terminal-block
        title: "Terminal"
        lines:
          - type: command
            text: "> echo hello"
```

### 레이아웃

| 레이아웃 | 용도 | 템플릿 |
|---------|------|--------|
| `cover` | 커버 (제목+부제) | cover.html |
| `problem` | 문제 제기 | content.html |
| `explanation` | 개념 설명 | content.html |
| `solution` | 솔루션 소개 | content.html |
| `howto` | 사용법, 명령어 | content.html |
| `comparison` | 비교 | content.html |
| `advanced` | 고급 팁 | content.html |
| `workflow` | 실전 루틴 | content.html |
| `closing` | 요약/마무리 | closing.html |

cover, closing 외 모든 레이아웃은 content.html을 사용한다.

### 블록 타입 (12종)

#### card-list — 이모지 카드 목록

```yaml
- type: card-list
  items:
    - emoji: "😱"
      title: "카드 제목"
      description: "설명 텍스트\n줄바꿈 가능"
      highlight_word: "강조 단어"  # 선택
```

#### terminal-block — 터미널 코드

```yaml
- type: terminal-block
  title: "Terminal"
  lines:
    - type: comment
      text: "# 주석 텍스트"
    - type: command
      text: "> npm install"
      highlight: "install"  # 선택
    - type: output
      text: "출력 결과"
```

#### code-editor — 코드 에디터

```yaml
- type: code-editor
  title: "config.yaml"
  lines:
    - type: comment
      text: "# 설정 파일"
    - type: code
      text: "key: value"
    - type: list-item
      text: "- 목록 항목"
      indent: 0
```

#### before-after — 전후 비교

```yaml
- type: before-after
  before:
    emoji: "❌"
    title: "Before"
    description: "설명"
  after:
    emoji: "✅"
    title: "After"
    description: "설명"
```

#### step-list — 번호 스텝

```yaml
- type: step-list
  items:
    - step: 1
      emoji: "🚀"
      title: "스텝 제목"
      description: "설명"
      code: "실행 명령어"  # 선택
```

#### tip-box — 팁 박스

```yaml
- type: tip-box
  label: "Tip"
  content: "팁 내용"
  highlight_word: "강조"  # 선택
```

#### info-box — 정보 박스

```yaml
- type: info-box
  title: "정보 제목"
  content: "설명 텍스트"
  highlight_word: "강조"  # 선택
```

#### highlight-banner — 강조 배너

```yaml
- type: highlight-banner
  content: "핵심 메시지"
  bold_part: "볼드 처리할 부분"
  inline_code: "/compact"  # 선택
```

#### table — 비교 테이블

```yaml
- type: table
  columns:
    - header: ""
    - header: "열1"
    - header: "열2"
  rows:
    - label: "행1"
      cells:
        - text: "셀1"
        - text: "셀2"
```

#### progress-bar — 프로그레스 바

```yaml
- type: progress-bar
  label: "사용량"
  value: 87
  display_text: "87%"
```

#### bar-list — 막대 목록

```yaml
- type: bar-list
  items:
    - label: "항목"
      ratio: 80
```

#### text — 텍스트 블록

```yaml
- type: text
  content: "텍스트 내용"
  style: normal  # normal | muted | accent
```

## 테마 시스템

기본 테마는 다크 + 라임 액센트. `--theme` 옵션으로 테마를 교체할 수 있다.

```bash
node render.js spec.yaml --theme 8bit
```

### 테마 만들기

`styles/themes/` 폴더에 CSS 파일을 추가하면 된다. `styles/tokens.css`의 CSS 변수를 오버라이드하는 방식.

```css
/* styles/themes/my-theme.css */
:root {
  --color-primary: #FF6B6B;
  --color-bg-canvas: #1a1a2e;
  /* ... */
}
```

사용:
```bash
node render.js spec.yaml --theme my-theme
```

### 기본 디자인 토큰

| 토큰 | 기본값 | 용도 |
|------|--------|------|
| `--color-primary` | `#B8FF01` (라임) | 강조, 액센트 |
| `--color-bg-canvas` | `#121212` | 슬라이드 배경 |
| `--color-bg-surface` | `#1E1E1E` | 콘텐츠 카드 배경 |
| `--color-bg-elevated` | `#2A2A2A` | 카드, 팁박스 등 |
| `--color-text-primary` | `#FFFFFF` | 제목, 강조 텍스트 |
| `--color-text-body` | `#E0E0E0` | 본문 텍스트 |
| `--color-text-muted` | `#888888` | 부제, 보조 텍스트 |

## 프로젝트 구조

```
cardnews/
├── render.js               # CLI 엔트리포인트
├── src/
│   ├── parser.js           # YAML 파싱
│   ├── template-engine.js  # Handlebars 템플릿 엔진
│   ├── renderer.js         # Puppeteer 스크린샷
│   └── blocks/             # 블록별 HTML 생성기 (12종)
├── templates/
│   ├── base.html           # HTML 래퍼
│   ├── cover.html          # 커버 슬라이드
│   ├── content.html        # 콘텐츠 슬라이드 (공용)
│   └── closing.html        # 클로징 슬라이드
├── styles/
│   ├── tokens.css          # 디자인 토큰
│   ├── base.css            # 글로벌 스타일 + 레이아웃
│   ├── components.css      # 블록 컴포넌트 스타일
│   ├── layouts.css         # 추가 레이아웃
│   └── themes/
│       └── 8bit.css        # 8bit 레트로 테마
└── examples/
    └── hello.yaml          # 예제 스펙
```

## 슬라이드 크기

- 캔버스: 1080 x 1350px
- deviceScaleFactor: 2 (출력 2160x2700px)
- 인스타그램/쓰레드 최적화

## License

MIT
