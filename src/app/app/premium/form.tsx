"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { BotaoPrimario } from "@/components/ui";
import { formatarPreco, PERIODOS, precoPorMes, type Periodo } from "@/lib/planos";
import { iniciarPagamento, pedirReembolso, verificarPagamento } from "./actions";

const ORDEM: Periodo[] = ["anual", "mensal"];

export function FormPremium({ renovar }: { renovar: boolean }) {
  const [estado, acao, pendente] = useActionState(iniciarPagamento, undefined);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lg font-bold">{renovar ? "Renovar o Premium" : "Escolha o período"}</legend>
        {ORDEM.map((periodo) => {
          const { rotulo, preco, meses } = PERIODOS[periodo];
          const { porMes, economia } = precoPorMes(periodo);
          return (
            <label
              key={periodo}
              className="relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-linha bg-white px-4 py-4 transition hover:border-rosa-300 has-[:checked]:border-rosa-600 has-[:checked]:bg-rosa-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rosa-600"
            >
              <input type="radio" name="periodo" value={periodo} defaultChecked={periodo === "anual"} className="size-5 shrink-0 accent-rosa-600" />
              <span className="flex flex-1 flex-col">
                <span className="text-base font-bold">{rotulo}</span>
                <span className="text-sm text-suave">{meses > 1 ? `equivale a ${formatarPreco(porMes)} por mês` : "para experimentar"}</span>
              </span>
              <span className="text-lg font-bold">{formatarPreco(preco)}</span>
              {economia > 0 && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-rosa-600 px-2.5 py-0.5 text-[12px] font-bold text-white">
                  economize {economia}%
                </span>
              )}
            </label>
          );
        })}
      </fieldset>

      {estado?.erro && (
        <p role="alert" className="text-sm text-alerta">
          {estado.erro}
        </p>
      )}

      <BotaoPrimario type="submit" disabled={pendente}>
        {pendente ? "Abrindo o pagamento…" : "Continuar para o pagamento"}
      </BotaoPrimario>
      <p className="text-center text-[13px] leading-relaxed text-suave">
        Pagamento único pelo Mercado Pago, com Pix, cartão ou boleto. Não renova sozinho.
        {renovar && " O novo período começa quando o atual terminar."} Ao continuar, você concorda com os{" "}
        <Link href="/termos#pagamento" className="underline underline-offset-2">
          Termos de Uso
        </Link>
        .
      </p>
    </form>
  );
}

// Para quem pagou mas não voltou ao site pelo botão do Mercado Pago.
export function VerificarPagamento() {
  const [estado, acao, pendente] = useActionState(verificarPagamento, undefined);

  return (
    <form action={acao} className="flex flex-col items-center gap-1 text-center">
      <p className="text-[15px] text-suave">Já pagou e o Premium não apareceu?</p>
      <button
        type="submit"
        disabled={pendente}
        className="flex h-11 items-center rounded-xl px-3 font-semibold text-azul-700 hover:bg-white disabled:opacity-60"
      >
        {pendente ? "Verificando…" : "Verificar pagamento"}
      </button>
      {estado?.erro && (
        <p role="alert" className="text-sm text-alerta">
          {estado.erro}
        </p>
      )}
    </form>
  );
}

// Desistir da compra pede confirmação: o Premium daquele período sai na hora.
export function PedirReembolso({ pagamento, ate }: { pagamento: string; ate: string }) {
  const [estado, acao, pendente] = useActionState(pedirReembolso, undefined);
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="flex h-11 items-center self-start rounded-xl px-3 -ml-3 text-[15px] font-semibold text-alerta hover:bg-alerta-50"
      >
        Cancelar e pedir reembolso
      </button>
    );
  }

  return (
    <form action={acao} className="flex flex-col gap-3 rounded-2xl bg-alerta-50 p-4">
      <input type="hidden" name="pagamento" value={pagamento} />
      <p className="text-[15px] leading-relaxed">
        Você recebe o valor integral de volta e o Premium deste período é removido agora. Pode pedir até {ate}.
      </p>
      {estado?.erro && (
        <p role="alert" className="text-sm text-alerta">
          {estado.erro}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pendente} className="h-11 flex-1 whitespace-nowrap rounded-xl bg-alerta px-3 text-[15px] font-semibold text-white disabled:opacity-60">
          {pendente ? "Pedindo…" : "Confirmar reembolso"}
        </button>
        <button type="button" onClick={() => setConfirmando(false)} className="h-11 rounded-xl bg-white px-4 font-semibold">
          Voltar
        </button>
      </div>
    </form>
  );
}
