/* ============================================
   인테리어 콘텐츠 생성기 - Main JavaScript
   Content Generation Logic & UI Controller
   ============================================ */

// ======== Data: Content Templates ========
const CONTENT_TYPES = [
  {
    id: 'before-after',
    icon: '✨',
    title: 'Before & After',
    desc: '전문가의 자재 선택 가치 증명',
    badge: '변심 · 예산 해결',
    painPoints: '공사 도중 변심, 하이엔드 결과물 대비 낮은 예산'
  },
  {
    id: 'room-recommend',
    icon: '🏠',
    title: '공간별 제품 추천',
    desc: '예산 범위 내 최적의 대안 제시',
    badge: '예산 불일치 해결',
    painPoints: '다이소급 예산으로 하이엔드 요구'
  },
  {
    id: 'qna',
    icon: '💬',
    title: 'Q&A (자주 묻는 질문)',
    desc: '계약 범위 및 공정 명확화',
    badge: '계약 미숙지 해결',
    painPoints: '계약서 미숙지, "당연한 거 아니에요?" 우기기'
  },
  {
    id: 'review',
    icon: '⭐',
    title: '베스트 후기',
    desc: '전문가 신뢰도 및 만족도 강조',
    badge: '간섭 차단',
    painPoints: '현장 감시 및 어설픈 훈수'
  },
  {
    id: 'benefit',
    icon: '🎁',
    title: '이달의 혜택',
    desc: '빠른 결정 유도 및 전환',
    badge: '결재권자 등판 방지',
    painPoints: '결재권자의 뒤늦은 등판 (조기 확정 유도)'
  },
  {
    id: 'process',
    icon: '📋',
    title: '진행 프로세스',
    desc: '체계적인 시스템 및 개입 차단',
    badge: '변심 · 간섭 차단',
    painPoints: '공사 도중 변심, 현장 감시 및 간섭'
  }
];

// ======== State ========
let currentStep = 1;
let selectedTypes = new Set();
let productData = {};

// ======== DOM Ready ========
document.addEventListener('DOMContentLoaded', () => {
  renderTypeCards();
  bindEvents();
  updateStepper();
});

// ======== Render Content Type Cards ========
function renderTypeCards() {
  const grid = document.getElementById('type-grid');
  grid.innerHTML = CONTENT_TYPES.map(type => `
    <div class="type-card" data-id="${type.id}" onclick="toggleType('${type.id}')">
      <div class="type-card-check">✓</div>
      <div class="type-card-icon">${type.icon}</div>
      <div class="type-card-title">${type.title}</div>
      <div class="type-card-desc">${type.desc}</div>
      <div class="type-card-badge">${type.badge}</div>
    </div>
  `).join('');
}

// ======== Type Selection ========
function toggleType(id) {
  if (selectedTypes.has(id)) {
    selectedTypes.delete(id);
  } else {
    selectedTypes.add(id);
  }
  updateTypeCards();
  updateSelectCount();
}

function selectAllTypes() {
  if (selectedTypes.size === CONTENT_TYPES.length) {
    selectedTypes.clear();
  } else {
    CONTENT_TYPES.forEach(t => selectedTypes.add(t.id));
  }
  updateTypeCards();
  updateSelectCount();
}

function updateTypeCards() {
  document.querySelectorAll('.type-card').forEach(card => {
    card.classList.toggle('selected', selectedTypes.has(card.dataset.id));
  });
}

function updateSelectCount() {
  const countEl = document.getElementById('select-count');
  countEl.textContent = `${selectedTypes.size}개 선택됨`;
  const btn = document.getElementById('select-all-btn');
  btn.textContent = selectedTypes.size === CONTENT_TYPES.length ? '전체 해제' : '전체 선택';
}

// ======== Step Navigation ========
function nextStep() {
  if (currentStep === 1) {
    if (!validateStep1()) return;
    collectProductData();
    currentStep = 2;
  } else if (currentStep === 2) {
    if (selectedTypes.size === 0) {
      showToast('최소 1개의 콘텐츠 유형을 선택해 주세요');
      return;
    }
    currentStep = 3;
    generateContent();
  }
  showStep(currentStep);
  updateStepper();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
    updateStepper();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showStep(step) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`step-${step}`).classList.add('active');
}

