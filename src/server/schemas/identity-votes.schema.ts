import { z } from "zod";

export const saveIdentitySchema = z.object({
  identity: z
    .string({ error: "Identity text is required" })
    .max(5000, "Identity text must be at most 5000 characters"),
});

export const addVoteSchema = z.object({
  name: z
    .string({ error: "Vote name is required" })
    .min(1, "Vote name cannot be empty")
    .max(255, "Vote name must be at most 255 characters"),
});