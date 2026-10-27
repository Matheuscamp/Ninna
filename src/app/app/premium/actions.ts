"use server";

import { redirect } from "next/navigation";
import { getAssinatura, getUsuaria } from "@/lib/dal";
import { criarPreferencia, mercadoPagoConfigurado, sincronizarPagamentos } from "@/lib/mercadopago";
import { origem } from "@/lib/origem";
import { ehPeriodo } from "@/lib/planos";

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
