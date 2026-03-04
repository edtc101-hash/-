/* ============================================
   카드뉴스 에디터 - Fabric.js Based Editor
   Visual Card News Creator for Instagram
   ============================================ */

// ======== Editor State ========
let editorCanvas = null;
let editorSlides = [];
let currentSlideIndex = 0;
let uploadedPhotos = [];
const CANVAS_SIZE = 1080;

// ======== Photo Upload ========
function initPhotoUpload() {
    const dropzone = document.getElementById('photo-dropzone');
    const fileInput = document.getElementById('photo-input');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', (e) => {
        if (e.target.closest('.thumb-remove')) return;
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = '';
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedPhotos.push({ id: Date.now() + Math.random(), name: file.name, dataUrl: e.target.result });
            renderThumbnails();
        };
        reader.readAsDataURL(file);
    });
}

function renderThumbnails() {
    const container = document.getElementById('photo-thumbnails');
    const countEl = document.getElementById('photo-count');
    if (uploadedPhotos.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        if (countEl) countEl.textContent = '';
        return;
    }
    container.style.display = 'grid';
    if (countEl) countEl.textContent = `${uploadedPhotos.length}장 업로드됨`;
    container.innerHTML = uploadedPhotos.map((photo, idx) => `
    <div class="thumb-item" data-idx="${idx}">
      <img src="${photo.dataUrl}" alt="사진 ${idx + 1}" class="thumb-img">
      <span class="thumb-number">${idx + 1}</span>
      <button class="thumb-remove" onclick="removePhoto(${idx}, event)" title="삭제">✕</button>
    </div>
  `).join('');
}

function removePhoto(idx, e) {
    e.stopPropagation();
    uploadedPhotos.splice(idx, 1);
    renderThumbnails();
}

function clearPhotos() {
    uploadedPhotos = [];
    renderThumbnails();
}

// ======== Editor Modal ========
function openEditor(contentTypeId) {
    const resultCard = document.getElementById(`result-${contentTypeId}`);
    if (!resultCard) return;

    const cardNewsSection = resultCard.querySelector('.result-section');
    if (!cardNewsSection) return;

    const slides = cardNewsSection.querySelectorAll('.slide');
    editorSlides = [];
    slides.forEach((slide, idx) => {
        editorSlides.push({
            label: slide.querySelector('.slide-label')?.textContent || `슬라이드 ${idx + 1}`,
            text: slide.querySelector('.slide-text')?.innerText || '',
            photo: uploadedPhotos[idx] || null
        });
    });

    if (editorSlides.length === 0) {
        showToast('생성된 카드뉴스 대본이 없습니다');
        return;
    }

    currentSlideIndex = 0;
    document.getElementById('editor-modal').classList.add('open');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        initCanvas();
        loadSlide(0);
    }, 200);
}

function closeEditor() {
    document.getElementById('editor-modal').classList.remove('open');
    document.body.style.overflow = '';
    if (editorCanvas) {
        editorCanvas.dispose();
        editorCanvas = null;
    }
}

// ======== Canvas Init ========
function initCanvas() {
    if (editorCanvas) {
        editorCanvas.dispose();
        editorCanvas = null;
    }

    const wrapper = document.getElementById('canvas-wrapper');
    const displaySize = Math.min(wrapper.offsetWidth - 40, wrapper.offsetHeight - 40, 520);

    editorCanvas = new fabric.Canvas('editor-canvas', {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        backgroundColor: '#FFFFFF'
    });

    // CSS scaling for display
    const lowerCanvas = editorCanvas.lowerCanvasEl;
    const upperCanvas = editorCanvas.upperCanvasEl;
    const fabricWrapper = editorCanvas.wrapperEl;

    [lowerCanvas, upperCanvas].forEach(c => {
        c.style.width = displaySize + 'px';
        c.style.height = displaySize + 'px';
    });
    fabricWrapper.style.width = displaySize + 'px';
    fabricWrapper.style.height = displaySize + 'px';

    updateSlideNav();
}

// ======== Load Slide ========
function loadSlide(index) {
    if (!editorCanvas || index < 0 || index >= editorSlides.length) return;
    currentSlideIndex = index;
    editorCanvas.clear();
    editorCanvas.backgroundColor = '#FFFFFF';

    const slide = editorSlides[index];

    if (slide.photo) {
        fabric.Image.fromURL(slide.photo.dataUrl, (img) => {
            const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
            img.set({
                scaleX: scale, scaleY: scale,
                left: CANVAS_SIZE / 2, top: CANVAS_SIZE / 2,
                originX: 'center', originY: 'center',
                selectable: false, evented: false
            });
            editorCanvas.setBackgroundImage(img, editorCanvas.renderAll.bind(editorCanvas));
            addTextOverlay(slide);
        });
    } else {
        addGradientBackground();
        addTextOverlay(slide);
    }

    updateSlideNav();
}

