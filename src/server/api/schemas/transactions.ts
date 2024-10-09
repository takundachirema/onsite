import { z } from "zod";

const EXPENSE_TYPE = ["material", "labour", "fee", "other"] as const;

export const idSchema = z.object({ id: z.string() });

export const transactionSchema = z.object({
  projectId: z.string(),
  expenseId: z.string(),
  vendor: z.string().optional(),
  date: z.coerce.date(),
  notes: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
});

export const transactionGetSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().optional(),
});

export const transactionUpdateSchema = z.object({
  id: z.string(),
  vendor: z.string().optional(),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
});
