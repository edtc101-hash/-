/* ============================================
   카드뉴스 에디터 — Application Logic
   ============================================ */

// ─── State ───
let slides = [];
let currentSlideIdx = 0;
let previewImages = [];
let previewIdx = 0;

// ─── Initialize with default slides ───
function initEditor() {
    slides = [
        { layout: 'cover', title: '인테리어패밀리\n파트너쉽 프로모션', subtitle: 'InFam. 파트너 전용 혜택', blocks: [] },
        {
            layout: 'explanation', title: '선결제 멤버십', subtitle: '예치금으로, 매입 단가 10%를 즉시 낮추세요', blocks: [
                {
                    type: 'table', columns: [{ header: '' }, { header: '🥈 GOLD' }, { header: '🥇 PLATINUM' }],
                    rows: [
                        { label: '예치금', cells: [{ text: '500만 원' }, { text: '1,000만 원' }] },
                        { label: '할인율', cells: [{ text: '전 품목 5%' }, { text: '전 품목 10%' }] },
                        { label: '특별 혜택', cells: [{ text: '—' }, { text: '배송비 무료 1회\n+ 시공 포트폴리오\n촬영 서비스 1회' }] }
                    ]
                },
                { type: 'tip-box', label: '운영 규칙', content: '선결제 금액 내 구매 시, 수량과 관계없이 해당 할인을 즉시 적용', highlight_word: '즉시 적용' }
            ]
        },
        {
            layout: 'explanation', title: '리워드 시스템', subtitle: '구매할수록 쌓이는 현금성 혜택', blocks: [
                {
                    type: 'card-list', items: [
                        { emoji: '🐷', title: '기본 적립', description: '구매 금액의\n3% 적립' },
                        { emoji: '💳', title: '사용 조건', description: '누적 적립금\n300,000원 이상 시\n즉시 사용 가능' },
                        { emoji: '📱', title: '추가 리워드 +1%', description: '시공 후기 사례 사진 제출,\n추가 1% 적립' }
                    ]
                }
            ]
        },
        {
            layout: 'comparison', title: '한눈에 보는 혜택 비교', subtitle: '멤버십 + 리워드 = 최대 14% 혜택', blocks: [
                {
                    type: 'before-after',
                    before: { emoji: '😐', title: 'Before', description: '정가 구매\n적립 혜택 없음' },
                    after: { emoji: '🎉', title: 'After', description: '전 품목 10% 할인\n구매액 4% 적립' }
                }
            ]
        },
        {
            layout: 'closing', title: '단순 할인이 아닙니다', subtitle: '', blocks: [
                { type: 'highlight-banner', content: '인팸은 파트너사의 마진을 더 확보해 드리는 든든한 파트너가 되겠습니다', bold_part: '든든한 파트너' },
                {
                    type: 'step-list', items: [
                        { step: 1, emoji: '📞', title: '파트너 상담 신청', description: '프로필 링크에서\n간편 신청' },
                        { step: 2, emoji: '📋', title: '멤버십 등급 선택', description: 'GOLD 또는\nPLATINUM 선택' },
                        { step: 3, emoji: '🚀', title: '즉시 혜택 적용', description: '선결제 완료 즉시\n할인 시작' }
                    ]
                }
            ]
        }
    ];
    renderSlideList();
    selectSlide(0);
    loadThemes();
}

// ─── Slide List ───
function renderSlideList() {
    const list = document.getElementById('slides-list');
    const layoutNames = {
        cover: '🎬 커버', problem: '😱 문제', explanation: '📖 설명', solution: '✅ 솔루션',
        howto: '🔧 방법', comparison: '⚖️ 비교', advanced: '🚀 심화', workflow: '📋 프로세스', closing: '🎯 마무리'
    };
    list.innerHTML = slides.map((s, i) => `
    <div class="slide-item ${i === currentSlideIdx ? 'active' : ''}" onclick="selectSlide(${i})">
      <div class="slide-item-number">${i + 1}</div>
      <div class="slide-item-info">
        <div class="slide-item-title">${s.title.replace(/\n/g, ' ') || '제목 없음'}</div>
        <div class="slide-item-layout">${layoutNames[s.layout] || s.layout}</div>
      </div>
    </div>
  `).join('');
}

function selectSlide(idx) {
    currentSlideIdx = idx;
    renderSlideList();
    loadSlideEditor();
}

function addSlide() {
    slides.push({ layout: 'explanation', title: '새 슬라이드', subtitle: '', blocks: [] });
    renderSlideList();
    selectSlide(slides.length - 1);
}

