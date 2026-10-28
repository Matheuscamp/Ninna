"use client";

import { useActionState } from "react";
import { BotaoPrimario, Campo } from "@/components/ui";
import { entrarComConvite } from "./actions";

export function FormConvite({ next }: { next: string }) {
  const [estado, acao, pendente] = useActionState(entrarComConvite, undefined);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Campo id="codigo" rotulo="Código de convite" autoComplete="off" autoCapitalize="none" required erro={estado?.erro} />
      <BotaoPrimario type="submit" disabled={pendente}>
        {pendente ? "Conferindo…" : "Entrar no Ninna"}
      </BotaoPrimario>
    </form>
  );
}
