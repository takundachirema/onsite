import { z } from "zod";

export const idSchema = z.object({ id: z.string() });

export const taskSchema = z.object({
  name: z.string(),
  projectId: z.string(),
  areaId: z.string().optional(),
  description: z.string(),
  dueDate: z.coerce.date(),
  userIds: z.array(z.string()).optional(),
});

export const taskGetSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().optional(),
  name: z.string().optional(),
});

export const taskUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  projectId: z.string().optional(),
  areaId: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  status: z.string().optional(),
  userIds: z.array(z.string()).optional(),
});
