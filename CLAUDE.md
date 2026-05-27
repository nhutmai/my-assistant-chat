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
- **Documentation**: After completing any feature, bug fix, integration, API change, configuration change, or workflow change, update all related documentation before considering the task done. Review `README.md`, `ARCHITECTURE.md`, `API_DOCUMENTATION.md`, `ROADMAP.md`, `.env.example`, and any task-specific docs affected by the change. When documentation files are updated and the task output includes a browsable documentation artifact, regenerate `markdown-docs.html`; otherwise, keep source Markdown files as the documentation source of truth. If no documentation update is needed, explicitly note that docs were reviewed and why no change was required.
- **Forbidden**: Do not hardcode secrets, do not put logic in controllers, do not omit `.js` imports in server files.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **my-assistant-chat** (281 symbols, 398 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/my-assistant-chat/context` | Codebase overview, check index freshness |
| `gitnexus://repo/my-assistant-chat/clusters` | All functional areas |
| `gitnexus://repo/my-assistant-chat/processes` | All execution flows |
| `gitnexus://repo/my-assistant-chat/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
