/**
 * =====================================================================
 * LUMEN BIOPHOTONICS — script.js
 * =====================================================================
 * Módulos:
 *   1. initMobileNav()        → hamburger, menú móvil, Escape, clic fuera
 *   2. initNavbarScroll()     → clase .scrolled al hacer scroll
 *   3. initScrollAnimations() → IntersectionObserver para .fade-in
 *   4. initExplorer()         → explorador interactivo de luz en tejido:
 *        · Sliders de λ, μa, μ's
 *        · Selector de tipo de tejido
 *        · Métricas calculadas (δ, MFP, régimen)
 *        · Visualización en Canvas (modelo conceptual simplificado)
 *
 * NOTA IMPORTANTE:
 *   El explorador implementa un MODELO CONCEPTUAL SIMPLIFICADO basado
 *   en la aproximación de difusión (δ = 1/√(3·μa·μt')). NO es una
 *   simulación Monte Carlo validada ni una herramienta clínica.
 * =====================================================================
 */

'use strict';

/* ====================================================================
   PUNTO DE ENTRADA
==================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initNavbarScroll();
    initScrollAnimations();
    initExplorer();
});


/* ====================================================================
   1. MENÚ HAMBURGER
   Controla: #hamburger, #navLinks (.active)
   Accesibilidad: aria-expanded, aria-label, Escape, clic exterior
==================================================================== */
function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    const navIcon = hamburger.querySelector('i');

    function openMenu() {
        navLinks.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Cerrar menú de navegación');
        if (navIcon) { navIcon.classList.replace('fa-bars', 'fa-xmark'); }
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú de navegación');
        if (navIcon) { navIcon.classList.replace('fa-xmark', 'fa-bars'); }
    }

    hamburger.addEventListener('click', () => {
        navLinks.classList.contains('active') ? closeMenu() : openMenu();
    });

    // Cierra al pulsar un enlace del menú
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Escape cierra el menú y devuelve el foco
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
            hamburger.focus();
        }
    });

    // Clic fuera del menú lo cierra
    document.addEventListener('click', e => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            closeMenu();
        }
    });
}


/* ====================================================================
   2. NAVBAR SCROLL
   Añade .scrolled al header cuando scrollY > 50px
==================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const THRESHOLD = 50;

    function update() {
        navbar.classList.toggle('scrolled', window.scrollY > THRESHOLD);
    }

    window.addEventListener('scroll', update, { passive: true });
    update(); // Estado inicial
}


/* ====================================================================
   3. ANIMACIONES DE ENTRADA (IntersectionObserver)
   .fade-in → .fade-in.visible cuando entra al 12% del viewport
==================================================================== */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
}


/* ====================================================================
   4. EXPLORADOR INTERACTIVO
   ====================================================================
   Modelo óptico simplificado (aproximación de difusión):
     · Coeficiente efectivo de atenuación:
         μeff = √(3 · μa · (μa + μ's))
     · Profundidad de penetración (δ):
         δ = 1 / μeff  [mm]
     · Camino libre medio efectivo (MFP):
         MFP = 1 / (μa + μ's)  [mm]

   Visualización Canvas:
     - Tejido estratificado (epidermis, dermis, subcutáneo)
     - Haz gaussiano incidente (color según λ)
     - Zona de fluencia elíptica (proporcional a δ)
     - Rayos de dispersión aleatoria atenuados según μ's
   ==================================================================== */
