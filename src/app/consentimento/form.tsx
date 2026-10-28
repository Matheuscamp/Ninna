"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { BotaoPrimario } from "@/components/ui";
import { aceitarConsentimento } from "./actions";

function Item({ nome, titulo, children }: { nome: string; titulo: ReactNode; children: ReactNode }) {
  return (
    <label className="flex gap-3 rounded-2xl bg-white/90 shadow-suave p-4">
      <input type="checkbox" name={nome} required className="mt-1 size-5 shrink-0 accent-rosa-600" />
      <span className="flex flex-col gap-1">
        <span className="font-semibold">{titulo}</span>
        <span className="text-sm leading-relaxed text-suave">{children}</span>
      </span>
    </label>
  );
}

export function FormConsentimento() {
  const [estado, acao, pendente] = useActionState(aceitarConsentimento, undefined);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <Item nome="dados_saude" titulo="Autorizo o uso dos meus dados de saúde">
        Respostas da triagem, semanas de gestação, consultas e sintomas são usados só para personalizar o app para
        você. Eles não são vendidos nem usados em anúncios.
      </Item>
      <Item
        nome="termos_privacidade"
        titulo={
          <>
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="text-azul-700 underline underline-offset-2">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="text-azul-700 underline underline-offset-2">
              Política de Privacidade
            </Link>
          </>
        }
      >
        Você pode exportar ou excluir todos os seus dados a qualquer momento, pelo seu perfil.
      </Item>
      {estado?.erro && (
        <p role="alert" className="text-sm text-alerta">
          {estado.erro}
        </p>
      )}
      <BotaoPrimario type="submit" disabled={pendente}>
        {pendente ? "Registrando…" : "Aceitar e continuar"}
      </BotaoPrimario>
    </form>
  );
}
