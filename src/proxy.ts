import { NextResponse, type NextRequest } from "next/server";
import { caminhoLivre, codigoDoConvite, COOKIE_CONVITE, conviteValido } from "@/lib/convite";
import { updateSession } from "@/lib/supabase/proxy";

const ROTAS_PROTEGIDAS = ["/app", "/consentimento"];
const ROTAS_DE_ENTRADA = ["/entrar", "/cadastro"];

// Checagem otimista: quem não está logada vai para /entrar. A checagem
// definitiva (sessão, consentimento, perfil) acontece no servidor, em lib/dal.ts.
export async function proxy(request: NextRequest) {
  // Teste fechado: sem o código de convite, todo o site leva à tela do convite.
  const codigo = codigoDoConvite();
  if (codigo && !caminhoLivre(request.nextUrl.pathname) && !(await conviteValido(request.cookies.get(COOKIE_CONVITE)?.value, codigo))) {
    const convite = new URL("/convite", request.url);
    convite.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(convite);
  }

  // Sem Supabase configurado, as páginas públicas (landing, triagem) ainda abrem.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && ROTAS_PROTEGIDAS.some((rota) => pathname === rota || pathname.startsWith(rota + "/"))) {
    const entrar = new URL("/entrar", request.url);
    entrar.searchParams.set("next", pathname + search);
    return NextResponse.redirect(entrar);
  }

  // Quem já está logada não precisa ver as telas de entrar e de cadastro.
  if (user && ROTAS_DE_ENTRADA.includes(pathname)) {
    const next = request.nextUrl.searchParams.get("next") ?? "/app";
    const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
