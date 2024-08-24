import { z } from "zod";

export const idSchema = z.object({ id: z.string() });

const TYPES = [
  "foyer",
  "lounge",
  "passage",
  "kitchen",
  "diningroom",
  "bedroom",
  "bathroom",
  "study",
  "basement",
  "laundy",
  "gym",
  "garage",
  "other",
] as const;

export const roomSchema = z.object({
  name: z.string(),
  type: z.enum(TYPES),
  projectId: z.string(),
  areaId: z.string().optional(),
  dueDate: z.coerce.date(),
  taskIds: z.array(z.string()).optional(),
});

export const roomGetSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().optional(),
  name: z.string().optional(),
});

export const roomUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.enum(TYPES).optional(),
  projectId: z.string().optional(),
  areaId: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  status: z.string().optional(),
  taskIds: z.array(z.string()).optional(),
});
