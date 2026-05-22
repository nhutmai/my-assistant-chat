# CLAUDE.md

Guidelines for working on the Gemini Bridge project.

## Project Overview
Gemini Bridge is a full-stack application bridging AI inference (Groq/Gemini) with messaging platforms (Telegram/Messenger), featuring persistent activity logging via Notion.

## Technology Stack
- **Frontend**: React 19 + Vite, Tailwind CSS v4.
- **Backend**: Node.js + Express, TypeScript.
- **Integrations**: Notion SDK, Groq/OpenAI SDK, Axios.
- **Deployment**: Vercel.

## Core Development Rules
- **TypeScript**: Always use ES modules with `moduleResolution: "NodeNext"`.
- **Server Imports**: Server-side relative imports MUST include the `.js` extension (e.g., `import X from "./y.js"`).
- **Architecture**:
  - `controllers/`: Keep thin; handle request/response only.
  - `services/`: All business/integration logic.
  - `routes/`: Decoupled mapping to controllers.
- **API**: Use the centralized Axios client in `src/lib/api.ts`. Never use raw `fetch`.
- **Secrets**: Never hardcode. Use `process.env`. Use `.env.example` as a template.
- **Linting**: Run `npm run lint` (`tsc --noEmit`) before any task.

## Bento Design System (Mandatory)
Always apply the Bento design system to all UI tasks:
- **Colors**:
  - Light: Primary `#FAD4C0`, Secondary `#80A1C1`, Surface `#FFF5E6`, Text `#111827`.
  - Dark: Primary `#F8C6AF`, Secondary `#A2BDD6`, Surface `#1E2330`, Text `#F9FAFB`.
- **Spacing**: Scale `4/8/12/16/24/32`px.
- **Layout**: Modular bento grid, rounded corners (`rounded-2xl` for cards, `rounded-xl` for elements).
- **Typography**: `Inter` for text/headings, `JetBrains Mono` for code.
- **Accessibility**: WCAG 2.2 AA compliance is mandatory.

## Workflow
- **Commit**: Keep messages short and imperative.
- **Verification**: Manually test flows using `npm run dev` before submitting.
- **Forbidden**: Do not hardcode secrets, do not put logic in controllers, do not omit `.js` imports in server files.
