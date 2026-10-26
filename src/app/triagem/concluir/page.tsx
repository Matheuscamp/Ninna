"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BotaoPrimario, Pagina } from "@/components/ui";
import { salvarTriagem } from "../actions";
import { lerPendente, limparPendente } from "../pendente";

// Depois do cadastro e do consentimento, grava a triagem respondida antes do login.
export default function ConcluirTriagemPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    const pendente = lerPendente();
    if (!pendente) {
      router.replace("/app");
      return;
    }
    salvarTriagem(pendente).then((res) => {
      if (res.ok) {
        limparPendente();
        router.replace("/app");
      } else if (res.motivo === "login") {
        router.replace("/entrar?next=/triagem/concluir");
      } else if (res.motivo === "consentimento") {
        router.replace("/consentimento");
      } else {
        limparPendente();
        setErro(res.mensagem ?? "Não foi possível salvar sua triagem.");
      }
    });
  }, [router]);

  return (
    <Pagina>
      {erro ? (
        <div className="flex flex-col gap-4">
          <p role="alert" className="text-alerta">
            {erro}
          </p>
          <BotaoPrimario type="button" onClick={() => router.replace("/triagem")}>
            Refazer a triagem
          </BotaoPrimario>
        </div>
      ) : (
        <p role="status" className="text-suave">
          Salvando suas respostas…
        </p>
      )}
    </Pagina>
  );
}
