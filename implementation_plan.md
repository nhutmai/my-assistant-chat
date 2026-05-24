# Implementation Plan - Add Dark Mode to UI (Bento Design System)

Extend the Bento design system refactoring to support a user-toggled Dark Mode. This includes adding dark mode semantic tokens, updating design system docs (DESIGN.md/SKILL.md), updating UI guidelines in AGENTS.md, and adding toggle logic and dark mode styles in App.tsx and index.css.

## Proposed Changes

### Design Documentation & Guidelines

#### [MODIFY] [DESIGN.md](file:///Users/maiminhnhut/desktop/VibeWorkSpace/my-assistant-chat/.agents/skills/bento/DESIGN.md)
- Update color token specifications to include Dark Mode mappings:
  - **Light Mode**:
    - Primary: `#FAD4C0` (soft peach)
    - Secondary: `#80A1C1` (periwinkle slate blue)
    - Surface: `#FFF5E6` (warm cream surface)
    - Text: `#111827` (charcoal text)
    - Background Paper: `#F5EFEB` (beige paper)
  - **Dark Mode**:
    - Primary: `#F8C6AF` (peach highlight)
    - Secondary: `#A2BDD6` (light slate blue)
    - Surface: `#1E2330` (dark slate surface)
    - Text: `#F9FAFB` (cool off-white text)
    - Background Paper: `#11151F` (deep dark blue-gray paper)

#### [MODIFY] [SKILL.md](file:///Users/maiminhnhut/desktop/VibeWorkSpace/my-assistant-chat/.agents/skills/bento/SKILL.md)
- Add guidelines for dark mode token selection, ensuring contrast and accessible colors are maintained when toggled.

#### [MODIFY] [AGENTS.md](file:///Users/maiminhnhut/desktop/VibeWorkSpace/my-assistant-chat/AGENTS.md)
- Add dark mode tokens to `## UI / Design Rules` section.

### Styling & Theme Configuration

#### [MODIFY] [index.css](file:///Users/maiminhnhut/desktop/VibeWorkSpace/my-assistant-chat/src/index.css)
- Define a `.dark` class block inside `@theme` or `@layer base` to override CSS variables for Dark Mode:
  - `--color-primary`: `#F8C6AF`
  - `--color-secondary`: `#A2BDD6`
  - `--color-surface`: `#1E2330`
  - `--color-text`: `#F9FAFB`
  - `--color-bg-paper`: `#11151F`
  - Modify box shadow variables (`--shadow-bento` / `--shadow-bento-hover`) to use dark alpha values (e.g. `rgba(0, 0, 0, 0.4)` or `rgba(162, 189, 214, 0.04)`) in dark mode.

### Application Logic & UI Toggle

#### [MODIFY] [App.tsx](file:///Users/maiminhnhut/desktop/VibeWorkSpace/my-assistant-chat/src/App.tsx)
- Add dark mode state management:
  - Check localStorage / system preferences (`window.matchMedia("(prefers-color-scheme: dark)").matches`) on mount.
  - Expose a `darkMode` state.
  - Update `document.documentElement.classList` (`add('dark')` / `remove('dark')`) reactively when `darkMode` changes.
- Add a theme toggle button in the **Header Bento Card**:
  - Icon: Lucide `Sun` when dark mode is active, `Moon` when light mode is active.
  - Bento styling: `bg-surface border border-secondary/20 p-2.5 rounded-xl hover:bg-primary/20 hover:border-primary/20 active:scale-95 transition-all text-text`.
- Ensure all styled elements (textareas, buttons, logs, code blocks) adapt beautifully to the dark theme variables.

## Verification Plan

### Automated Tests
- Run `npm run lint` to verify that there are no type errors or syntax issues.
- Run `npm run build` to verify compiling Vite application.

### Manual Verification
- Verify that toggling dark mode updates the `document.documentElement` class list to include/exclude `dark`.
- Inspect the visual elements in both light and dark modes to check contrast, readability, and soft borders.
- Check that system preference defaults are honored if localStorage is empty.
