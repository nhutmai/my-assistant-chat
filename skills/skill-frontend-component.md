# Create a New React UI Component

Use this skill when creating a new frontend component, screen section, form, panel, widget, or data-driven UI in this React 19 + Vite project.

## Project Rules

- Use React 19 function components.
- Define an explicit TypeScript props interface.
- Use Tailwind CSS v4 utility classes only.
- Do not use inline styles.
- Do not use CSS modules.
- Import icons exclusively from `lucide-react`.
- Use `axios` through the centralized client in `src/lib/api.ts`.
- Never use raw `fetch()`.
- Do not put data-fetching calls directly in `useEffect`.
- Extract data fetching into a custom hook in `src/hooks/`.

## Component Pattern

Create components with explicit props:

```tsx
import { Send } from "lucide-react";

interface MessageComposerProps {
  disabled?: boolean;
  onSubmit: (message: string) => void;
}

export function MessageComposer({ disabled = false, onSubmit }: MessageComposerProps) {
  return (
    <form className="flex items-center gap-2">
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
```

## Data Fetching Pattern

Use the centralized API client.

Correct:

```ts
// src/hooks/useMessages.ts
import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Message {
  id: string;
  text: string;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      try {
        setIsLoading(true);
        const response = await api.get<{ data: Message[] }>("/messages");

        if (isMounted) {
          setMessages(response.data.data);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load messages");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
  };
}
```

Incorrect:

```tsx
useEffect(() => {
  fetch("/api/messages");
}, []);
```

## Styling Rules

Use Tailwind utilities directly in `className`.

Prefer:

```tsx
<div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
```

Avoid:

```tsx
<div style={{ padding: 16 }}>
```

Avoid:

```tsx
import styles from "./Component.module.css";
```

## Icons

Use `lucide-react`:

```tsx
import { Bot, Send, Settings } from "lucide-react";
```

Do not add custom SVG icons unless no Lucide icon fits and the user explicitly needs a custom mark.

## File Placement

Use the existing project structure. Common placements:

```text
src/components/FeatureName.tsx
src/hooks/useFeatureName.ts
src/lib/api.ts
```

If the component is page-specific, place it near similar existing UI files.

## Final Check

Before finishing, verify:

- Component uses a function declaration or named function component.
- Props are typed with an explicit interface.
- Styling uses Tailwind CSS v4 utilities only.
- Icons come from `lucide-react`.
- Data fetching uses the centralized `src/lib/api.ts` client.
- No raw `fetch()` was added.
- Data fetching lives in `src/hooks/`.
- `npm run lint` passes or any failure is reported clearly.
