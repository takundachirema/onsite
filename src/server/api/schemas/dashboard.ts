import { z } from "zod";

const EXPENSE_TYPE = ["material", "labour", "fee", "other"] as const;

export const idSchema = z.object({ id: z.string() });

export const expensesDataSchema = z.object({
  projectId: z.string(),
  taskId: z.string().optional(),
});

export const statusesDataSchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().optional(),
});

export const tasksDataSchema = z.object({
  projectId: z.string(),
});
