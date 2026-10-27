import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";
import { fetchSupabase } from "./fetch";

// Cliente com a chave secreta: ignora o RLS. Só para o que nenhuma usuária pode
// fazer por conta própria (creditar o Premium a partir de um pagamento confirmado).
// Nunca usar em resposta direta a uma ação da usuária sem conferir os dados antes.
export function createAdminClient() {
  const { url } = supabaseEnv();
  const chave = process.env.SUPABASE_SECRET_KEY;
  if (!chave) throw new Error("Falta SUPABASE_SECRET_KEY (Supabase › Project Settings › API Keys › Secret keys).");
  return createClient(url, chave, {
    global: { fetch: fetchSupabase },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
