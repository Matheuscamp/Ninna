import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabaseEnv } from "./env";

// Cliente Supabase para Server Components, Server Actions e Route Handlers.
// Usa a chave pública: o acesso aos dados é limitado pelas regras RLS do banco.
export async function createClient() {
  // A sessão só pode ser validada numa requisição real: o Supabase compara a
  // validade do token com o relógio (Date.now), o que o prerender não aceita.
  await connection();
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components não podem gravar cookies; o proxy renova a sessão.
        }
      },
    },
  });
}
