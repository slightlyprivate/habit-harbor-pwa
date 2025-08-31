# Copilot Instructions – Habit Harbor

These are the guardrails and preferences for GitHub Copilot (and any other AI code assistant) when generating code in this repository.

---

## 🎯 Project Context
- Project name: **Habit Harbor**
- Type: **Offline-first PWA**
- Tech Stack: **React + TypeScript + Vite + Tailwind + localForage + Chart.js**
- Goal: Showcase **frontend + offline-first patterns** in a simple, polished portfolio project.

---

## ✅ Coding Style & Conventions
- Use **TypeScript** for all React components (`.tsx`).
- Prefer **functional components + hooks**.
- Use **Tailwind CSS** for styling (no CSS files unless absolutely necessary).
- Keep components **small and composable**.
- Use **async/await**, not `.then()` chaining.
- Use **named exports** (avoid default exports).
- Organize code into:
    /src
    components/ # UI building blocks
    data/ # localForage + Supabase utilities
    pwa/ # service worker, manifest
    hooks/ # custom hooks

---

## 📦 Libraries & Tools
- **Storage:** Use `localforage` for IndexedDB persistence.
- **Charts:** Use `chart.js` (with `react-chartjs-2` if needed).
- **Forms/State:** Use React state and hooks (`useState`, `useEffect`). No Redux.
- **Testing:** Use `vitest` + React Testing Library for basic smoke tests.

---

## 🧩 Components to Prioritize
1. `HabitList` – displays habits + daily checkboxes.
2. `HabitForm` – input to add a new habit.
3. `StreakChart` – visual streak progress.
4. `Header` – title + dark/light mode toggle.
5. `App` – root layout + router (if needed).

---

## 🚫 What NOT To Do
- ❌ Do not use Redux, MobX, or heavyweight state libraries.
- ❌ Do not use MUI, Bootstrap, or other UI kits (Tailwind only).
- ❌ Do not add unnecessary dependencies (keep package.json lean).
- ❌ Do not generate giant “god components” – keep logic modular.
- ❌ Do not use inline styles unless trivial.

---

## 🧭 Best Practices
- Ensure app **works offline** (test via DevTools).
- Wrap all IndexedDB/localForage calls with **error handling**.
- Keep README and docs updated with any new commands or deps.
- Favor **clarity over cleverness** in code.

---

## 📄 Documentation Expectations
- Every component should have a **JSDoc-style comment** at the top explaining its role.
- All public functions/utilities should have a short docstring.
- Update `CHECKLIST.md` as features are completed.

---

## 🧪 Testing Guidance
- Write at least **1 smoke test per component**.
- Example: render `<HabitList />` with mock habits → expect them to appear.

---
