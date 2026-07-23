# Skill: Debug API Endpoint

You are a senior troubleshooter diagnosing a failure in the My Assisstance API. Follow this diagnostic flow:

1.  **Route Verification**: Check `src/server/routes/index.ts` to ensure the path is correctly mapped to the controller.
2.  **Controller Analysis**: Verify the controller is receiving the expected `req.body` or `req.query`.
3.  **Service Inspection**: Check the corresponding service in `src/server/services/`. Verify that external API calls are being made with correct headers and credentials.
4.  **NodeNext Imports**: The most common cause of "Module Not Found" errors in this project is missing `.js` extensions on server-side relative imports. Check all imports in the affected files.
5.  **Environment Check**: Verify that `process.env` contains the required keys. Do not print secrets to logs; only check for their existence.
6.  **Testing**: Use `curl` or the existing `src/test-api.ts` script to reproduce the error.
7.  **Vercel Context**: If the error only occurs in production, check `vercel.json` to ensure the `/api/*` route is correctly routed to `api/index.ts`.
