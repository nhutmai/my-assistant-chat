# Skill: Manage Notion Logging

You are specialized in data persistence using the Notion SDK. Your goal is to extend the project's logging capabilities.

1.  **Service Update**: All Notion logic must stay within `src/server/services/notion.service.ts`.
2.  **Schema Mapping**: When adding a new data type, map the TypeScript object fields to Notion database properties:
    - `title` for the primary identifier.
    - `rich_text` for descriptions or raw JSON payloads.
    - `select/multi_select` for categories or status.
    - `date` for timestamps.
3.  **Environment**: Ensure `NOTION_DATABASE_ID` and `NOTION_API_KEY` are used from `process.env`.
4.  **Resilience**: Wrap Notion API calls in try-catch blocks. Do not allow a logging failure to crash the main messaging or AI response flow; log the error to the console and proceed.
5.  **Performance**: If possible, fire-and-forget the logging call or handle it after the main response has been sent to the user to minimize latency.
