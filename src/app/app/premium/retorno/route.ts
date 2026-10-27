import { NextResponse, type NextRequest } from "next/server";
import { getUsuaria } from "@/lib/dal";
import { processarPagamento } from "@/lib/mercadopago";

// Volta do checkout do Mercado Pago (?payment_id=...&status=...).
// Confere o pagamento na API na hora, para o Premium aparecer sem esperar o
// webhook (que nem chega em localhost). Os parâmetros da URL só dizem qual pagamento olhar.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const destino = (pagamento?: string) =>
    NextResponse.redirect(new URL(pagamento ? `/app/premium?pagamento=${pagamento}` : "/app/premium", origin));

  const usuaria = await getUsuaria();
  if (!usuaria) return NextResponse.redirect(new URL("/entrar?next=/app/premium", origin));

  const id = searchParams.get("payment_id") ?? searchParams.get("collection_id");
  // Sem pagamento: ela voltou do checkout sem pagar.
  if (!id || !/^\d+$/.test(id)) return destino(searchParams.get("status") === "rejected" ? "recusado" : undefined);

  try {
    const { situacao, usuariaId } = await processarPagamento(id);
    if (usuariaId !== usuaria.id || situacao === "ignorado") return destino();
    return destino(situacao);
  } catch (erro) {
    // Não deu para gravar agora (ex.: rede); o webhook tenta de novo.
    console.error(erro);
    return destino("confirmando");
  }
}
