# 🌊 FlowState - Modern Landing Page (Light & Dark Modes)

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

*A clean, responsive, and highly interactive landing page template built with pure Vanilla HTML, CSS, and JavaScript. Includes both Light and Dark mode variations.*
</div>

---

## 📸 Preview

<img width="1349" height="3702" alt="image" src="https://github.com/user-attachments/assets/a53fcd6d-1980-4bbf-9141-a4e20887ca7e" />
<img width="1349" height="3686" alt="image" src="https://github.com/user-attachments/assets/f290d5e9-913d-454f-b8af-d0f8f80fa0e4" />

## ✨ Features

This template is designed to be a robust starting point for SaaS, agencies, or personal portfolios. It requires **zero build steps** and **no external frameworks**.

- 🌓 **Dual Themes:** Includes beautifully crafted Light and Dark mode versions.
- 🎨 **Modern UI:** Clean typography, soft diffuse shadows (light), glassmorphism (dark), and vibrant gradients.
- 📱 **Fully Responsive:** Flawless experience across mobile, tablet, and desktop viewports.
- 💰 **Interactive Pricing:** Functional Monthly/Yearly billing toggle that dynamically updates prices via JS.
- 🎭 **Scroll Animations:** Smooth fade-in effects triggered by the Intersection Observer API.
- 🍔 **Mobile Navigation:** Sleek slide-out hamburger menu with smooth transitions.
- 🚀 **Zero Dependencies:** No React, Vue, Bootstrap, or jQuery. Just pure web standards.

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure and accessibility |
| **CSS3** | Styling, CSS Variables, Flexbox, CSS Grid |
| **Vanilla JS** | DOM manipulation, Event listeners, Scroll observers |
| **[FontAwesome 6](https://fontawesome.com/)** | High-quality vector icons |
| **[Google Fonts](https://fonts.google.com/specimen/Inter)** | 'Inter' font family for modern typography |

## 📂 Project Structure

The project is organized into two distinct folders, allowing you to easily choose or compare the Light and Dark themes.

```text
flow-state/
│
├── dark/                       # 🌑 Dark Mode Version
│   ├── index.html              # HTML structure for dark theme
│   ├── style.css               # Dark theme styling & variables
│   └── script.js               # Shared interactivity logic
│
├── light/                      # ☀️ Light Mode Version
│   ├── index.html              # HTML structure for light theme
│   ├── style.css               # Light theme styling & variables
│   └── script.js               # Shared interactivity logic
│
└── README.md                   # You are here!
```

## 📥 Installation

Follow these steps to get the project up and running on your local machine. Because this is a static site, there are no build steps or `node_modules` to install.

### Clone the repository

Open your terminal and run the following command to download the project to your local machine:

```bash
git clone https://github.com/AmiARMiess/flow-state.git
```

Navigate into the newly created project folder:

```bash
cd flow-state
```

### Run locally

Since there is no build process, you can simply open the `index.html` file directly in your web browser. 

* **For Light Mode:** Open the file located at `light/index.html`
* **For Dark Mode:** Open the file located at `dark/index.html`

*(💡 **Pro Tip:** If you are using VS Code, install the **Live Server** extension, right-click on `index.html`, and select "Open with Live Server" to get hot-reloading while you edit).*


## 🎨 Changing Colors

The color palettes for both themes are managed using CSS variables. You can easily customize the colors to match your brand identity by editing the `style.css` file in your chosen theme folder.

### For Light Mode
Open `light/style.css` and locate the `:root` selector at the very top. Modify the variables to change the colors:

```css
:root {
    --bg-color: #FFFFFF;         /* Main page background */
    --surface-color: #F9FAFB;    /* Secondary background (e.g., footer, sections) */
    --text-primary: #111827;     /* Main heading and body text */
    --text-secondary: #6B7280;   /* Muted/subtitle text */
    
    --accent-indigo: #4F46E5;    /* Primary brand color (buttons, links) */
    --accent-pink: #EC4899;      /* Secondary brand color (gradients) */
    --accent-cyan: #06B6D4;      /* Tertiary brand color (icons, highlights) */
}
```

### For Dark Mode
Open `dark/style.css` and locate the `:root` selector. Modify the variables for the dark theme:

```css
:root {
    --bg-color: #09090b;         /* Main dark background */
    --surface-color: #18181b;    /* Secondary dark background */
    --card-bg: rgba(255, 255, 255, 0.03); /* Glassmorphism card background */
    --text-primary: #ffffff;     /* Main text color */
    --text-secondary: #a1a1aa;   /* Muted text color */
    
    --accent-purple: #8b5cf6;    /* Primary brand color */
    --accent-pink: #ec4899;      /* Secondary brand color */
    --accent-blue: #3b82f6;      /* Tertiary brand color */
}
```

*Note: After changing the CSS variables, the buttons, gradients, and text colors will automatically update across the entire page.*
