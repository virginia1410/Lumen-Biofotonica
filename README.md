# 🔬 LUMEN BIOPHOTONICS — Luz, Tejido y Tecnología Biomédica

Es una plataforma educativa interactiva dedicada a la exploración y visualización conceptual de los principios ópticos que rigen la interacción entre la luz y los tejidos biológicos, enfocándose en sus fundamentos dentro de la ingeniería biomédica y la fotobiomodulación (FBM).
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/d6ad9af3-2dc1-444a-bd35-fe1f6d41d76b" />




 1. Sección Hero & Navegación Principal
Presentación principal con simulación conceptual SVG de dispersión fotónica en tejido estratificado.
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/89bb4d2b-e1e5-4747-b9ba-566943080eca" />


 
 3. Fundamentos Ópticos & Explorador Interactivo
Explicación de coeficientes e interfaz interactiva con controles deslizantes para simular la profundidad de penetración ($\delta$) en tiempo real sobre el lienzo canvas.
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/ed221ab2-c9b2-4d3d-a9ea-956bc607a549" />


 ⚡ Características Interactivas

* **🎛️ Explorador Óptico con Canvas HTML5:**
  * Ajuste dinámico de la longitud de onda entre 400 nm y 1000 nm.
  * Modificación interactiva de los coeficientes de absorción ($\mu_a$) y dispersión reducida ($\mu'_s$).
  * Conmutador de tipos de tejido (Blando, Piel, Músculo) con presets calculados mediante modelos físicos simplificados.
  * Cálculo automático en vivo de la profundidad de penetración ($\delta$), camino libre medio efectivo (MFP) y régimen óptico.

  🌊 Animaciones SVG Dinámicas:
  * Diagrama vectorial en capas tisulares con representación de dispersión y absorción fotónica.

* **📱 Diseño Responsivo y Accesible:**
  * Navegación móvil optimizada .
  * Accesibilidad integrada con atributos ARIA para usuarios de lectores de pantalla.
  * Tema visual oscuro (Dark Mode) técnico ajustado para visualización óptica prolongada.



🛠️ Tecnologías y Arquitectura

El desarrollo de este proyecto se realizó con código nativo, garantizando máximo rendimiento y compatibilidad sin dependencias externas pesadas:

* **HTML5 Semántico:** Estructura optimizada para motores de búsqueda (SEO) y accesibilidad (`<main>`, `<section>`, `<article>`, atributos `aria-*`).
* **CSS3 Personalizado (Custom Properties):** Maquetación flexible mediante CSS Grid y Flexbox, efectos glassmorphism, tipografías técnicas (*Space Grotesk*, *Inter*, *JetBrains Mono*).
* **JavaScript (ES6+):** Lógica modular encargada de:
  * Renderizado dinámico en Canvas HTML2D.
  * Gestión de eventos de UI (`IntersectionObserver` para animaciones *fade-in*).
  * Cálculos matemáticos basados en la aproximación de difusión: $\delta = \frac{1}{\sqrt{3 \cdot \mu_a \cdot (\mu_a + \mu'_s)}}$.

---

## 📂 Estructura del Proyecto

```text
├── assets/                  # Recurso de imágenes y avatares del equipo
│   ├── diego-png.png
│   ├── lisa-png.png
│   └── vanessa-png.png
├── index.html               # Documento principal HTML5
├── script.js                # Lógica interactiva y motor gráfico Canvas
├── style.css                # Estilos, variables y maquetación responsiva
├── LICENSE                  # Licencia MIT del repositorio
└── README.md                # Documentación del proyecto

👥 Equipo de Trabajo

Este trabajo fue desarrollado en el marco académico de la asignatura Programación 2:

Vanessa Morales (@virginia1410) — Estructura HTML, Lógica de interactividad y Accesibilidad.

Diego Ferrer (@Diego-F18) — Diseño visual, Maquetación CSS y Hoja de estilos.

Lisamnys Cordero — Investigación científica, Redacción del contenido y Bibliografía.

📜 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más información.
