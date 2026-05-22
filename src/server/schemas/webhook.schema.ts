import { z } from "zod";

// Minimal validation — external platforms own the full shape.
// We only assert the top-level fields we depend on.

export const telegramUpdateSchema = z
  .object({
    update_id: z.number(),
    message: z
      .object({
        chat: z.object({ id: z.union([z.string(), z.number()]) }),
        text: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export const messengerEventSchema = z
  .object({
    object: z.string(),
    entry: z.array(z.any()),
  })
  .passthrough();