function deleteCurrentSlide() {
    if (slides.length <= 1) { showToast('최소 1개의 슬라이드가 필요합니다'); return; }
    slides.splice(currentSlideIdx, 1);
    if (currentSlideIdx >= slides.length) currentSlideIdx = slides.length - 1;
    renderSlideList();
    loadSlideEditor();
}

function duplicateCurrentSlide() {
    const clone = JSON.parse(JSON.stringify(slides[currentSlideIdx]));
    slides.splice(currentSlideIdx + 1, 0, clone);
    renderSlideList();
    selectSlide(currentSlideIdx + 1);
    showToast('슬라이드 복제됨');
}

// ─── Slide Editor ───
function loadSlideEditor() {
    const slide = slides[currentSlideIdx];
    document.getElementById('slide-editor-title').textContent = `슬라이드 ${currentSlideIdx + 1} 편집`;
    document.getElementById('slide-layout').value = slide.layout;
    document.getElementById('slide-title').value = slide.title;
    document.getElementById('slide-subtitle').value = slide.subtitle || '';
    renderBlocks();
}

function updateCurrentSlide() {
    const slide = slides[currentSlideIdx];
    slide.layout = document.getElementById('slide-layout').value;
    slide.title = document.getElementById('slide-title').value;
    slide.subtitle = document.getElementById('slide-subtitle').value;
    renderSlideList();
}

// ─── Block System ───
function toggleBlockMenu() {
    document.getElementById('block-menu').classList.toggle('open');
}

function addBlock(type) {
    document.getElementById('block-menu').classList.remove('open');
    const slide = slides[currentSlideIdx];
    const templates = {
        'card-list': { type: 'card-list', items: [{ emoji: '🔹', title: '항목 제목', description: '설명 텍스트' }] },
        'step-list': { type: 'step-list', items: [{ step: 1, emoji: '1️⃣', title: '스텝 제목', description: '설명' }] },
        'before-after': { type: 'before-after', before: { emoji: '❌', title: 'Before', description: '이전 상태' }, after: { emoji: '✅', title: 'After', description: '이후 상태' } },
        'table': { type: 'table', columns: [{ header: '' }, { header: '항목 A' }, { header: '항목 B' }], rows: [{ label: '행 1', cells: [{ text: '값 1' }, { text: '값 2' }] }] },
        'tip-box': { type: 'tip-box', label: 'Tip', content: '팁 내용을 입력하세요', highlight_word: '' },
        'info-box': { type: 'info-box', title: '정보', content: '정보 내용을 입력하세요', highlight_word: '' },
        'highlight-banner': { type: 'highlight-banner', content: '강조할 메시지', bold_part: '볼드 부분' },
        'text': { type: 'text', content: '텍스트를 입력하세요', style: 'normal' },
        'progress-bar': { type: 'progress-bar', label: '항목', value: 75, display_text: '75%' },
        'terminal-block': { type: 'terminal-block', title: 'Terminal', lines: [{ type: 'command', text: '> npm install' }] }
    };
    slide.blocks.push(JSON.parse(JSON.stringify(templates[type] || templates['text'])));
    renderBlocks();
}

function removeBlock(idx) {
    slides[currentSlideIdx].blocks.splice(idx, 1);
    renderBlocks();
}

function renderBlocks() {
    const container = document.getElementById('blocks-container');
    const blocks = slides[currentSlideIdx].blocks;

    if (blocks.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">블록이 없습니다. 위에서 블록을 추가하세요.</div>';
        return;
    }

    const blockNames = {
        'card-list': '🃏 카드 목록', 'step-list': '📝 스텝 목록', 'before-after': '🔄 Before/After',
        'table': '📊 비교 테이블', 'tip-box': '💡 팁 박스', 'info-box': 'ℹ️ 정보 박스',
        'highlight-banner': '🔥 강조 배너', 'text': '📝 텍스트', 'progress-bar': '📊 프로그레스',
        'terminal-block': '💻 터미널', 'code-editor': '📝 코드', 'bar-list': '📊 막대 목록'
    };

    container.innerHTML = blocks.map((block, bi) => {
        let body = '';

        if (block.type === 'card-list') {
            body = renderCardListEditor(block, bi);
        } else if (block.type === 'step-list') {
            body = renderStepListEditor(block, bi);
        } else if (block.type === 'before-after') {
            body = renderBeforeAfterEditor(block, bi);
        } else if (block.type === 'table') {
            body = renderTableEditor(block, bi);
        } else if (block.type === 'tip-box' || block.type === 'info-box') {
            body = renderBoxEditor(block, bi);
        } else if (block.type === 'highlight-banner') {
            body = renderBannerEditor(block, bi);
        } else if (block.type === 'text') {
            body = renderTextEditor(block, bi);
        } else if (block.type === 'progress-bar') {
            body = renderProgressEditor(block, bi);
        } else {
            body = `<div style="color:var(--text-muted);font-size:11px;">이 블록 타입의 비주얼 에디터는 추후 추가됩니다</div>`;
        }

        return `
      <div class="block-card">
        <div class="block-card-header">
          ${blockNames[block.type] || block.type}
          <div class="block-card-actions">
            ${bi > 0 ? `<button onclick="moveBlock(${bi},-1)" title="위로">↑</button>` : ''}
            ${bi < blocks.length - 1 ? `<button onclick="moveBlock(${bi},1)" title="아래로">↓</button>` : ''}
            <button onclick="removeBlock(${bi})" title="삭제">✕</button>
          </div>
        </div>
        ${body}
      </div>
    `;
    }).join('');
}

