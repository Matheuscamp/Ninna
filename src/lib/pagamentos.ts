import { createHmac, timingSafeEqual } from "node:crypto";
import { ehPeriodo, PERIODOS, type Periodo } from "./planos";

// Regras do pagamento do Premium pelo Mercado Pago, sem rede: referência do
// pedido, conferência da assinatura do webhook e o que fazer com cada pagamento.

// A referência vai no pedido e volta em cada pagamento: diz de quem é e o que foi comprado.
const PREFIXO = "ninna";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function montarReferencia(usuariaId: string, periodo: Periodo) {
  return `${PREFIXO}:${periodo}:${usuariaId}`;
}

export function lerReferencia(referencia: unknown): { usuariaId: string; periodo: Periodo } | null {
  if (typeof referencia !== "string") return null;
  const [prefixo, periodo, usuariaId, ...resto] = referencia.split(":");
  if (prefixo !== PREFIXO || resto.length > 0 || !ehPeriodo(periodo) || !UUID.test(usuariaId ?? "")) return null;
  return { usuariaId, periodo };
}

// Só o que o Ninna usa do pagamento devolvido por GET /v1/payments/{id}.
export type PagamentoMP = {
  id: number | string;
  status: string;
  external_reference?: string | null;
  transaction_amount?: number | null;
  currency_id?: string | null;
};

export type Situacao = "aprovado" | "pendente" | "recusado" | "estornado";

export type Acao =
  | { tipo: "creditar"; usuariaId: string; periodo: Periodo }
  | { tipo: "estornar"; usuariaId: string }
  | { tipo: "nada"; usuariaId: string; situacao: Exclude<Situacao, "aprovado" | "estornado"> }
  | { tipo: "ignorar"; motivo: string };

// Decide pelo pagamento lido da API do Mercado Pago, nunca pelo corpo do aviso
// (que qualquer um poderia forjar). O valor pago precisa bater com o preço do período.
export function acaoDoPagamento(p: PagamentoMP): Acao {
  const ref = lerReferencia(p.external_reference);
  if (!ref) return { tipo: "ignorar", motivo: "referência de outro sistema" };
  const { usuariaId, periodo } = ref;

  switch (p.status) {
    case "approved": {
      const centavos = (v: number) => Math.round(v * 100);
      const valorCerto = typeof p.transaction_amount === "number" && centavos(p.transaction_amount) === centavos(PERIODOS[periodo].preco);
      if (p.currency_id !== "BRL" || !valorCerto) return { tipo: "ignorar", motivo: "valor diferente do preço" };
      return { tipo: "creditar", usuariaId, periodo };
    }
    case "refunded":
    case "charged_back":
      return { tipo: "estornar", usuariaId };
    // Pix e boleto ficam pendentes até a confirmação; contestação aberta mantém o Premium até a decisão.
    case "pending":
    case "in_process":
    case "authorized":
    case "in_mediation":
      return { tipo: "nada", usuariaId, situacao: "pendente" };
    default:
      // rejected, cancelled
      return { tipo: "nada", usuariaId, situacao: "recusado" };
  }
}

// Assinatura do webhook (cabeçalho x-signature: "ts=...,v1=..."): HMAC-SHA256 do
// texto "id:{data.id};request-id:{x-request-id};ts:{ts};" com o segredo do painel.
// Partes ausentes saem do texto, como manda a documentação do Mercado Pago.
export function assinaturaWebhookValida({
  xSignature,
  xRequestId,
  dataId,
  segredo,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
  segredo: string;
}) {
  if (!xSignature) return false;
  const partes = Object.fromEntries(
    xSignature.split(",").map((parte) => {
      const [chave, ...valor] = parte.split("=");
      return [chave.trim(), valor.join("=").trim()];
    }),
  );
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifesto = `id:${id};` + (xRequestId ? `request-id:${xRequestId};` : "") + `ts:${ts};`;
  const esperado = createHmac("sha256", segredo).update(manifesto).digest();
  const recebido = Buffer.from(v1, "hex");
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

// Direito de arrependimento (Código de Defesa do Consumidor, art. 49): quem compra
// pela internet pode desistir em até 7 dias e receber tudo de volta.
// Conta a partir de quando o Ninna liberou o Premium (nunca antes da aprovação).
export const PRAZO_ARREPENDIMENTO_DIAS = 7;

export function fimDoArrependimento(aprovadoEm: string) {
  return new Date(new Date(aprovadoEm).getTime() + PRAZO_ARREPENDIMENTO_DIAS * 86_400_000);
}

export function podeReembolsar(p: { status: string; aprovado_em: string }, agora: Date) {
  return p.status === "aprovado" && fimDoArrependimento(p.aprovado_em) > agora;
}
