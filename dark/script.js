/**
 * =====================================================================
 * FlowState — script.js
 * =====================================================================
 * Módulos de interactividad:
 *   1. initMobileNav()      → Toggle del menú hamburger en móvil
 *   2. initNavbarScroll()   → Efecto de navbar al hacer scroll
 *   3. initScrollAnimations() → Animaciones de aparición con IntersectionObserver
 *   4. initBillingToggle()  → Cambio dinámico de precios mensual/anual
 *   5. initThemeToggle()    → Alternancia light/dark con persistencia en localStorage
 *
 * Convenciones:
 *   · Cada función init se llama solo una vez al cargar el DOM.
 *   · Los selectores usan IDs cuando existe un único elemento,
 *     y clases/atributos cuando hay múltiples.
 *   · aria-* se actualiza programáticamente para mantener accesibilidad.
 * =====================================================================
 */

'use strict';

/* =====================================================================
   PUNTO DE ENTRADA — espera a que el DOM esté completamente cargado
===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initNavbarScroll();
    initScrollAnimations();
    initBillingToggle();
    initThemeToggle();
});


/* =====================================================================
   1. MENÚ HAMBURGER (NAVEGACIÓN MÓVIL)
   ─────────────────────────────────────
   Elementos del HTML que controla:
     · #hamburger      → botón de apertura/cierre
     · #navLinks       → menú de navegación
   
   Clases CSS que añade/quita el compañero:
     · .active         → en #navLinks, muestra el menú desplegado
   
   Atributos de accesibilidad que gestiona:
     · aria-expanded   → "true" cuando el menú está abierto
     · aria-label      → cambia entre "Abrir" y "Cerrar" menú
===================================================================== */
function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    // Guarda una referencia al ícono para cambiar entre fa-bars / fa-xmark
    const navIcon = hamburger?.querySelector('i');

    if (!hamburger || !navLinks) return; // Salida segura si los elementos no existen

    /**
     * Abre o cierra el menú móvil y actualiza el estado de accesibilidad.
     */
    function toggleMenu() {
        const isOpen = navLinks.classList.toggle('active');

        // Actualiza aria-expanded para lectores de pantalla
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        hamburger.setAttribute(
            'aria-label',
            isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
        );

        // Alterna el ícono visualmente
        if (navIcon) {
            navIcon.classList.toggle('fa-bars', !isOpen);
            navIcon.classList.toggle('fa-xmark', isOpen);
        }
    }

    /**
     * Cierra el menú y restaura el estado inicial.
     * Se usa al hacer clic en un enlace o al presionar Escape.
     */
    function closeMenu() {
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú de navegación');

        if (navIcon) {
            navIcon.classList.add('fa-bars');
            navIcon.classList.remove('fa-xmark');
        }
    }

    // Evento principal del botón hamburger
    hamburger.addEventListener('click', toggleMenu);

    // Cierra el menú al pulsar cualquier enlace de la nav
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Cierra el menú al presionar la tecla Escape (accesibilidad de teclado)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
            hamburger.focus(); // Devuelve el foco al botón que abrió el menú
        }
    });

    // Cierra el menú al hacer clic fuera de él
    document.addEventListener('click', (e) => {
        const clickedOutside = !hamburger.contains(e.target) && !navLinks.contains(e.target);
        if (clickedOutside && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });
}


/* =====================================================================
   2. EFECTO DE NAVBAR AL HACER SCROLL
   ─────────────────────────────────────
   Elementos del HTML que controla:
     · .navbar / #navbar → barra de navegación superior
   
   Clases CSS que añade/quita el compañero:
     · .scrolled → activa sombra y fondo sólido/difuminado en la navbar
===================================================================== */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const SCROLL_THRESHOLD = 50; // px desde el top para activar el efecto

    function handleScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
    }

    // Usa passive:true para mejorar el rendimiento del scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Evalúa el estado al cargar la página (por si el usuario recargó con scroll)
    handleScroll();
}


/* =====================================================================
   3. ANIMACIONES DE APARICIÓN (INTERSECTION OBSERVER)
   ─────────────────────────────────────────────────────
   Elementos del HTML que controla:
     · .fade-in → cualquier elemento que debe aparecer al entrar en viewport
   
   Clases CSS que añade el compañero:
     · .visible → estado final visible del elemento (opacity:1, translateY:0, etc.)
   
   Nota: observer.unobserve() libera el observador tras animar cada elemento,
   evitando procesamiento innecesario.
===================================================================== */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Deja de observar tras animar
                }
            });
        },
        {
            threshold: 0.15,  // Se dispara cuando el 15% del elemento es visible
            rootMargin: '0px' // Sin margen adicional
        }
    );

    fadeElements.forEach(el => observer.observe(el));
}


