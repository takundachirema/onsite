import { z } from "zod";

export const idSchema = z.object({ id: z.string() });

export const userSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
