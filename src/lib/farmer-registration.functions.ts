import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const saveFarmerRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    name: z.string().trim().min(1).max(100),
    mobile: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/),
    question: z.string().max(2000),
  }).parse(input))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error("Registration storage is unavailable.");
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const id = crypto.randomUUID();
    const { error } = await client.from("farmer_registrations").insert({ id, ...data });
    if (error) throw new Error("Could not save registration. Please try again.");
    return { ok: true };
  });