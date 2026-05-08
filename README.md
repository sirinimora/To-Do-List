<div align="center">

# ✅ TaskFlow

### A Beautiful, Production-Grade Task Manager

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-A855F7?style=for-the-badge)](LICENSE)

**TaskFlow** is a sleek, feature-rich task management app built with vanilla HTML, CSS & JavaScript.  
No frameworks. No dependencies. Just fast, beautiful productivity.


---

</div>

## ⚡ Features

<table>
<tr>
<td>

### 🎯 Core
- ✅ Create, edit & delete tasks
- 🔄 Toggle task completion
- 📝 Rich task details (title, description, tags)
- 💾 Persistent `localStorage` — your data stays

</td>
<td>

### 🏷️ Organization
- 📂 Custom categories with colors & icons
- 🔴🟠🟡🟢 Four priority levels
- 🏷️ Tagging system (up to 8 per task)
- 📅 Due dates & time tracking

</td>
</tr>
<tr>
<td>

### 🔍 Navigation
- 🔎 Live search with `⌘K` shortcut
- 📊 Smart filters (Today, Overdue, Priority)
- ↕️ Multi-sort (Date, Priority, A-Z)
- 📁 Category-based views

</td>
<td>

### ✨ Design
- 🌗 Dark & Light theme toggle
- 🫧 Glassmorphism UI with animated orbs
- 🖱️ Drag & drop reordering
- 🎞️ Smooth micro-animations

</td>
</tr>
</table>

---

## 🖼️ Screenshots

<div align="center">

| Dark Mode | Light Mode |
|:---------:|:----------:|
| ![Dark Theme](https://via.placeholder.com/480x300/0f0f1a/6366f1?text=Dark+Theme) | ![Light Theme](https://via.placeholder.com/480x300/f0f0f8/6366f1?text=Light+Theme) |

</div>

> 💡 *Replace the placeholder URLs above with actual screenshots of your running app.*

---

## 🚀 Getting Started

### Prerequisites

All you need is a modern web browser — no `node`, no `npm`, no build tools.

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/taskflow.git

# Navigate into the project
cd taskflow

# Open in your browser
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

Or simply **double-click** `index.html` — it just works.

### Optional: Local Dev Server

For a better dev experience with live reload:

```bash
# Using Python
python -m http.server 3000

# Using Node (npx, no install needed)
npx -y serve .
```

Then visit **[http://localhost:3000](http://localhost:3000)**

---

## 📁 Project Structure

```
taskflow/
├── index.html          # Semantic HTML5 structure & modals
├── style.css           # Complete design system (dark/light themes)
├── app.js              # Application logic, state management & rendering
└── README.md           # You are here
```

| File | Purpose | Size |
|------|---------|------|
| `index.html` | App shell, modals, accessibility markup | ~17 KB |
| `style.css` | Design tokens, components, responsive layout | ~10 KB |
| `app.js` | CRUD, filtering, sorting, drag & drop, persistence | ~10 KB |

---

## 🎨 Design System

### Color Palette

| Token | Dark | Light | Purpose |
|-------|------|-------|---------|
| `--accent` | `#6366f1` | `#6366f1` | Primary actions, links |
| `--accent2` | `#a855f7` | `#a855f7` | Gradient endpoints |
| `--success` | `#22c55e` | `#22c55e` | Complete, low priority |
| `--warning` | `#f59e0b` | `#f59e0b` | High priority |
| `--danger` | `#ef4444` | `#ef4444` | Urgent, delete, overdue |

### Typography

- **Font:** [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)
- **Weights:** 300 · 400 · 500 · 600 · 700 · 800

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Focus search bar |
| `Escape` | Close any open modal |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Why |
|-------|-----------|-----|
| **Structure** | HTML5 | Semantic, accessible markup |
| **Styling** | Vanilla CSS | Custom properties, no dependencies |
| **Logic** | Vanilla JS (ES6+) | Zero-dependency, fast execution |
| **Storage** | localStorage | Offline-first, instant persistence |
| **Fonts** | Google Fonts (Inter) | Modern, clean typography |

</div>

---

## 🧪 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Safari | ✅ Responsive |
| Chrome Android | ✅ Responsive |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to your branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Contribution Guidelines

- Keep it **dependency-free** — vanilla HTML/CSS/JS only
- Follow the existing **code style** and design system
- Ensure **cross-browser** compatibility
- Add **accessible** markup (`aria-*`, semantic elements)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 💎 Acknowledgments

- [Inter Font](https://rsms.me/inter/) by Rasmus Andersson
- Inspired by modern productivity tools like Todoist, TickTick & Things 3

---

<div align="center">

**Built with ❤️**

⭐ Star this repo if you found it useful!

</div>
