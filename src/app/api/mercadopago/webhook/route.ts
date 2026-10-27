import { NextResponse, type NextRequest } from "next/server";
import { processarPagamento } from "@/lib/mercadopago";
import { assinaturaWebhookValida } from "@/lib/pagamentos";

// Avisos do Mercado Pago (Suas integrações › Webhooks, evento "Pagamentos").
// O aviso só diz "o pagamento X mudou"; o pagamento em si é lido da API.
// Resposta 2xx encerra o aviso; erro faz o Mercado Pago reenviar mais tarde.
export async function POST(request: NextRequest) {
  const corpo = (await request.json().catch(() => null)) as { type?: string; data?: { id?: unknown } } | null;
  const parametros = request.nextUrl.searchParams;
  const tipo = parametros.get("type") ?? corpo?.type;
  const id = parametros.get("data.id") ?? (corpo?.data?.id !== undefined ? String(corpo.data.id) : null);

  // Outros tipos de aviso (pedidos, assinaturas recorrentes...) não interessam.
  if (tipo !== "payment" || !id) return NextResponse.json({ ok: true });
  if (!/^\d+$/.test(id)) return NextResponse.json({ erro: "id inválido" }, { status: 400 });

  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (segredo) {
    const valida = assinaturaWebhookValida({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId: id,
      segredo,
    });
    if (!valida) return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
  }

  try {
    const { situacao } = await processarPagamento(id);
    return NextResponse.json({ ok: true, situacao });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: "falha ao processar" }, { status: 500 });
  }
}
