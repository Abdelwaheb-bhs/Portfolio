<<<<<<< HEAD

=======
# 🔀 Navigation Mechanism Between Sections (Explanation)

This project uses a **single-page navigation mechanism** (SPA-like behavior) built with **HTML sections + CSS + JavaScript**, not real page navigation.

---

## 1️⃣ The Core Idea (Big Picture)

- The page contains **multiple `<section>` elements**
- **Only one section is visible at a time**
- Navigation buttons **do NOT reload the page**
- Buttons call a JavaScript function that:
  1. Hides all sections
  2. Shows the selected one
  3. Scrolls smoothly to the top

➡️ This simulates navigation **without changing pages**

---

## 2️⃣ HTML Structure: Navigation + Sections

Example from your project (simplified):

```html
<nav>
  <a href="#" onclick="showSection('accueil')">Accueil</a>
  <a href="#" onclick="showSection('quiz')">Quiz</a>
  <a href="#" onclick="showSection('contact')">Contact</a>
</nav>

<section id="accueil" class="active">...</section>
<section id="quiz">...</section>
<section id="contact">...</section>
>>>>>>> 4d830aa (color changed)
