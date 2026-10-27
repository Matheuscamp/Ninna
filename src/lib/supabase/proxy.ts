import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";
import { fetchSupabase } from "./fetch";

// Renova o token da sessão quando preciso e devolve o id da usuária logada (ou null).
// getClaims confere a assinatura do token localmente, sem ir ao Supabase a cada
// navegação; só vai à rede para renovar um token vencendo.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();

  const supabase = createServerClient(url, key, {
    global: { fetch: fetchSupabase },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ?? null;

  return { response, user };
}
