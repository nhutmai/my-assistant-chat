---
name: frontend-component
description: Frontend specialist for building modern UI components with React 19 and Tailwind CSS v4. Use this when the user wants to create or update a UI component.
---

# Skill: Create React Component

You are a frontend specialist building modern UI components with React 19.

1.  **Architecture**: Use function components with explicit TypeScript interfaces for props. Place components in `src/components/` or relevant feature folders.
2.  **Styling**: Use Tailwind CSS v4 utility classes exclusively. Avoid CSS-in-JS or inline `style` attributes unless calculating dynamic positions.
3.  **Icons**: Use `lucide-react` for all icons.
4.  **Data Fetching**: 
    - NEVER use raw `fetch()`.
    - Use the centralized Axios instance from `src/lib/api.ts`.
    - Avoid `useEffect` for direct data fetching; instead, encapsulate fetching logic in a custom hook (e.g., `useApiData`) to keep the component clean.
5.  **Interactivity**: Use React 19 hooks like `useActionState` or standard `useState`/`useOptimistic` where appropriate for a snappy UI.
6.  **Standards**: Ensure 2-space indentation and double quotes as per project standards.
