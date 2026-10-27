import { NextResponse, type NextRequest } from "next/server";
import { BUCKET_DOCUMENTOS, getUsuaria, obterDocumento } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

// Abre (ou baixa, com ?baixar=1) um documento. A cada clique o servidor confere
// a dona do documento e gera um link do Storage que expira em 60 segundos.
export async function GET(request: NextRequest, { params }: RouteContext<"/app/documentos/[id]/arquivo">) {
  const usuaria = await getUsuaria();
  if (!usuaria) return NextResponse.redirect(new URL("/entrar?next=/app/documentos", request.url));

  const { id } = await params;
  const documento = await obterDocumento(usuaria.id, id);
  if (!documento) return new NextResponse("Documento não encontrado.", { status: 404 });

  const baixar = request.nextUrl.searchParams.get("baixar") === "1";
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_DOCUMENTOS)
    .createSignedUrl(documento.caminho, 60, baixar ? { download: documento.nome_original } : undefined);
  if (error || !data) return NextResponse.redirect(new URL("/app/documentos?ok=erro_arquivo", request.url));

  const resposta = NextResponse.redirect(data.signedUrl);
  resposta.headers.set("Cache-Control", "no-store");
  resposta.headers.set("Referrer-Policy", "no-referrer");
  return resposta;
}