function updateStepper() {
  document.querySelectorAll('.step-item').forEach((item, i) => {
    const stepNum = i + 1;
    item.classList.remove('active', 'completed');
    if (stepNum === currentStep) item.classList.add('active');
    if (stepNum < currentStep) item.classList.add('completed');
  });

  const progress = document.querySelector('.stepper-progress');
  if (currentStep === 1) progress.style.width = '0%';
  else if (currentStep === 2) progress.style.width = '50%';
  else progress.style.width = '100%';
}

// ======== Validation ========
function validateStep1() {
  const name = document.getElementById('product-name').value.trim();
  const feat1 = document.getElementById('feature-1').value.trim();
  const target = document.getElementById('target-customer').value.trim();

  if (!name) {
    showToast('제품명을 입력해 주세요');
    document.getElementById('product-name').focus();
    return false;
  }
  if (!feat1) {
    showToast('최소 1개의 주요 특징을 입력해 주세요');
    document.getElementById('feature-1').focus();
    return false;
  }
  if (!target) {
    showToast('타겟 고객을 입력해 주세요');
    document.getElementById('target-customer').focus();
    return false;
  }
  return true;
}

function collectProductData() {
  productData = {
    name: document.getElementById('product-name').value.trim(),
    brand: document.getElementById('brand-name').value.trim() || '인테리어패밀리',
    features: [
      document.getElementById('feature-1').value.trim(),
      document.getElementById('feature-2').value.trim(),
      document.getElementById('feature-3').value.trim()
    ].filter(f => f),
    target: document.getElementById('target-customer').value.trim()
  };
}

