import { z } from "zod";

export const idSchema = z.object({ id: z.string() });

export const userSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const userGetSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
});

export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
