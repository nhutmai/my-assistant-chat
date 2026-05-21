# Implementation Plan - Refactor UI to Bento Design System

Refactor the frontend UI of the Gemini Bridge application to align with the Bento design system rules. The Bento design system is characterized by a modular grid layout with card-like blocks, clear visual hierarchy, soft spacing, rounded corners, periwinkle/slate blue and soft peach colors, Inter and JetBrains Mono typography, and explicit interaction states.

## Proposed Changes

### Theme & Styling

#### [MODIFY] [index.css](file:///Users/maiminhnhut/desktop/VibeWorkSpace/my-assistant-chat/src/index.css)
- Import `Inter` (sans/display) and `JetBrains Mono` (mono) from Google Fonts.
- Update Tailwind CSS v4 `@theme` configuration to declare Bento color tokens, fonts, and shadows:
  - `--color-primary`: `#FAD4C0` (soft pastel peach/apricot)
  - `--color-secondary`: `#80A1C1` (periwinkle slate blue)
  - `--color-surface`: `#FFF5E6` (warm cream surface)
  - `--color-text`: `#111827` (charcoal text)
  - `--color-bg-paper`: `#F5EFEB` (slightly darker warm beige for page background contrast)
  - `--color-success`: `#16A34A`
  - `--color-warning`: `#D97706`
  - `--color-danger`: `#DC2626`
  - `--font-sans`: `"Inter", ui-sans-serif, system-ui, sans-serif`
  - `--font-mono`: `"JetBrains Mono", ui-monospace, SFMono-Regular, monospace`
  - Remove all Riso offset shadow utilities.
  - Set `body` background to `bg-bg-paper` and default text to `text-text`.

### Components & Pages

#### [MODIFY] [App.tsx](file:///Users/maiminhnhut/desktop/VibeWorkSpace/my-assistant-chat/src/App.tsx)
- Refactor the main layout from Riso's high-contrast style to a modern, soft Bento grid layout.
- **Bento Grid Layout Structure**:
  - The viewport will be divided into modular card-like blocks with soft borders (`border border-secondary/20`), soft shadows (`shadow-sm` or `shadow-md`), and rounded corners (`rounded-2xl`).
- **Header Block**:
  - Rendered as a separate header card in the grid or a beautiful sleek header bar at the top, matching the cream surface (`bg-surface`).
  - Typography: `Inter` for branding, `JetBrains Mono` for system labels.
- **Sidebar / Navigation Card**:
  - Restyled into a bento block with a warm cream surface.
  - Buttons (Console / Logs) will use:
    - Active: soft peach background (`bg-primary`), dark charcoal text (`text-text`), rounded-xl.
    - Hover: slightly darker peach (`hover:bg-[#F8C6AF]`).
    - Focus-visible: outline focus ring.
    - Active: scale-95.
- **Console / Form Block**:
  - An elegant card styled with a cream background, soft borders, and rounded-2xl corners.
  - Textarea: styled with a soft beige background, focus rings, and JetBrains Mono typography.
  - Submit Button: styled as a primary action button in pastel peach (`bg-primary` / `#FAD4C0`), dark charcoal text (`text-text`), and soft rounded-xl corner.
- **Inference Output Block**:
  - A responsive grid item that renders next to or below the console block.
  - Rendered output shown inside a JetBrains Mono code container with smooth border styling.
- **Logs Cards**:
  - Rendered as a beautiful bento list or grid of blocks.
  - Each item card uses cream surface background (`bg-surface`), rounded-xl, and a periwinkle header line.
- **Footer Block**:
  - A clean, soft bar at the bottom with JetBrains Mono typography.
- **Spacing Scale Checklist**:
  - Verify all margins, paddings, gaps use strictly `4/8/12/16/24/32`px spacing scale (Tailwind `p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`).
- **Interaction States Checklist**:
  - Explicit styling for `hover`, `focus-visible`, `active`, and `disabled` states on all interactive elements.

## Verification Plan

### Automated Tests
- Run `npm run lint` to verify that there are no type errors or syntax issues.
- Run `npm run build` to verify compiling Vite application.

### Manual Verification
- Open UI in a browser.
- Verify color contrast (pastel peach contrast with charcoal text, cream cards contrasting against beige background).
- Verify rounded corners (`rounded-2xl` cards, `rounded-xl` buttons).
- Verify spacing scale and bento card layout responsiveness.
- Verify all interactive states for hover/focus/active.