function moveBlock(idx, dir) {
    const blocks = slides[currentSlideIdx].blocks;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
    renderBlocks();
}

// ─── Block Editors ───
function renderCardListEditor(block, bi) {
    return `<div class="block-items">
    ${block.items.map((item, ii) => `
      <div class="block-item">
        <button class="block-item-remove" onclick="removeItem(${bi},${ii})">✕</button>
        <div class="form-row">
          <div class="form-group"><label>이모지</label><input class="form-input" value="${esc(item.emoji)}" onchange="updateItem(${bi},${ii},'emoji',this.value)" style="width:60px"></div>
          <div class="form-group" style="flex:1"><label>제목</label><input class="form-input" value="${esc(item.title)}" onchange="updateItem(${bi},${ii},'title',this.value)"></div>
        </div>
        <div class="form-group"><label>설명</label><textarea class="form-input" onchange="updateItem(${bi},${ii},'description',this.value)">${esc(item.description)}</textarea></div>
      </div>
    `).join('')}
    <button class="btn-add-item" onclick="addItem(${bi},'card-list')">+ 항목 추가</button>
  </div>`;
}

function renderStepListEditor(block, bi) {
    return `<div class="block-items">
    ${block.items.map((item, ii) => `
      <div class="block-item">
        <button class="block-item-remove" onclick="removeItem(${bi},${ii})">✕</button>
        <div class="form-row">
          <div class="form-group"><label>스텝</label><input class="form-input" type="number" value="${item.step}" onchange="updateItem(${bi},${ii},'step',parseInt(this.value))" style="width:50px"></div>
          <div class="form-group"><label>이모지</label><input class="form-input" value="${esc(item.emoji)}" onchange="updateItem(${bi},${ii},'emoji',this.value)" style="width:60px"></div>
          <div class="form-group" style="flex:1"><label>제목</label><input class="form-input" value="${esc(item.title)}" onchange="updateItem(${bi},${ii},'title',this.value)"></div>
        </div>
        <div class="form-group"><label>설명</label><textarea class="form-input" onchange="updateItem(${bi},${ii},'description',this.value)">${esc(item.description)}</textarea></div>
      </div>
    `).join('')}
    <button class="btn-add-item" onclick="addItem(${bi},'step-list')">+ 스텝 추가</button>
  </div>`;
}

function renderBeforeAfterEditor(block, bi) {
    return `<div class="form-row">
    <div class="block-item" style="flex:1">
      <div style="font-size:11px;font-weight:700;color:var(--danger);margin-bottom:8px">❌ Before</div>
      <div class="form-group"><label>이모지</label><input class="form-input" value="${esc(block.before.emoji)}" onchange="updateNested(${bi},'before','emoji',this.value)"></div>
      <div class="form-group"><label>제목</label><input class="form-input" value="${esc(block.before.title)}" onchange="updateNested(${bi},'before','title',this.value)"></div>
      <div class="form-group"><label>설명</label><textarea class="form-input" onchange="updateNested(${bi},'before','description',this.value)">${esc(block.before.description)}</textarea></div>
    </div>
    <div class="block-item" style="flex:1">
      <div style="font-size:11px;font-weight:700;color:var(--success);margin-bottom:8px">✅ After</div>
      <div class="form-group"><label>이모지</label><input class="form-input" value="${esc(block.after.emoji)}" onchange="updateNested(${bi},'after','emoji',this.value)"></div>
      <div class="form-group"><label>제목</label><input class="form-input" value="${esc(block.after.title)}" onchange="updateNested(${bi},'after','title',this.value)"></div>
      <div class="form-group"><label>설명</label><textarea class="form-input" onchange="updateNested(${bi},'after','description',this.value)">${esc(block.after.description)}</textarea></div>
    </div>
  </div>`;
}

