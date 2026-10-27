import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSupabase as fetchResiliente } from "@/lib/supabase/fetch";
import { acaoDoPagamento, montarReferencia, type PagamentoMP, type Situacao } from "./pagamentos";
import { PERIODOS, type Periodo } from "./planos";

// Integração com o Mercado Pago (Checkout Pro): cria o pedido e lê pagamentos.
// O Premium só é creditado em processarPagamento, a partir do pagamento lido da API.

const API = "https://api.mercadopago.com";

export function mercadoPagoConfigurado() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

function token() {
  const valor = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!valor) throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN (Mercado Pago › Suas integrações › Credenciais).");
  return valor;
}

async function chamar(caminho: string, opcoes: RequestInit = {}) {
  return fetchResiliente(`${API}${caminho}`, {
    ...opcoes,
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opcoes.headers },
  });
}

// Cria o pedido e devolve o link do checkout. `origem`: https://dominio (ou http://localhost:3000).
export async function criarPreferencia({ usuariaId, periodo, origem }: { usuariaId: string; periodo: Periodo; origem: string }) {
  const p = PERIODOS[periodo];
  const voltar = `${origem}/app/premium/retorno`;
  const resposta = await chamar("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [
        {
          id: `premium-${periodo}`,
          title: p.titulo,
          description: "Agenda e documentos ilimitados e conteúdos Premium. Pagamento único, sem renovação automática.",
          category_id: "services",
          quantity: 1,
          unit_price: p.preco,
          currency_id: "BRL",
        },
      ],
      external_reference: montarReferencia(usuariaId, periodo),
      back_urls: { success: voltar, pending: voltar, failure: voltar },
      // O Mercado Pago só aceita voltar sozinho para endereços https.
      ...(origem.startsWith("https://") && { auto_return: "approved" }),
      statement_descriptor: "NINNA",
    }),
  });
  if (!resposta.ok) throw new Error(`[mercadopago] preferência ${resposta.status}: ${await resposta.text()}`);
  const dados = (await resposta.json()) as { init_point: string; sandbox_init_point?: string };
  // Credenciais antigas de teste (TEST-...) usam o checkout de sandbox.
  return token().startsWith("TEST-") && dados.sandbox_init_point ? dados.sandbox_init_point : dados.init_point;
}

// null = pagamento não existe (ex.: o aviso de teste do painel, com id fictício).
export async function buscarPagamento(id: string): Promise<PagamentoMP | null> {
  const resposta = await chamar(`/v1/payments/${encodeURIComponent(id)}`);
  if (resposta.status === 404) return null;
  if (!resposta.ok) throw new Error(`[mercadopago] pagamento ${id} ${resposta.status}: ${await resposta.text()}`);
  return (await resposta.json()) as PagamentoMP;
}

export type ResultadoPagamento = { situacao: Situacao | "ignorado"; usuariaId?: string };

// Lê o pagamento na API e credita ou estorna o Premium. Pode ser chamada várias
// vezes para o mesmo pagamento (webhook repetido, volta do checkout): o banco só credita uma vez.
// Lança erro se não conseguir gravar, para o Mercado Pago reenviar o aviso depois.
export async function processarPagamento(id: string): Promise<ResultadoPagamento> {
  const pagamento = await buscarPagamento(id);
  if (!pagamento) return { situacao: "ignorado" };
  return aplicarPagamento(pagamento);
}

// Pagamentos dos pedidos que a usuária abriu (um pedido por período), lidos da API.
async function pagamentosDaUsuaria(usuariaId: string): Promise<PagamentoMP[]> {
  const listas = await Promise.all(
    (Object.keys(PERIODOS) as Periodo[]).map(async (periodo) => {
      const busca = new URLSearchParams({
        external_reference: montarReferencia(usuariaId, periodo),
        sort: "date_created",
        criteria: "desc",
        limit: "30",
      });
      const resposta = await chamar(`/v1/payments/search?${busca}`);
      if (!resposta.ok) throw new Error(`[mercadopago] busca ${resposta.status}: ${await resposta.text()}`);
      return ((await resposta.json()) as { results?: PagamentoMP[] }).results ?? [];
    }),
  );
  return listas.flat();
}

// Para quando a volta do checkout não acontece (aba fechada, localhost) e o webhook
// ainda não chegou: procura os pagamentos da usuária e aplica cada um.
// Devolve a melhor situação encontrada, ou null se não há pagamento nenhum.
export async function sincronizarPagamentos(usuariaId: string): Promise<Situacao | null> {
  const situacoes = new Set<string>();
  for (const pagamento of await pagamentosDaUsuaria(usuariaId)) {
    const { situacao, usuariaId: dona } = await aplicarPagamento(pagamento);
    if (dona === usuariaId) situacoes.add(situacao);
  }
  const ordem: Situacao[] = ["aprovado", "pendente", "recusado", "estornado"];
  return ordem.find((s) => situacoes.has(s)) ?? null;
}

async function aplicarPagamento(pagamento: PagamentoMP): Promise<ResultadoPagamento> {
  const id = String(pagamento.id);
  const acao = acaoDoPagamento(pagamento);

  if (acao.tipo === "ignorar") {
    console.warn(`[mercadopago] pagamento ${id} ignorado: ${acao.motivo}`);
    return { situacao: "ignorado" };
  }
  if (acao.tipo === "nada") return { situacao: acao.situacao, usuariaId: acao.usuariaId };

  const admin = createAdminClient();
  if (acao.tipo === "creditar") {
    const { error } = await admin.rpc("creditar_pagamento", {
      p_id: id,
      p_user: acao.usuariaId,
      p_periodo: acao.periodo,
      p_meses: PERIODOS[acao.periodo].meses,
      p_valor: pagamento.transaction_amount,
    });
    if (error) throw new Error(`[mercadopago] creditar ${id}: ${error.code ?? "sem_codigo"}: ${error.message}`);
    return { situacao: "aprovado", usuariaId: acao.usuariaId };
  }

  const { error } = await admin.rpc("estornar_pagamento", { p_id: id });
  if (error) throw new Error(`[mercadopago] estornar ${id}: ${error.code ?? "sem_codigo"}: ${error.message}`);
  return { situacao: "estornado", usuariaId: acao.usuariaId };
}
