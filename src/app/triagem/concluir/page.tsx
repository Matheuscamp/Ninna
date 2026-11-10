"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BotaoPrimario, BotaoSecundario, Pagina, TituloPagina } from "@/components/ui";
import { salvarTriagem, situacaoDaTriagemPendente } from "../actions";
import { lerPendente, limparPendente } from "../pendente";

const SEM_CONEXAO = "Não conseguimos conectar agora. Confira sua internet e tente de novo.";

// Depois do cadastro e do consentimento, grava a triagem respondida antes do login.
// O aparelho pode ser compartilhado, então as respostas só entram numa conta sem
// triagem e depois de a pessoa confirmar que são dela. A tela não mostra as respostas.
export default function ConcluirTriagemPage() {
  const router = useRouter();
  const [perguntando, setPerguntando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    if (lerPendente() === null) {
      router.replace("/app");
      return;
    }
    situacaoDaTriagemPendente()
      .then((situacao) => {
        if (situacao === "login") {
          router.replace("/entrar?next=/triagem/concluir");
        } else if (situacao === "consentimento") {
          router.replace("/consentimento");
        } else if (situacao === "ja_tem_perfil") {
          limparPendente();
          router.replace("/app");
        } else {
          setPerguntando(true);
        }
      })
      .catch(() => setErro(SEM_CONEXAO));
  }, [router]);

  function usarRespostas() {
    setPerguntando(false);
    salvarTriagem(lerPendente())
      .then((res) => {
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
      })
      .catch(() => setErro(SEM_CONEXAO));
  }

  function responderDeNovo() {
    limparPendente();
    router.replace("/triagem");
  }

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
      ) : perguntando ? (
        <>
          <TituloPagina
            titulo="Foi você quem respondeu?"
            subtitulo="Encontramos uma triagem respondida neste aparelho antes de entrar na conta. Se mais alguém usa este aparelho, ela pode ser de outra pessoa."
            ilustracao="prancheta"
            fundo="bg-lilas"
          />
          <div className="flex flex-col gap-3">
            <BotaoPrimario type="button" onClick={usarRespostas}>
              Sim, usar minhas respostas
            </BotaoPrimario>
            <BotaoSecundario type="button" onClick={responderDeNovo}>
              Não, responder de novo
            </BotaoSecundario>
          </div>
        </>
      ) : (
        <p role="status" className="text-suave">
          Salvando suas respostas…
        </p>
      )}
    </Pagina>
  );
}
