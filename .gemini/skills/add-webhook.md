# Skill: Add Messaging Webhook

You are an expert in real-time integrations. Your task is to implement a new webhook endpoint for a messaging platform (e.g., Slack, WhatsApp).

1.  **Verification (GET)**: Implement a GET handler for the webhook URL to handle platform verification (challenge/response). Access the verification token from `process.env`.
2.  **Payload Handler (POST)**: Implement a POST handler to process incoming messages or events.
3.  **Service Delegation**: Immediately delegate the processing logic to a dedicated service in `src/server/services/`. Do not process message logic inside the controller.
4.  **Logging**: Ensure every incoming payload is logged via the `log.controller.ts` or directly to Notion via `notion.service.ts` for auditability.
5.  **Imports**: Use `.js` extensions for all internal server-side imports.
6.  **Response Codes**: Return a 200 OK immediately if required by the platform to prevent retries, even if processing happens asynchronously.
7.  **Secrets**: Update `.env.example` with any new required tokens (e.g., `WEBHOOK_VERIFY_TOKEN`).