function addGradientBackground() {
    const rect = new fabric.Rect({
        width: CANVAS_SIZE, height: CANVAS_SIZE,
        left: 0, top: 0,
        selectable: false, evented: false,
        fill: new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: CANVAS_SIZE, y2: CANVAS_SIZE },
            colorStops: [
                { offset: 0, color: '#FFF5F0' },
                { offset: 0.5, color: '#FFFFFF' },
                { offset: 1, color: '#FFF0E6' }
            ]
        })
    });
    editorCanvas.add(rect);
    editorCanvas.renderAll();
}

function addTextOverlay(slide) {
    const tpl = document.querySelector('.template-btn.active')?.dataset.template || 'bottom';

    let textTop, boxTop, boxHeight;
    if (tpl === 'top') { textTop = 80; boxTop = 40; boxHeight = 400; }
    else if (tpl === 'center') { textTop = 340; boxTop = 300; boxHeight = 480; }
    else { textTop = 620; boxTop = 580; boxHeight = 460; }

    // Semi-transparent bg for readability
    if (slide.photo) {
        editorCanvas.add(new fabric.Rect({
            left: 0, top: boxTop,
            width: CANVAS_SIZE, height: boxHeight,
            fill: 'rgba(0, 0, 0, 0.55)',
            selectable: false, evented: false, name: 'textBg'
        }));
    }

    // Label
    editorCanvas.add(new fabric.Textbox(slide.label, {
        left: CANVAS_SIZE / 2, top: textTop,
        width: 900, originX: 'center',
        fontSize: 32, fontFamily: 'Inter, sans-serif',
        fontWeight: '700', fill: '#FF6B35',
        textAlign: 'center', name: 'labelText'
    }));

    // Main text
    const mainContent = slide.text.split('\n').filter(l => l.trim()).join('\n');
    editorCanvas.add(new fabric.Textbox(mainContent, {
        left: CANVAS_SIZE / 2, top: textTop + 60,
        width: 900, originX: 'center',
        fontSize: 36, fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        fill: slide.photo ? '#FFFFFF' : '#1A1A2E',
        textAlign: 'center', lineHeight: 1.5,
        name: 'mainText'
    }));

    editorCanvas.renderAll();
}

// ======== Template ========
function setTemplate(template, btn) {
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadSlide(currentSlideIndex);
}

// ======== Slide Nav ========
function nextSlide() { if (currentSlideIndex < editorSlides.length - 1) loadSlide(currentSlideIndex + 1); }
function prevSlide() { if (currentSlideIndex > 0) loadSlide(currentSlideIndex - 1); }

function updateSlideNav() {
    const navText = document.getElementById('slide-nav-text');
    const prev = document.getElementById('slide-prev');
    const next = document.getElementById('slide-next');
    if (navText) navText.textContent = `${currentSlideIndex + 1} / ${editorSlides.length}`;
    if (prev) prev.disabled = currentSlideIndex === 0;
    if (next) next.disabled = currentSlideIndex === editorSlides.length - 1;
}

// ======== Text Controls ========
function setFontSize(size) {
    const obj = editorCanvas?.getActiveObject();
    if (obj && obj.type === 'textbox') { obj.set('fontSize', parseInt(size)); editorCanvas.renderAll(); }
}

function setTextColor(color) {
    const obj = editorCanvas?.getActiveObject();
    if (obj && obj.type === 'textbox') { obj.set('fill', color); editorCanvas.renderAll(); }
}

function setTextAlign(align) {
    const obj = editorCanvas?.getActiveObject();
    if (obj && obj.type === 'textbox') { obj.set('textAlign', align); editorCanvas.renderAll(); }
    document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
    event?.target?.closest('.align-btn')?.classList.add('active');
}

function setBgOpacity(value) {
    if (!editorCanvas) return;
    const bg = editorCanvas.getObjects().find(o => o.name === 'textBg');
    if (bg) { bg.set('fill', `rgba(0, 0, 0, ${parseFloat(value)})`); editorCanvas.renderAll(); }
}

// ======== Export ========
function downloadCurrentSlide() {
    if (!editorCanvas) return;
    editorCanvas.discardActiveObject();
    editorCanvas.renderAll();

    const link = document.createElement('a');
    link.download = `카드뉴스_슬라이드_${currentSlideIndex + 1}.png`;
    link.href = editorCanvas.toDataURL({ format: 'png', quality: 1 });
    link.click();
    showToast(`슬라이드 ${currentSlideIndex + 1} 다운로드 완료`);
}

function downloadAllSlides() {
    if (!editorCanvas || editorSlides.length === 0) return;
    const origIdx = currentSlideIndex;

    function downloadNext(idx) {
        if (idx >= editorSlides.length) {
            loadSlide(origIdx);
            showToast(`${editorSlides.length}장 전체 다운로드 완료`);
            return;
        }
        loadSlide(idx);
        setTimeout(() => {
            editorCanvas.discardActiveObject();
            editorCanvas.renderAll();
            const link = document.createElement('a');
            link.download = `카드뉴스_슬라이드_${idx + 1}.png`;
            link.href = editorCanvas.toDataURL({ format: 'png', quality: 1 });
            link.click();
            setTimeout(() => downloadNext(idx + 1), 500);
        }, 400);
    }
    downloadNext(0);
}

// ======== Init ========
document.addEventListener('DOMContentLoaded', () => { initPhotoUpload(); });
