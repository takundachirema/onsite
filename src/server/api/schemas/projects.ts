import { z } from "zod";

export const idSchema = z.object({ id: z.string() });

export const projectSchema = z.object({
  name: z.string(),
  organizationId: z.string(),
});

export const projectGetSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
});

export const projectUpdateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
