import { z } from "zod";

// Shared rules for every entry: 1–5 star priority, optional nickname.
export const prioritySchema = z.number().int().min(1).max(5);
const nickname = z.string().trim().max(40).default("");

export const struggleInput = z.object({
  title: z.string().trim().min(1, "请写下困扰").max(120),
  description: z.string().trim().max(2000).default(""),
  priority: prioritySchema,
  author: nickname,
});

export const solutionInput = z.object({
  struggle_id: z.string().uuid("请选择对应的困扰"),
  title: z.string().trim().min(1, "请写下办法").max(120),
  content: z.string().trim().max(3000).default(""),
  priority: prioritySchema,
  author: nickname,
});

export const encouragementInput = z.object({
  content: z.string().trim().min(1, "请写下鼓励的话").max(1000),
  priority: prioritySchema,
  author: nickname,
});

export const paperInput = z.object({
  title: z.string().trim().min(1, "请写下论文标题").max(300),
  authors: z.string().trim().max(300).default(""),
  year: z.number().int().min(1800).max(2100).nullable().default(null),
  url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "链接需以 http:// 或 https:// 开头")
    .default(""),
  summary: z.string().trim().max(3000).default(""),
  priority: prioritySchema,
  added_by: nickname,
});

export const reflectionInput = z.object({
  paper_id: z.string().uuid(),
  content: z.string().trim().min(1, "请写下你的感悟").max(3000),
  priority: prioritySchema,
  author: nickname,
});

/** Highest stars first; ties show the newest first. */
export function sortByPriority<T extends { priority: number; created_at: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => b.priority - a.priority || b.created_at.localeCompare(a.created_at),
  );
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
