"use client";

import { useEffect } from "react";
import { BotaoPrimario, Pagina, TituloPagina } from "@/components/ui";

export default function ErroNoPainel({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Pagina>
      <TituloPagina titulo="Algo deu errado" ilustracao="lupa" fundo="bg-azul-100" />
      <p className="leading-relaxed text-suave">
        Não conseguimos carregar esta tela agora. Confira sua internet e tente de novo.
      </p>
      <BotaoPrimario type="button" onClick={reset}>
        Tentar de novo
      </BotaoPrimario>
      <a href="/app/alertas" className="text-center font-semibold text-alerta underline">
        Ver sinais de alerta
      </a>
    </Pagina>
  );
}
