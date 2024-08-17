import { z } from "zod";

const ROLES = ["owner", "admin", "guest", "employee"] as const;

export const idSchema = z.object({ id: z.string() });

export const userSchema = z.object({
  name: z.string(),
  role: z.enum(ROLES),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
});

export const userGetSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  organizationId: z.string().optional(),
});

export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
});
