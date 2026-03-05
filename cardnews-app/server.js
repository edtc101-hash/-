/**
 * Card News Editor — Web Server
 * Express server wrapping the cardnews rendering pipeline
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { parseSpec } = require('./src/parser');
const TemplateEngine = require('./src/template-engine');
const Renderer = require('./src/renderer');
const { renderBlock } = require('./src/blocks');

const app = express();
const PORT = 3333;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'editor')));
app.use('/output', express.static(path.join(__dirname, 'output')));

// Serve existing cardnews assets
app.use('/styles', express.static(path.join(__dirname, 'styles')));

// ─── API: Render card news from JSON spec ───
app.post('/api/render', async (req, res) => {
    const { spec } = req.body;
    if (!spec || !spec.meta || !spec.slides) {
        return res.status(400).json({ error: 'Invalid spec: meta and slides required' });
    }

    try {
        const slug = (spec.meta.title || 'cardnews').replace(/[^a-zA-Z0-9가-힣]/g, '-').substring(0, 30) + '-' + Date.now();
        const outputDir = path.join(__dirname, 'output', slug);

        // Write temp YAML
        const tempYaml = path.join(__dirname, 'output', `${slug}.yaml`);
        fs.mkdirSync(path.dirname(tempYaml), { recursive: true });
        fs.writeFileSync(tempYaml, yaml.dump(spec));

        // Parse spec
        const { meta, slides } = await parseSpec(tempYaml);

        // Setup engine
        const templateEngine = new TemplateEngine({
            templatesDir: path.join(__dirname, 'templates'),
            stylesDir: path.join(__dirname, 'styles'),
            theme: spec.meta.theme || null
        });
        await templateEngine.load();

        const totalSlides = meta.total_slides || slides.length;
        const renderJobs = [];

        for (const slide of slides) {
            if (slide.subtitle_icon) {
                // Skip icon resolving for web
            }
            const blocksHtml = slide.blocks
                .map((block, idx) => {
                    try { return renderBlock(block); }
                    catch (e) { return `<div class="block-error">Block error: ${e.message}</div>`; }
                }).join('\n');

            const html = await templateEngine.renderSlide({ meta, slide, blocksHtml, totalSlides });
            renderJobs.push({ slideNumber: slide.slide, html });
        }

        // Render
        const renderer = new Renderer();
        try {
            const outputPaths = await renderer.renderSlides(renderJobs, outputDir);
            // Clean up temp yaml
            fs.unlinkSync(tempYaml);

            // Return paths
            const images = outputPaths.map((p, i) => ({
                url: `/output/${slug}/${String(i + 1).padStart(2, '0')}.png`,
                slide: i + 1
            }));

            res.json({ success: true, images, slug });
        } finally {
            await renderer.close();
        }
    } catch (err) {
        console.error('Render error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── API: Get available themes ───
app.get('/api/themes', (req, res) => {
    const themesDir = path.join(__dirname, 'styles/themes');
    try {
        const themes = fs.readdirSync(themesDir)
            .filter(f => f.endsWith('.css'))
            .map(f => path.basename(f, '.css'));
        res.json({ themes: ['default', ...themes] });
    } catch {
        res.json({ themes: ['default'] });
    }
});

// ─── API: Get available layouts ───
app.get('/api/layouts', (req, res) => {
    res.json({
        layouts: [
            { id: 'cover', name: '커버', icon: '🎬', description: '첫 슬라이드 (제목 + 부제)' },
            { id: 'problem', name: '문제 제기', icon: '😱', description: '페인포인트 제시' },
            { id: 'explanation', name: '설명', icon: '📖', description: '핵심 내용 설명' },
            { id: 'solution', name: '솔루션', icon: '✅', description: '해결책 제시' },
            { id: 'howto', name: '방법', icon: '🔧', description: '단계별 가이드' },
            { id: 'comparison', name: '비교', icon: '⚖️', description: 'Before/After 비교' },
            { id: 'advanced', name: '심화', icon: '🚀', description: '추가 정보' },
            { id: 'workflow', name: '프로세스', icon: '📋', description: '워크플로우' },
            { id: 'closing', name: '마무리', icon: '🎯', description: '마지막 슬라이드 CTA' }
        ]
    });
});

// ─── Start ───
app.listen(PORT, () => {
    console.log(`\n  🎨 카드뉴스 에디터 서버 실행 중`);
    console.log(`  → http://localhost:${PORT}/\n`);
});