/* =====================================================================
   4. TOGGLE DE FACTURACIÓN (MENSUAL / ANUAL)
   ────────────────────────────────────────────
   Elementos del HTML que controla:
     · #billing-switch   → checkbox que activa el modo anual
     · #monthlyLabel     → etiqueta "Mensual"
     · #yearlyLabel      → etiqueta "Anual"
     · .price-amount     → spans con data-monthly y data-yearly
   
   Atributos de datos usados:
     · data-monthly="XX" → precio mensual
     · data-yearly="XX"  → precio anual
   
   Atributos de accesibilidad que gestiona:
     · aria-checked      → en el input[role="switch"]
     · aria-label        → en .price-amount se actualiza con el precio actual
===================================================================== */
function initBillingToggle() {
    const billingSwitch  = document.getElementById('billing-switch');
    const monthlyLabel   = document.getElementById('monthlyLabel');
    const yearlyLabel    = document.getElementById('yearlyLabel');
    const priceAmounts   = document.querySelectorAll('.price-amount[data-monthly]');

    if (!billingSwitch) return;

    /**
     * Actualiza los precios y etiquetas según el estado del toggle.
     * @param {boolean} isYearly - true si el ciclo es anual
     */
    function updatePricing(isYearly) {
        // Actualiza etiquetas activas
        monthlyLabel?.classList.toggle('active', !isYearly);
        yearlyLabel?.classList.toggle('active', isYearly);

        // Actualiza aria-checked en el switch para lectores de pantalla
        billingSwitch.setAttribute('aria-checked', isYearly ? 'true' : 'false');

        // Actualiza el texto de cada precio y su aria-label
        priceAmounts.forEach(el => {
            const monthly = el.dataset.monthly;
            const yearly  = el.dataset.yearly;
            const newPrice = isYearly ? yearly : monthly;

            el.textContent = newPrice;
            el.setAttribute(
                'aria-label',
                `Precio: ${newPrice} dólares al mes${isYearly ? ' (facturado anualmente)' : ''}`
            );
        });
    }

    // Escucha cambios en el toggle
    billingSwitch.addEventListener('change', (e) => {
        updatePricing(e.target.checked);
    });

    // También permite hacer clic en las etiquetas de texto para alternar
    monthlyLabel?.addEventListener('click', () => {
        billingSwitch.checked = false;
        updatePricing(false);
    });

    yearlyLabel?.addEventListener('click', () => {
        billingSwitch.checked = true;
        updatePricing(true);
    });

    // Inicializa con el estado por defecto (mensual)
    updatePricing(billingSwitch.checked);
}


/* =====================================================================
   5. ALTERNANCIA DE TEMA LIGHT / DARK
   ─────────────────────────────────────
   Cómo funciona:
     · Lee/escribe el tema en localStorage bajo la clave 'flowstate-theme'.
     · Aplica el tema al atributo data-theme del <html>:
         - data-theme="light"  → tema claro
         - data-theme="dark"   → tema oscuro
     · Si no hay preferencia guardada, usa la preferencia del sistema
       (prefers-color-scheme) como valor por defecto.
   
   Integración con CSS del compañero:
     El compañero debe usar selectores como:
       html[data-theme="dark"] { ... }
       html[data-theme="light"] { ... }
     o variables CSS que cambien según el atributo:
       :root { --bg: #fff; }
       [data-theme="dark"] { --bg: #0d0d0d; }
   
   Elementos HTML relacionados (opcionales — si el compañero quiere añadir un botón):
     · #theme-toggle → botón flotante para cambiar de tema manualmente
       Si no existe en el HTML, esta función simplemente aplica el tema del sistema.
===================================================================== */
function initThemeToggle() {
    const STORAGE_KEY = 'flowstate-theme';
    const htmlEl      = document.documentElement; // <html>
    const toggleBtn   = document.getElementById('theme-toggle');

    /**
     * Determina el tema inicial:
     * 1. Preferencia guardada en localStorage
     * 2. Preferencia del sistema operativo
     * 3. 'light' como fallback
     */
    function getInitialTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;

        // Detecta la preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }

    /**
     * Aplica un tema al documento y actualiza el botón de alternancia.
     * @param {string} theme - 'light' | 'dark'
     */
    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Actualiza el botón de toggle si existe
        if (toggleBtn) {
            const isDark = theme === 'dark';
            const icon   = toggleBtn.querySelector('i');

            toggleBtn.setAttribute(
                'aria-label',
                isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
            );

            if (icon) {
                // fa-sun para oscuro (el sol indica "ir a modo claro")
                // fa-moon para claro (la luna indica "ir a modo oscuro")
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                icon.setAttribute('aria-hidden', 'true');
            }
        }
    }

    // Aplica el tema inicial al cargar
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // Configura el botón de toggle (si existe en el HTML)
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme     = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // Escucha cambios en la preferencia del sistema en tiempo real
    // (útil si el usuario cambia el modo del SO mientras navega)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Solo reacciona si el usuario no ha guardado preferencia manual
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}