function renderTableEditor(block, bi) {
    return `
    <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">열 헤더 (쉼표로 구분)</div>
    <div class="form-group"><input class="form-input" value="${block.columns.map(c => c.header).join(', ')}" onchange="updateTableCols(${bi},this.value)"></div>
    <div class="block-items">
      ${block.rows.map((row, ri) => `
        <div class="block-item">
          <button class="block-item-remove" onclick="removeTableRow(${bi},${ri})">✕</button>
          <div class="form-group"><label>행 라벨</label><input class="form-input" value="${esc(row.label)}" onchange="updateTableRow(${bi},${ri},'label',this.value)"></div>
          <div class="form-row">
            ${row.cells.map((cell, ci) => `
              <div class="form-group"><label>값 ${ci + 1}</label><textarea class="form-input" onchange="updateTableCell(${bi},${ri},${ci},this.value)">${esc(cell.text)}</textarea></div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      <button class="btn-add-item" onclick="addTableRow(${bi})">+ 행 추가</button>
    </div>`;
}

function renderBoxEditor(block, bi) {
    return `
    <div class="form-group"><label>라벨</label><input class="form-input" value="${esc(block.label || block.title || '')}" onchange="updateBlock(${bi},'${block.type === 'tip-box' ? 'label' : 'title'}',this.value)"></div>
    <div class="form-group"><label>내용</label><textarea class="form-input" onchange="updateBlock(${bi},'content',this.value)">${esc(block.content)}</textarea></div>
    <div class="form-group"><label>강조 단어</label><input class="form-input" value="${esc(block.highlight_word || '')}" onchange="updateBlock(${bi},'highlight_word',this.value)"></div>
  `;
}

function renderBannerEditor(block, bi) {
    return `
    <div class="form-group"><label>메시지</label><textarea class="form-input" onchange="updateBlock(${bi},'content',this.value)">${esc(block.content)}</textarea></div>
    <div class="form-group"><label>볼드 부분</label><input class="form-input" value="${esc(block.bold_part || '')}" onchange="updateBlock(${bi},'bold_part',this.value)"></div>
  `;
}

function renderTextEditor(block, bi) {
    return `
    <div class="form-group"><label>텍스트</label><textarea class="form-input" onchange="updateBlock(${bi},'content',this.value)">${esc(block.content)}</textarea></div>
    <div class="form-group"><label>스타일</label>
      <select class="form-input" onchange="updateBlock(${bi},'style',this.value)">
        <option value="normal" ${block.style === 'normal' ? 'selected' : ''}>Normal</option>
        <option value="muted" ${block.style === 'muted' ? 'selected' : ''}>Muted</option>
        <option value="accent" ${block.style === 'accent' ? 'selected' : ''}>Accent</option>
      </select>
    </div>
  `;
}

function renderProgressEditor(block, bi) {
    return `<div class="form-row">
    <div class="form-group"><label>라벨</label><input class="form-input" value="${esc(block.label)}" onchange="updateBlock(${bi},'label',this.value)"></div>
    <div class="form-group"><label>값</label><input class="form-input" type="number" min="0" max="100" value="${block.value}" onchange="updateBlock(${bi},'value',parseInt(this.value))"></div>
    <div class="form-group"><label>표시 텍스트</label><input class="form-input" value="${esc(block.display_text)}" onchange="updateBlock(${bi},'display_text',this.value)"></div>
  </div>`;
}

// ─── Block Data Helpers ───
function updateBlock(bi, key, value) { slides[currentSlideIdx].blocks[bi][key] = value; }
function updateNested(bi, group, key, value) { slides[currentSlideIdx].blocks[bi][group][key] = value; }
function updateItem(bi, ii, key, value) { slides[currentSlideIdx].blocks[bi].items[ii][key] = value; }

function addItem(bi, type) {
    const block = slides[currentSlideIdx].blocks[bi];
    if (type === 'card-list') block.items.push({ emoji: '🔹', title: '새 항목', description: '설명' });
    else if (type === 'step-list') block.items.push({ step: block.items.length + 1, emoji: '🔹', title: '새 스텝', description: '설명' });
    renderBlocks();
}

function removeItem(bi, ii) {
    slides[currentSlideIdx].blocks[bi].items.splice(ii, 1);
    renderBlocks();
}

function updateTableCols(bi, value) {
    const cols = value.split(',').map(h => ({ header: h.trim() }));
    slides[currentSlideIdx].blocks[bi].columns = cols;
    renderBlocks();
}

function updateTableRow(bi, ri, key, value) { slides[currentSlideIdx].blocks[bi].rows[ri][key] = value; }
function updateTableCell(bi, ri, ci, value) { slides[currentSlideIdx].blocks[bi].rows[ri].cells[ci].text = value; }

function addTableRow(bi) {
    const block = slides[currentSlideIdx].blocks[bi];
    const cellCount = block.columns.length - 1;
    block.rows.push({ label: '새 행', cells: Array.from({ length: cellCount }, () => ({ text: '' })) });
    renderBlocks();
}

function removeTableRow(bi, ri) {
    slides[currentSlideIdx].blocks[bi].rows.splice(ri, 1);
    renderBlocks();
}

// ─── Render API ───
async function renderAll() {
    const meta = {
        title: document.getElementById('meta-title').value,
        subtitle: document.getElementById('meta-subtitle').value,
        series: document.getElementById('meta-series').value,
        tag: document.getElementById('meta-tag').value,
        author: document.getElementById('meta-author').value,
        author_handle: document.getElementById('meta-handle').value,
        total_slides: slides.length,
        created_at: new Date().toISOString().split('T')[0],
        theme: document.getElementById('theme-select').value || undefined
    };

    const spec = {
        meta,
        slides: slides.map((s, i) => ({
            slide: i + 1,
            layout: s.layout,
            title: s.title,
            subtitle: s.subtitle || '',
            blocks: s.blocks.length > 0 ? s.blocks : [{ type: 'text', content: '', style: 'muted' }]
        }))
    };

    showLoading(true);

    try {
        const res = await fetch('/api/render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spec })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        // Load preview
        previewImages = data.images;
        previewIdx = 0;
        renderPreview();
        showToast(`✅ ${data.images.length}장 렌더링 완료!`);
    } catch (err) {
        showToast(`❌ 렌더링 실패: ${err.message}`);
    } finally {
        showLoading(false);
    }
}

function renderPreview() {
    const container = document.getElementById('preview-container');
    const nav = document.getElementById('preview-nav');
    const dl = document.getElementById('download-section');

    if (previewImages.length === 0) return;

    container.innerHTML = previewImages.map((img, i) =>
        `<img src="${img.url}?t=${Date.now()}" alt="슬라이드 ${i + 1}" class="${i === previewIdx ? 'active' : ''}">`
    ).join('');

    nav.style.display = 'flex';
    dl.style.display = 'flex';
    updatePreviewNav();
}

function updatePreviewNav() {
    document.getElementById('preview-counter').textContent = `${previewIdx + 1} / ${previewImages.length}`;
    const imgs = document.querySelectorAll('#preview-container img');
    imgs.forEach((img, i) => img.classList.toggle('active', i === previewIdx));
}

function nextPreview() { if (previewIdx < previewImages.length - 1) { previewIdx++; updatePreviewNav(); } }
function prevPreview() { if (previewIdx > 0) { previewIdx--; updatePreviewNav(); } }

// ─── Download ───
function downloadCurrent() {
    if (!previewImages[previewIdx]) return;
    const link = document.createElement('a');
    link.href = previewImages[previewIdx].url;
    link.download = `카드뉴스_${String(previewIdx + 1).padStart(2, '0')}.png`;
    link.click();
    showToast('다운로드 시작!');
}

async function downloadAll() {
    for (let i = 0; i < previewImages.length; i++) {
        const link = document.createElement('a');
        link.href = previewImages[i].url;
        link.download = `카드뉴스_${String(i + 1).padStart(2, '0')}.png`;
        link.click();
        await new Promise(r => setTimeout(r, 300));
    }
    showToast(`${previewImages.length}장 전체 다운로드 시작!`);
}

// ─── Themes ───
async function loadThemes() {
    try {
        const res = await fetch('/api/themes');
        const data = await res.json();
        const select = document.getElementById('theme-select');
        select.innerHTML = data.themes.map(t => `<option value="${t === 'default' ? '' : t}">${t === 'default' ? '기본 테마' : t}</option>`).join('');
    } catch (e) { /* silent */ }
}

// ─── Utils ───
function esc(str) { return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function showLoading(show) {
    document.getElementById('loading-overlay').classList.toggle('active', show);
}

// Close block menu on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.block-add-menu')) {
        document.getElementById('block-menu')?.classList.remove('open');
    }
});

// ─── Init ───
document.addEventListener('DOMContentLoaded', initEditor);