function initExplorer() {
    /* ── Elementos del DOM ─────────────────────────────────────── */
    const canvas        = document.getElementById('tissue-canvas');
    if (!canvas) return;
    const ctx           = canvas.getContext('2d');

    const sliderWL      = document.getElementById('wavelength-slider');
    const sliderAbs     = document.getElementById('absorption-slider');
    const sliderScat    = document.getElementById('scattering-slider');
    const displayWL     = document.getElementById('wavelength-display');
    const displayAbs    = document.getElementById('absorption-display');
    const displayScat   = document.getElementById('scattering-display');
    const metricDepth   = document.getElementById('metric-depth');
    const metricMFP     = document.getElementById('metric-mfp');
    const metricRegime  = document.getElementById('metric-regime');
    const tissueButtons = document.querySelectorAll('.tissue-btn');

    if (!sliderWL || !sliderAbs || !sliderScat) return;

    /* ── Preajustes por tipo de tejido (valores típicos literatura) ─ */
    const TISSUE_PRESETS = {
        soft:   { mua: 5,  mus: 5  },  // μa~0.10, μ's~1.0 mm⁻¹
        skin:   { mua: 12, mus: 8  },  // μa~0.24, μ's~1.6 mm⁻¹
        muscle: { mua: 3,  mus: 7  },  // μa~0.06, μ's~1.4 mm⁻¹
    };

    // Estado actual
    let state = {
        wavelength: 660,  // nm
        mua: 0.10,        // mm⁻¹ (absorción)
        mus: 1.00,        // mm⁻¹ (dispersión reducida)
        tissue: 'soft',
    };

    /* ── Conversiones de sliders a unidades físicas ─────────────── */
    // μa: slider 1–20 → 0.05–1.00 mm⁻¹ (escala lineal / 20)
    function sliderToMua(v) { return +(v / 20).toFixed(2); }
    // μ's: slider 1–10 → 0.5–3.0 mm⁻¹ (escala lineal)
    function sliderToMus(v) { return +(0.5 + (v - 1) * (2.5 / 9)).toFixed(2); }

    /* ── Modelo de difusión ─────────────────────────────────────── */
    function computeMetrics(mua, mus) {
        const mut  = mua + mus;                       // mm⁻¹
        const mueff = Math.sqrt(3 * mua * mut);       // mm⁻¹
        const delta = mueff > 0 ? (1 / mueff) : 99;  // mm
        const mfp   = mut > 0   ? (1 / mut)   : 99;  // mm
        const regime = mua < 0.1 * mus ? 'Difusión' : 'Transición';
        return { mueff, delta, mfp, regime };
    }

    /* ── Color de la luz según longitud de onda ──────────────────── */
    function wavelengthToColor(lambda) {
        let r = 0, g = 0, b = 0;
        if      (lambda >= 380 && lambda < 440) { r = (440 - lambda) / 60; g = 0; b = 1; }
        else if (lambda >= 440 && lambda < 490) { r = 0; g = (lambda - 440) / 50; b = 1; }
        else if (lambda >= 490 && lambda < 510) { r = 0; g = 1; b = (510 - lambda) / 20; }
        else if (lambda >= 510 && lambda < 580) { r = (lambda - 510) / 70; g = 1; b = 0; }
        else if (lambda >= 580 && lambda < 645) { r = 1; g = (645 - lambda) / 65; b = 0; }
        else if (lambda >= 645 && lambda <= 750) { r = 1; g = 0; b = 0; }
        else if (lambda > 750) { r = 0.6; g = 0; b = 0; } // NIR invisible → rojizo oscuro
        else { r = 0.6; g = 0; b = 0.8; } // UV

        const rInt = Math.round(r * 255);
        const gInt = Math.round(g * 255);
        const bInt = Math.round(b * 255);
        return { r: rInt, g: gInt, b: bInt, hex: `rgb(${rInt},${gInt},${bInt})` };
    }

    /* ── Renderizado en Canvas ───────────────────────────────────── */
    const W = canvas.width;
    const H = canvas.height;

    // Escala visual: 1 mm ≈ 32px en canvas
    const MM_TO_PX = 32;

    // Generador de números pseudo-aleatorios con semilla (para rayos consistentes)
    function seededRandom(seed) {
        const x = Math.sin(seed + 1) * 10000;
        return x - Math.floor(x);
    }

    function drawCanvas() {
        const { wavelength, mua, mus } = state;
        const { delta, mfp } = computeMetrics(mua, mus);
        const color = wavelengthToColor(wavelength);

        ctx.clearRect(0, 0, W, H);

        /* 1. Fondo — tejido (azul marino) */
        ctx.fillStyle = '#101D30';
        ctx.fillRect(0, 0, W, H);

        /* 2. Capas del tejido */
        const surfaceY = 80; // px — superficie del tejido

        // Epidermis
        ctx.fillStyle = 'rgba(169,182,199,0.12)';
        ctx.fillRect(0, surfaceY, W, 22);

        // Dermis
        ctx.fillStyle = 'rgba(169,182,199,0.07)';
        ctx.fillRect(0, surfaceY + 22, W, 58);

        // Subcutáneo (más oscuro)
        ctx.fillStyle = 'rgba(16,29,48,0.5)';
        ctx.fillRect(0, surfaceY + 80, W, H - surfaceY - 80);

        // Etiquetas de capas
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(169,182,199,0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('epidermis', W - 12, surfaceY + 16);
        ctx.fillText('dermis', W - 12, surfaceY + 58);
        ctx.fillText('subcutáneo', W - 12, surfaceY + 110);

        /* 3. Línea de superficie */
        ctx.strokeStyle = 'rgba(169,182,199,0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(0, surfaceY);
        ctx.lineTo(W, surfaceY);
        ctx.stroke();
        ctx.setLineDash([]);

        const beamCenterX = W / 2;

        /* 4. Zona de fluencia (elipse conceptual) */
        const deltaInPx = Math.min(delta * MM_TO_PX, H - surfaceY - 20);
        const fluxW     = Math.min(deltaInPx * 0.8 + 40, W * 0.7);
        const fluxH     = deltaInPx;

        const grad = ctx.createRadialGradient(
            beamCenterX, surfaceY + fluxH * 0.4, 0,
            beamCenterX, surfaceY + fluxH * 0.4, Math.max(fluxW, fluxH)
        );
        grad.addColorStop(0,   `rgba(${color.r},${color.g},${color.b},0.18)`);
        grad.addColorStop(0.5, `rgba(${color.r},${color.g},${color.b},0.07)`);
        grad.addColorStop(1,   `rgba(${color.r},${color.g},${color.b},0)`);

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(beamCenterX, surfaceY + fluxH * 0.4, fluxW / 2, fluxH, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        /* 5. Rayos de dispersión (basados en μ's) */
        const numRays = Math.max(4, Math.min(12, Math.round(mus * 6)));
        const rayAlpha = 0.25 + (mus / 3) * 0.2;
        const rayDepth = fluxH * 0.75;

        for (let i = 0; i < numRays; i++) {
            const seed      = i * 37 + Math.floor(mus * 10);
            const angle     = (seededRandom(seed) - 0.5) * Math.PI * 0.8;
            const length    = rayDepth * (0.4 + seededRandom(seed + 1) * 0.5);
            const startX    = beamCenterX + (seededRandom(seed + 2) - 0.5) * 30;
            const startY    = surfaceY + 10 + seededRandom(seed + 3) * 30;
            const endX      = startX + Math.sin(angle) * length;
            const endY      = startY + Math.cos(angle) * length;

            const rayGrad = ctx.createLinearGradient(startX, startY, endX, endY);
            rayGrad.addColorStop(0,   `rgba(${color.r},${color.g},${color.b},${rayAlpha})`);
            rayGrad.addColorStop(0.5, `rgba(${color.r},${color.g},${color.b},${rayAlpha * 0.5})`);
            rayGrad.addColorStop(1,   `rgba(${color.r},${color.g},${color.b},0)`);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = rayGrad;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.restore();
        }
        ctx.setLineDash([]);

        /* 6. Haz principal incidente (gaussiano) */
        const beamTopY = 0;
        const beamBotY = surfaceY + 4;
        const beamW    = 22;

        const beamGrad = ctx.createLinearGradient(beamCenterX - beamW, beamTopY, beamCenterX + beamW, beamTopY);
        beamGrad.addColorStop(0,   `rgba(${color.r},${color.g},${color.b},0)`);
        beamGrad.addColorStop(0.3, `rgba(${color.r},${color.g},${color.b},0.8)`);
        beamGrad.addColorStop(0.5, `rgba(${color.r},${color.g},${color.b},1)`);
        beamGrad.addColorStop(0.7, `rgba(${color.r},${color.g},${color.b},0.8)`);
        beamGrad.addColorStop(1,   `rgba(${color.r},${color.g},${color.b},0)`);

        const beamVertGrad = ctx.createLinearGradient(0, beamTopY, 0, beamBotY);
        beamVertGrad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0.9)`);
        beamVertGrad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0.5)`);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        // Núcleo del haz
        ctx.fillStyle = beamVertGrad;
        ctx.beginPath();
        ctx.moveTo(beamCenterX - beamW, beamTopY);
        ctx.lineTo(beamCenterX + beamW, beamTopY);
        ctx.lineTo(beamCenterX + 12, beamBotY);
        ctx.lineTo(beamCenterX - 12, beamBotY);
        ctx.closePath();
        ctx.fill();

        // Halo del haz
        const haloGrad = ctx.createLinearGradient(beamCenterX - beamW * 2, 0, beamCenterX + beamW * 2, 0);
        haloGrad.addColorStop(0,   `rgba(${color.r},${color.g},${color.b},0)`);
        haloGrad.addColorStop(0.35, `rgba(${color.r},${color.g},${color.b},0.15)`);
        haloGrad.addColorStop(0.5, `rgba(${color.r},${color.g},${color.b},0.25)`);
        haloGrad.addColorStop(0.65, `rgba(${color.r},${color.g},${color.b},0.15)`);
        haloGrad.addColorStop(1,   `rgba(${color.r},${color.g},${color.b},0)`);

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.moveTo(beamCenterX - beamW * 2, beamTopY);
        ctx.lineTo(beamCenterX + beamW * 2, beamTopY);
        ctx.lineTo(beamCenterX + 22, beamBotY);
        ctx.lineTo(beamCenterX - 22, beamBotY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        /* 7. Punto de mayor fluencia */
        const dotY = surfaceY + Math.min(deltaInPx * 0.35, H - surfaceY - 40);
        const dotR = 5;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const dotGrad = ctx.createRadialGradient(beamCenterX, dotY, 0, beamCenterX, dotY, dotR * 4);
        dotGrad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0.9)`);
        dotGrad.addColorStop(0.4, `rgba(${color.r},${color.g},${color.b},0.3)`);
        dotGrad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
        ctx.fillStyle = dotGrad;
        ctx.beginPath();
        ctx.arc(beamCenterX, dotY, dotR * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        /* 8. Anotaciones métricas en el canvas */
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(169,182,199,0.6)';

        // Flecha de profundidad δ
        if (deltaInPx > 30) {
            ctx.strokeStyle = 'rgba(169,182,199,0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(beamCenterX + 32, surfaceY);
            ctx.lineTo(beamCenterX + 32, surfaceY + deltaInPx);
            ctx.stroke();
            ctx.setLineDash([]);

            // Etiqueta δ
            const labelY = surfaceY + deltaInPx * 0.5;
            ctx.fillStyle = 'rgba(185,67,74,0.8)';
            ctx.fillText(`δ ≈ ${delta.toFixed(1)} mm`, beamCenterX + 38, labelY + 4);
        }

        /* 9. Etiqueta del haz (λ) */
        ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},0.85)`;
        ctx.textAlign = 'center';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`${wavelength} nm`, beamCenterX, 18);

        /* 10. Fuente de luz (pequeño rectángulo) */
        const srcW = 44, srcH = 8, srcX = beamCenterX - srcW / 2;
        const srcGrad = ctx.createLinearGradient(srcX, 22, srcX + srcW, 22);
        srcGrad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0)`);
        srcGrad.addColorStop(0.5, `rgba(${color.r},${color.g},${color.b},0.9)`);
        srcGrad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
        ctx.fillStyle = srcGrad;
        ctx.beginPath();
        ctx.roundRect(srcX, 22, srcW, srcH, 4);
        ctx.fill();
    }

    /* ── Actualización de la UI ──────────────────────────────────── */
    function updateUI() {
        const wl  = parseInt(sliderWL.value);
        const mua = sliderToMua(parseInt(sliderAbs.value));
        const mus = sliderToMus(parseInt(sliderScat.value));

        // Actualiza estado
        state.wavelength = wl;
        state.mua = mua;
        state.mus = mus;

        // Actualiza displays de texto
        displayWL.textContent   = `${wl} nm`;
        displayAbs.textContent  = `${mua.toFixed(2)} mm⁻¹`;
        displayScat.textContent = `${mus.toFixed(2)} mm⁻¹`;

        // Actualiza aria-valuenow del slider de longitud de onda
        sliderWL.setAttribute('aria-valuenow', wl);
        sliderWL.setAttribute('aria-valuetext', `${wl} nanómetros`);

        // Calcula métricas
        const { delta, mfp, regime } = computeMetrics(mua, mus);

        if (metricDepth)  metricDepth.textContent  = `${delta.toFixed(1)} mm`;
        if (metricMFP)    metricMFP.textContent    = `${mfp.toFixed(2)} mm`;
        if (metricRegime) metricRegime.textContent = regime;

        // Redibuja el canvas
        drawCanvas();
    }

    /* ── Eventos de los sliders ──────────────────────────────────── */
    sliderWL.addEventListener('input',  updateUI);
    sliderAbs.addEventListener('input', updateUI);
    sliderScat.addEventListener('input', updateUI);

    /* ── Selector de tipo de tejido ──────────────────────────────── */
    tissueButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tissue = btn.dataset.tissue;
            const preset = TISSUE_PRESETS[tissue];
            if (!preset) return;

            // Actualiza botones activos
            tissueButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');

            // Aplica preajuste en los sliders
            sliderAbs.value  = preset.mua;
            sliderScat.value = preset.mus;
            state.tissue = tissue;

            updateUI();
        });

        // Teclado: permite activar con Enter o Space
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    /* ── Renderizado responsivo ──────────────────────────────────── */
    function resizeCanvas() {
        const wrapper = canvas.parentElement;
        if (!wrapper) return;
        // Ajusta el tamaño del canvas al contenedor manteniendo aspect ratio
        const displayW = wrapper.clientWidth;
        // El canvas HTML tiene width=480 height=400 → ratio 1.2
        canvas.style.height = `${(displayW / 1.2)}px`;
    }

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement);
    resizeCanvas();

    /* ── Render inicial ──────────────────────────────────────────── */
    updateUI();
}