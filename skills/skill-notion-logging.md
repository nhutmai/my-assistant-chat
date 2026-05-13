# Add Notion Logging for a New Data Type

Use this skill when adding Notion logging for a new kind of event, message, request, result, or business object.

## Project Rules

- Update `src/server/services/notion.service.ts` only for Notion logging behavior.
- Do not put Notion API logic in controllers.
- Read `NOTION_DATABASE_ID` from `process.env`.
- Never hardcode Notion secrets or database IDs.
- Logging failures must never break the main API response.
- Use `.js` extensions on server-side relative imports if adding imports.
- Keep logging async and non-blocking when appropriate.

## Required Implementation Steps

1. Inspect `src/server/services/notion.service.ts`.

   Follow the existing Notion client setup, helper functions, and page creation pattern.

2. Add or extend a logging function for the new data type.

   Example:

   ```ts
   export async function logSupportMessageToNotion(input: SupportMessageLog): Promise<void> {
     const databaseId = process.env.NOTION_DATABASE_ID;

     if (!databaseId) {
       console.warn("NOTION_DATABASE_ID is not configured; skipping Notion logging");
       return;
     }

     try {
       await notion.pages.create({
         parent: {
           database_id: databaseId,
         },
         properties: {
           Name: {
             title: [
               {
                 text: {
                   content: input.title,
                 },
               },
             ],
           },
           Message: {
             rich_text: [
               {
                 text: {
                   content: input.message,
                 },
               },
             ],
           },
           Count: {
             number: input.count,
           },
         },
       });
     } catch (error) {
       console.error("Failed to log support message to Notion:", error);
     }
   }
   ```

3. Map fields to correct Notion property types.

   Common mappings:

   ```text
   string identifier or title -> title
   normal string text -> rich_text
   number -> number
   boolean -> checkbox
   date string or Date -> date
   enum/status -> select or status
   URL -> url
   email -> email
   phone -> phone_number
   array of labels -> multi_select
   ```

4. Make failures non-blocking.

   The Notion function itself must catch errors so callers do not need to protect the main response from logging failures.

   If adding a logging call from another service, prefer fire-and-forget when the main response should not wait for logging:

   ```ts
   void logSupportMessageToNotion(payload);
   ```

   Only `await` the logging call if the product behavior explicitly depends on the log being written.

5. Keep controllers unchanged unless the existing flow has no service-level place to trigger logging.

   Preferred flow:

   ```text
   controller -> domain service -> void logNewDataTypeToNotion(...)
   ```

   Avoid:

   ```text
   controller -> notion.service.ts
   ```

## Final Check

Before finishing, verify:

- Notion page creation logic is inside `src/server/services/notion.service.ts`.
- `NOTION_DATABASE_ID` is read from `process.env`.
- The Notion API call is wrapped in `try/catch`.
- Logging failure cannot break the primary API response.
- Property types match the Notion database schema.
- Any new types or imports use project conventions and `.js` extensions where needed.
