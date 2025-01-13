import { z } from "zod";

const EXPENSE_TYPE = ["material", "labour", "fee", "other"] as const;

export const idSchema = z.object({ id: z.string() });

export const expenseSchema = z.object({
  name: z.string(),
  projectId: z.string(),
  taskId: z.string().optional(),
  type: z.enum(EXPENSE_TYPE),
  estimateQty: z.number(),
  estimatePrice: z.number(),
  quantity: z.number().optional(),
  price: z.number().optional(),
});

export const expenseGetSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().optional(),
});

export const expenseUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  taskId: z.string().optional(),
  type: z.enum(EXPENSE_TYPE).optional(),
  estimateQty: z.number().optional(),
  estimatePrice: z.number().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
});
