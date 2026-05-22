import { z } from "zod";

export const aiGenerateSchema = z.object({
  prompt: z
    .string({ error: "Prompt is required" })
    .min(1, "Prompt cannot be empty")
    .max(2000, "Prompt must be at most 2000 characters"),
});