// ======== Content Generation ========
function generateContent() {
  const container = document.getElementById('results-container');
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <div class="loading-text">콘텐츠를 생성하고 있습니다...</div>
    </div>
  `;

  setTimeout(() => {
    const results = [];
    const types = CONTENT_TYPES.filter(t => selectedTypes.has(t.id));
    types.forEach(type => {
      results.push(generateByType(type));
    });
    renderResults(results);
  }, 800);
}

function generateByType(type) {
  const p = productData;
  const featList = p.features.map((f, i) => `${i + 1}. ${f}`).join('\n');
  const feat1 = p.features[0] || '';
  const feat2 = p.features[1] || '';
  const feat3 = p.features[2] || '';

  switch (type.id) {
    case 'before-after':
      return {
        ...type,
        cardNews: [
          { label: '슬라이드 1 — 표지', text: `"인테리어, 사진만 보고 결정하면 망하는 이유"\n(Before & After로 알려드립니다)` },
          { label: '슬라이드 2 — 문제 제기', text: `기존 현장은 이런 문제가 있었습니다.\n→ 낡은 마감재, 좁아 보이는 공간, 어울리지 않는 색감\n\n"예쁜 사진만 보고 선택하면,\n실제 공간에서는 전혀 다른 결과가 나옵니다."` },
          { label: '슬라이드 3 — 해결책', text: `전문가가 ${p.name}을(를) 선택한 이유\n\n${p.features.map((f, i) => `✔ ${f}`).join('\n')}\n\n"자재 하나의 차이가\n공간 전체의 분위기를 바꿉니다."` },
          { label: '슬라이드 4 — 결과', text: `[완성된 공간 고화질 사진 삽입]\n\n${p.name}이(가) 적용된 공간.\n전문가의 선택이 만들어낸 차이를 직접 확인하세요.` },
          { label: '슬라이드 5 — 마무리', text: `"디테일의 차이가 가치를 만듭니다."\n\n${p.brand}\n📩 무료 상담 문의: 프로필 링크` }
        ],
        reelsScript: [
          { label: '0-2초', text: `(비포 현장 영상) "자재 하나로 집안 분위기가 이렇게 바뀐다고요?"` },
          { label: '2-5초', text: `(자막) "${p.name} — ${feat1}"` },
          { label: '5-10초', text: `(시공 과정 타임랩스) 전문가의 손길이 닿는 디테일 컷\n자막: "전문가는 왜 이 자재를 선택했을까?"` },
          { label: '10-15초', text: `(애프터 공개) 감각적인 음악과 함께 완성된 공간 투어\n자막: "당신의 공간도 이렇게 바뀔 수 있습니다 ✨"\n\n${p.brand} | 무료 상담 프로필 링크` }
        ]
      };

    case 'room-recommend':
      return {
        ...type,
        cardNews: [
          { label: '슬라이드 1 — 표지', text: `"거실은 넓게, 주방은 깨끗하게!"\n공간별 찰떡 자재 추천 가이드 🏠` },
          { label: '슬라이드 2 — 거실', text: `🛋️ 거실\n시각적 개방감을 주는 ${p.name}\n\n✔ ${feat1}\n${feat2 ? `✔ ${feat2}` : ''}\n\n"거실은 집의 첫인상입니다.\n넓어 보이면서도 내구성 강한 자재가 핵심이에요."` },
          { label: '슬라이드 3 — 주방', text: `🍳 주방\n요리가 즐거워지는 ${p.name}\n\n✔ 내오염성이 강해 관리가 쉬움\n${feat3 ? `✔ ${feat3}` : ''}\n\n"기름때, 물때… 주방은 기능성이 먼저입니다."` },
          { label: '슬라이드 4 — 침실', text: `🛏️ 침실\n숙면을 돕는 차분한 톤의 ${p.name}\n\n✔ 친환경 소재로 건강한 수면 환경\n✔ 차분한 컬러 라인업\n\n"편안한 잠자리, 자재 선택부터 시작됩니다."` },
          { label: '슬라이드 5 — 마무리', text: `"우리 집에 딱 맞는 조합,\n지금 상담받으세요."\n\n${p.brand}\n📩 맞춤 상담: 프로필 링크` }
        ],
        reelsScript: [
          { label: '0-3초', text: `"같은 자재인데 공간마다 다르게 쓴다고?" (놀란 표정 또는 텍스트)` },
          { label: '3-7초', text: `거실 → 주방 → 침실 순서로 전환\n각 공간에 ${p.name} 적용된 모습\n자막: "공간의 성격에 맞는 자재 선택이 핵심!"` },
          { label: '7-12초', text: `공간별 핵심 포인트 텍스트 오버레이\n거실: 개방감 / 주방: 내오염성 / 침실: 친환경` },
          { label: '12-15초', text: `"당신의 공간에 맞는 조합은?\n${p.brand}에서 무료 상담받으세요 💬"` }
        ]
      };

    case 'qna':
      return {
        ...type,
        cardNews: [
          { label: '슬라이드 1 — 표지', text: `"인테리어 전에 꼭 알아야 할 것들"\nQ&A로 정리해 드립니다 💬` },
          { label: '슬라이드 2 — Q1', text: `Q. "공사 시작 후에 자재를 바꿔도 되나요?"\n\nA. 이미 발주된 자재는 변경 시 추가 비용과 공기 지연이 발생합니다.\n확정 전 3D 렌더링으로 꼼꼼히 체크해 드려요!\n\n💡 ${p.name}은(는) 다양한 시뮬레이션이 가능하여\n사전 확인이 용이합니다.` },
          { label: '슬라이드 3 — Q2', text: `Q. "당연히 이것도 포함인 줄 알았는데요?"\n\nA. 계약서의 '제외 항목'을 꼭 확인해 주세요!\n투명한 소통이 만족스러운 결과의 시작입니다.\n\n📋 ${p.brand}는 상세 견적서와 함께\n포함/미포함 항목을 명확히 안내합니다.` },
          { label: '슬라이드 4 — Q3', text: `Q. "시공 현장에 매일 가봐야 하나요?"\n\nA. ${p.brand}는 매일 현장 사진과 진행률을\n카카오톡으로 보내드립니다.\n\n편하게 확인하시고, 전문가에게 맡겨주세요! 📱` },
          { label: '슬라이드 5 — 마무리', text: `"궁금한 게 더 있으시다면\n편하게 문의해 주세요."\n\n${p.brand}\n📩 무료 상담: 프로필 링크` }
        ],
        reelsScript: [
          { label: '0-3초', text: `"인테리어 하기 전에 이것만은 꼭!"\n(손가락으로 포인트하는 모션)` },
          { label: '3-7초', text: `Q&A 카드 빠르게 넘기는 연출\n자막: "공사 후 자재 변경? → 추가 비용 발생!"\n"포함인 줄 알았다고요? → 계약서 확인 필수!"` },
          { label: '7-12초', text: `${p.brand}의 투명한 프로세스 소개\n자막: "우리는 모든 것을 사전에 안내합니다"` },
          { label: '12-15초', text: `"후회 없는 인테리어의 시작,\n${p.brand}와 함께하세요 ✨"` }
        ]
      };

    case 'review':
      return {
        ...type,
        cardNews: [
          { label: '슬라이드 1 — 표지', text: `"전문가를 믿길 잘했습니다"\n${p.brand} 고객 베스트 후기 ⭐` },
          { label: '슬라이드 2 — 후기 1', text: `⭐⭐⭐⭐⭐\n\n"유튜브 보고 아는 척 좀 했는데,\n현장 소장님 설명 들으니 제가 틀렸더라고요.\n전문가를 믿길 잘했습니다!"\n\n— ${p.target} A님` },
          { label: '슬라이드 3 — 후기 2', text: `⭐⭐⭐⭐⭐\n\n"${p.name} 처음엔 반신반의했는데,\n시공 후 보니까 진짜 다르더라고요.\n${feat1}이라는 게 이런 거구나 싶었습니다."\n\n— ${p.target} B님` },
          { label: '슬라이드 4 — 후기 3', text: `⭐⭐⭐⭐⭐\n\n"다른 데보다 견적이 투명하고,\n중간에 추가 비용 없이 깔끔하게 끝났어요.\n주변에도 추천했습니다!"\n\n— ${p.target} C님` },
          { label: '슬라이드 5 — 마무리', text: `"다음 후기의 주인공은 당신입니다."\n\n${p.brand}\n📩 무료 상담: 프로필 링크` }
        ],
        reelsScript: [
          { label: '0-2초', text: `"고객님들이 직접 남겨주신 후기 공개! ⭐"` },
          { label: '2-8초', text: `실제 시공 완료 공간 + 고객 후기 텍스트 오버레이\n(메신저 대화 캡처 또는 자필 후기 이미지)\n배경: 잔잔한 감성 음악` },
          { label: '8-12초', text: `${p.name} 적용된 공간 투어\n자막: "${feat1}"` },
          { label: '12-15초', text: `"전문가를 믿은 결과,\n꿈꾸던 공간이 현실이 됩니다."\n\n${p.brand} | 프로필 링크에서 상담` }
        ]
      };

    case 'benefit':
      return {
        ...type,
        cardNews: [
          { label: '슬라이드 1 — 표지', text: `"🎉 이번 달 한정 특별 혜택"\n지금 결정하시면 이렇게 달라집니다!` },
          { label: '슬라이드 2 — 혜택 소개', text: `🎁 이번 달 계약 고객 한정 혜택\n\n✅ ${p.name} 프리미엄 등급 무료 업그레이드\n✅ 무료 실측 및 공간 컨설팅 제공\n✅ 3D 렌더링 서비스 무료\n\n⏰ 선착순 3팀 한정` },
          { label: '슬라이드 3 — 왜 지금?', text: `"왜 빨리 결정해야 할까요?"\n\n1️⃣ 자재 가격은 매 분기 인상됩니다\n2️⃣ 인기 시공팀은 2-3개월 대기\n3️⃣ 이번 혜택은 재고 소진 시 종료\n\n빠른 결정 = 더 좋은 조건 🏃‍♂️` },
          { label: '슬라이드 4 — 마무리', text: `"가족과 상의 후 연락드릴게요…"\n이러다 혜택 놓치는 분들이 많습니다 😢\n\n지금 바로 문의하세요!\n${p.brand} 📩 프로필 링크` }
        ],
        reelsScript: [
          { label: '0-2초', text: `"🚨 이번 달만 가능한 혜택, 놓치지 마세요!"` },
          { label: '2-7초', text: `혜택 항목 하나씩 팝업 애니메이션\n✅ 프리미엄 업그레이드\n✅ 무료 실측\n✅ 3D 렌더링\n자막: "선착순 3팀 한정!"` },
          { label: '7-12초', text: `시공 완료된 프리미엄 공간 영상\n자막: "이 퀄리티를, 이 가격에?"` },
          { label: '12-15초', text: `"지금 프로필 링크에서 상담 신청하세요!\n${p.brand} 🏠✨"` }
        ]
      };

    case 'process':
      return {
        ...type,
        cardNews: [
          { label: '슬라이드 1 — 표지', text: `"${p.brand}는 이렇게 진행합니다"\n투명한 5단계 프로세스 📋` },
          { label: '슬라이드 2 — 1~2단계', text: `📌 STEP 1. 상담 및 실측\n→ 고객님의 니즈와 예산을 꼼꼼히 파악합니다.\n→ 현장을 직접 방문하여 정밀 실측합니다.\n\n📌 STEP 2. 디자인 및 자재 확정\n→ 3D 렌더링으로 완성 모습을 미리 확인합니다.\n→ ${p.name} 등 최적 자재를 함께 선정합니다.\n\n⚠️ 이 단계 이후 자재 변경 시 추가 비용 발생` },
          { label: '슬라이드 3 — 3~4단계', text: `📌 STEP 3. 전문 시공\n→ 현장 매뉴얼에 따라 체계적으로 진행합니다.\n→ 매일 진행 사진을 카카오톡으로 공유합니다.\n\n📌 STEP 4. 최종 검수 및 인도\n→ 고객님과 함께 꼼꼼한 검수를 진행합니다.\n→ 체크리스트 기반으로 하자 여부를 확인합니다.` },
          { label: '슬라이드 4 — 5단계', text: `📌 STEP 5. 사후 관리\n→ 1년 무상 A/S 보장\n→ 하자 발생 시 48시간 내 대응\n\n"체계적인 프로세스가\n안심할 수 있는 인테리어를 만듭니다."` },
          { label: '슬라이드 5 — 마무리', text: `"시작부터 끝까지,\n${p.brand}가 책임집니다."\n\n📩 무료 상담: 프로필 링크` }
        ],
        reelsScript: [
          { label: '0-2초', text: `"인테리어, 어떻게 진행되는지 궁금하셨죠?"` },
          { label: '2-5초', text: `STEP 1 → 2 → 3 → 4 → 5 순서대로\n아이콘 + 텍스트 빠르게 전환\n자막: "상담 → 디자인 확정 → 시공 → 검수 → A/S"` },
          { label: '5-10초', text: `실제 시공 현장 타임랩스\n자막: "모든 과정을 투명하게, 매일 공유합니다"` },
          { label: '10-15초', text: `완성된 공간 공개\n자막: "체계적인 시스템이\n당신의 꿈꾸는 공간을 만듭니다 ✨\n\n${p.brand} | 프로필 링크"` }
        ]
      };

    default:
      return { ...type, cardNews: [], reelsScript: [] };
  }
}

// ======== Render Results ========
function renderResults(results) {
  const container = document.getElementById('results-container');
  container.innerHTML = results.map((r, idx) => `
    <div class="result-card ${idx === 0 ? 'open' : ''}" id="result-${r.id}">
      <div class="result-header" onclick="toggleResult('${r.id}')">
        <div class="result-header-left">
          <span class="result-header-icon">${r.icon}</span>
          <div>
            <div class="result-header-title">${r.title}</div>
            <div class="result-header-subtitle">${r.painPoints}</div>
          </div>
        </div>
        <span class="result-toggle">▼</span>
      </div>
      <div class="result-body">
        <div class="result-section">
          <div class="result-section-title">📸 카드뉴스 대본</div>
          <div class="result-content" id="card-${r.id}">
            <button class="copy-btn" onclick="copyContent('card-${r.id}', this, event)">📋 복사</button>
            ${r.cardNews.map(s => `
              <div class="slide">
                <div class="slide-label">${s.label}</div>
                <div class="slide-text">${s.text.replace(/\n/g, '<br>')}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="result-section">
          <div class="result-section-title">🎬 릴스 영상 스크립트</div>
          <div class="result-content" id="reels-${r.id}">
            <button class="copy-btn" onclick="copyContent('reels-${r.id}', this, event)">📋 복사</button>
            ${r.reelsScript.map(s => `
              <div class="slide">
                <div class="slide-label">${s.label}</div>
                <div class="slide-text">${s.text.replace(/\n/g, '<br>')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleResult(id) {
  const card = document.getElementById(`result-${id}`);
  card.classList.toggle('open');
}

// ======== Copy ========
function copyContent(id, btn, e) {
  e.stopPropagation();
  const el = document.getElementById(id);
  const slides = el.querySelectorAll('.slide');
  let text = '';
  slides.forEach(slide => {
    const label = slide.querySelector('.slide-label').textContent;
    const content = slide.querySelector('.slide-text').innerText;
    text += `【${label}】\n${content}\n\n`;
  });

  navigator.clipboard.writeText(text.trim()).then(() => {
    btn.textContent = '✅ 복사됨';
    btn.classList.add('copied');
    showToast('클립보드에 복사되었습니다');
    setTimeout(() => {
      btn.textContent = '📋 복사';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ======== Event Bindings ========
function bindEvents() {
  // Enter key on inputs
  document.querySelectorAll('.form-input, .form-textarea').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && el.tagName !== 'TEXTAREA') {
        e.preventDefault();
        nextStep();
      }
    });
  });
}

// ======== Toast ========
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ======== Reset ========
function resetAll() {
  currentStep = 1;
  selectedTypes.clear();
  productData = {};
  document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.value = '');
  updateTypeCards();
  updateSelectCount();
  showStep(1);
  updateStepper();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
