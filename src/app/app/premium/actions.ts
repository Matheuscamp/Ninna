"use server";

import { redirect } from "next/navigation";
import { getAssinatura, getUsuaria } from "@/lib/dal";
import { criarPreferencia, mercadoPagoConfigurado, reembolsarPagamento, sincronizarPagamentos } from "@/lib/mercadopago";
import { origem } from "@/lib/origem";
import { podeReembolsar } from "@/lib/pagamentos";
import { ehPeriodo } from "@/lib/planos";
import { createClient } from "@/lib/supabase/server";

export type EstadoPagamento = { erro?: string } | undefined;

// Cria o pedido no Mercado Pago e leva a usuária ao checkout (Pix, cartão ou boleto).
// O Premium só é liberado depois, quando o pagamento aprovado é lido da API.
export async function iniciarPagamento(_estado: EstadoPagamento, formData: FormData): Promise<EstadoPagamento> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/premium");

  const periodo = formData.get("periodo");
  if (!ehPeriodo(periodo)) return { erro: "Escolha um dos planos." };
  if (!mercadoPagoConfigurado()) return { erro: "O pagamento ainda não está disponível. Tente de novo mais tarde." };

  // Premium sem prazo não tem o que renovar.
  const { plano, validoAte } = await getAssinatura(usuaria.id);
  if (plano === "premium" && validoAte === null) return { erro: "Seu Premium já não tem data para acabar." };

  let checkout: string;
  try {
    checkout = await criarPreferencia({ usuariaId: usuaria.id, periodo, origem: await origem() });
  } catch (erro) {
    console.error(erro);
    return { erro: "Não conseguimos abrir o pagamento agora. Tente de novo em instantes." };
  }
  redirect(checkout);
}

// "Já paguei": procura no Mercado Pago os pagamentos da usuária e libera o Premium
// dos aprovados. Cobre quem fechou a aba antes de voltar ao site e o Pix que confirmou depois.
export async function verificarPagamento(): Promise<EstadoPagamento> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/premium");
  if (!mercadoPagoConfigurado()) return { erro: "O pagamento ainda não está disponível. Tente de novo mais tarde." };

  let situacao: Awaited<ReturnType<typeof sincronizarPagamentos>>;
  try {
    situacao = await sincronizarPagamentos(usuaria.id);
  } catch (erro) {
    console.error(erro);
    return { erro: "Não conseguimos verificar agora. Tente de novo em instantes." };
  }
  if (!situacao) return { erro: "Não encontramos nenhum pagamento seu. Se acabou de pagar, aguarde um minuto e tente de novo." };
  redirect(`/app/premium?pagamento=${situacao}`);
}

// Direito de arrependimento: em até 7 dias, devolve o valor integral e tira o período do Premium.
export async function pedirReembolso(_estado: EstadoPagamento, formData: FormData): Promise<EstadoPagamento> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/premium");

  const id = formData.get("pagamento");
  if (typeof id !== "string" || !/^\d+$/.test(id)) return { erro: "Pagamento não encontrado." };

  // Lido pela sessão da usuária: o RLS só devolve pagamentos dela.
  const supabase = await createClient();
  const { data: pagamento, error } = await supabase
    .from("pagamentos")
    .select("status, aprovado_em")
    .eq("user_id", usuaria.id)
    .eq("id", id)
    .maybeSingle();
  if (error) return { erro: "Não conseguimos pedir o reembolso agora. Tente de novo em instantes." };
  if (!pagamento) return { erro: "Pagamento não encontrado." };
  if (pagamento.status !== "aprovado") return { erro: "Este pagamento já foi reembolsado." };
  if (!podeReembolsar(pagamento, new Date())) return { erro: "O prazo de 7 dias para desistir da compra já passou." };

  try {
    await reembolsarPagamento(id);
  } catch (erro) {
    console.error(erro);
    return { erro: "Não conseguimos pedir o reembolso agora. Tente de novo em instantes." };
  }
  redirect("/app/premium?pagamento=reembolsado");
}
