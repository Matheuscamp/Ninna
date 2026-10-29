import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Tipos de link de e-mail aceitos no formato token_hash (ver abaixo).
const TIPOS_DE_LINK: EmailOtpType[] = ["signup", "email", "recovery"];

// Destino dos links de e-mail (confirmação de conta e recuperação de senha).
// Aceita os dois formatos do Supabase: `code` (padrão, só funciona no mesmo
// navegador em que o pedido foi feito) e `token_hash` + `type` (quando o modelo
// do e-mail no painel aponta direto para cá; funciona em qualquer aparelho).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/app";
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  if (code || (tokenHash && tipo && TIPOS_DE_LINK.includes(tipo))) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: tipo!, token_hash: tokenHash! });
    if (!error) return NextResponse.redirect(new URL(destino, origin));
  }

  // Link de nova senha vencido: volta para pedir outro, não para o login.
  const falha = destino === "/nova-senha" ? "/esqueci-senha?erro=link" : "/entrar?erro=link";
  return NextResponse.redirect(new URL(falha, origin));
}
