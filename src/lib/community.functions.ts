import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  encouragementInput,
  paperInput,
  reflectionInput,
  solutionInput,
  struggleInput,
} from "./community";

// Public, shared space: reads and inserts go through the publishable key and RLS.
function publicDb() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function fail(message: string, error: unknown): never {
  console.error(message, error);
  throw new Error(message);
}

export const listStruggles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicDb()
    .from("struggles")
    .select("*, solutions(*)")
    .order("created_at", { ascending: false });
  if (error) fail("读取困扰失败", error);
  return data ?? [];
});

export const listEncouragements = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicDb()
    .from("encouragements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) fail("读取鼓励失败", error);
  return data ?? [];
});

export const listPapers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicDb()
    .from("papers")
    .select("*, paper_reflections(*)")
    .order("created_at", { ascending: false });
  if (error) fail("读取论文失败", error);
  return data ?? [];
});

export const addStruggle = createServerFn({ method: "POST" })
  .validator((d: unknown) => struggleInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await publicDb().from("struggles").insert(data);
    if (error) fail("添加困扰失败", error);
    return { ok: true };
  });

export const addSolution = createServerFn({ method: "POST" })
  .validator((d: unknown) => solutionInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await publicDb().from("solutions").insert(data);
    if (error) fail("添加解决办法失败", error);
    return { ok: true };
  });

export const addEncouragement = createServerFn({ method: "POST" })
  .validator((d: unknown) => encouragementInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await publicDb().from("encouragements").insert(data);
    if (error) fail("添加鼓励失败", error);
    return { ok: true };
  });

export const addPaper = createServerFn({ method: "POST" })
  .validator((d: unknown) => paperInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await publicDb().from("papers").insert(data);
    if (error) fail("添加论文失败", error);
    return { ok: true };
  });

export const addReflection = createServerFn({ method: "POST" })
  .validator((d: unknown) => reflectionInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await publicDb().from("paper_reflections").insert(data);
    if (error) fail("添加感悟失败", error);
    return { ok: true };
  });
