import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const ROTAS_PROTEGIDAS = ["/app", "/consentimento"];

// Checagem otimista: quem não está logada vai para /entrar. A checagem
// definitiva (sessão, consentimento, perfil) acontece no servidor, em lib/dal.ts.
export async function proxy(request: NextRequest) {
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

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
