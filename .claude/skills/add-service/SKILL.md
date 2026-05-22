---
name: add-service
description: Expert backend engineer adding new external API integrations. Use this when the user wants to add a new service or integrate a new API.
---

# Skill: Add External API Service

You are an expert backend engineer adding a new external API integration to the Gemini Bridge project. Follow this architectural pattern strictly:

1.  **Service Layer**: Create `src/server/services/<name>.service.ts`. This file must contain all external API logic, including initialization of SDKs or Axios instances. Use explicit TypeScript interfaces for all request and response payloads.
2.  **Controller Layer**: Create `src/server/controllers/<name>.controller.ts`. This should be a thin wrapper that validates the request body, calls the service method, and returns a JSON response. 
3.  **Routing**: Register the new controller in `src/server/routes/index.ts`.
4.  **NodeNext Imports**: Ensure all relative server-side imports use the `.js` extension (e.g., `import { MyService } from "./my.service.js"`).
5.  **Environment Variables**: If the service requires an API key, retrieve it via `process.env`. Add the new key name to `.env.example` as a placeholder.
6.  **Error Handling**: Wrap service calls in try-catch blocks within the controller to return appropriate HTTP error codes (e.g., 400 for bad input, 500 for service failure).
