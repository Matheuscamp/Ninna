"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Bolha, Icone } from "@/components/acolhida";
import { FUNDOS, Ilustracao, VISUAL_DO_PERFIL } from "@/components/ilustracoes";
import { AvisoMedico, BotaoPrimario, Opcao } from "@/components/ui";
import {
  calcularDum,
  classificarPerfil,
  dataProvavelDoParto,
  dumPlausivel,
  idadeGestacional,
  limparRespostas,
  PERFIS,
  trimestre,
  type Respostas,
} from "@/lib/triagem";
import { salvarTriagem } from "./actions";
import { guardarPendente } from "./pendente";

type Rascunho = Partial<Respostas>;

type Passo = "momento" | "teste" | "data" | "detalhes" | "historia" | "saude" | "acompanhante";

function passos(r: Rascunho): Passo[] {
  const gestante = classificarPerfil({ momento: r.momento ?? "tentando", teste: r.teste }) === "gestante";
  return [
    "momento",
    ...(r.momento === "suspeita" ? (["teste"] as const) : []),
    ...(r.momento && gestante ? (["data", "detalhes"] as const) : []),
    "historia",
    "saude",
    "acompanhante",
  ];
}

function podeAvancar(passo: Passo, r: Rascunho) {
  switch (passo) {
    case "momento":
      return !!r.momento;
    case "teste":
      return !!r.teste;
    case "data":
      return r.fonteData === "semanas" ? !!r.semanas : !!r.fonteData && !!r.data;
    case "historia":
      return r.jaMae !== undefined;
    default:
      return true;
  }
}

function hojeLocal() {
  return new Date().toLocaleDateString("en-CA");
}

function formatarData(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function Pergunta({ titulo, ajuda, children }: { titulo: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 flex flex-col gap-2">
        <span className="text-[28px] font-bold leading-tight tracking-tight">{titulo}</span>
        {ajuda && <span className="text-[15px] leading-relaxed text-suave">{ajuda}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function SubPergunta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      <span className="font-semibold">{titulo}</span>
      {children}
    </div>
  );
}

export function AssistenteTriagem() {
  const router = useRouter();
  const [r, setR] = useState<Rascunho>({});
  const [indice, setIndice] = useState(0);
  const [resultado, setResultado] = useState<{ semanas: number; dpp: string } | null | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();

  const lista = passos(r);
  const passo = lista[Math.min(indice, lista.length - 1)];
  const atualizar = (patch: Rascunho) => {
    setErro(null);
    setR((anterior) => ({ ...anterior, ...patch }));
  };

  function avancar() {
    if (passo === "data") {
      const hoje = hojeLocal();
      const dum = calcularDum(r, hoje);
      if (!dum || !dumPlausivel(dum, hoje)) {
        setErro("Confira a data: ela precisa corresponder a uma gestação de 1 a 42 semanas.");
        return;
      }
    }
    if (indice < lista.length - 1) {
      setIndice(indice + 1);
      return;
    }
    // Última pergunta: calcula o resultado para mostrar antes de salvar.
    const hoje = hojeLocal();
    const dum = calcularDum(r, hoje);
    const gestante = classificarPerfil(r as Respostas) === "gestante";
    setResultado(gestante && dum ? { semanas: idadeGestacional(dum, hoje).semanas, dpp: dataProvavelDoParto(dum) } : null);
  }

  function voltar() {
    setErro(null);
    if (resultado !== undefined) setResultado(undefined);
    else if (indice > 0) setIndice(indice - 1);
    else router.push("/");
  }

  function salvar() {
    iniciarSalvar(async () => {
      const respostas = limparRespostas(r as Respostas);
      const res = await salvarTriagem(respostas);
      if (res.ok) {
        router.push("/app");
      } else if (res.motivo === "login") {
        guardarPendente(respostas);
        router.push("/cadastro");
      } else if (res.motivo === "consentimento") {
        guardarPendente(respostas);
        router.push("/consentimento");
      } else {
        setErro(res.mensagem ?? "Algo deu errado. Tente de novo.");
      }
    });
  }

  const cabecalho = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={voltar}
          aria-label="Voltar"
          className="-ml-1 flex size-11 items-center justify-center rounded-full bg-white/80 shadow-sm hover:bg-white"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-current stroke-2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="flex-1 text-sm font-semibold text-suave">
          {resultado === undefined ? `Pergunta ${indice + 1} de ${lista.length}` : "Resultado"}
        </span>
        <Image src="/ninna-logo.svg" alt="Ninna" width={36} height={36} className="rounded-[22%]" />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/80" aria-hidden="true">
        <div
          className="h-full rounded-full bg-rosa-600 transition-all"
          style={{ width: resultado === undefined ? `${((indice + 1) / (lista.length + 1)) * 100}%` : "100%" }}
        />
      </div>
    </div>
  );

  if (resultado !== undefined) {
    const perfil = classificarPerfil(r as Respostas);
    const info = PERFIS[perfil];
    const visual = VISUAL_DO_PERFIL[perfil];
    return (
      <div className="flex flex-1 flex-col gap-5">
        {cabecalho}
        <section className={`relative overflow-hidden rounded-[2rem] p-6 ${FUNDOS[visual.fundo]}`}>
          <Ilustracao nome={visual.ilustracao} className="absolute -right-2 -top-1 h-32" />
          <p className="relative text-[13px] font-bold uppercase tracking-wide text-tinta/70">Seu perfil</p>
          <h1 className="relative mt-1 max-w-[62%] text-[30px] font-bold leading-tight">{info.titulo}</h1>
          <p className="relative mt-4 text-[15px] leading-relaxed text-tinta/80">{info.descricao}</p>
        </section>
        {resultado && (
          <div className="flex items-center gap-4 rounded-3xl bg-white/90 p-5 shadow-sm">
            <span className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-rosa-600 text-white">
              <span className="text-2xl font-bold leading-none">{resultado.semanas}</span>
              <span className="text-[11px] font-semibold">semanas</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-azul-700">{trimestre(resultado.semanas)}º trimestre</span>
              <span className="text-[15px] leading-snug">
                Data provável do parto: <strong>{formatarData(resultado.dpp)}</strong>
              </span>
            </span>
          </div>
        )}
        <div className="flex flex-col gap-3 rounded-3xl bg-white/90 p-5 shadow-sm">
          <span className="font-bold">O que preparamos para você</span>
          <ul className="flex flex-col gap-3">
            {info.preparado.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-snug">
                <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-rosa-50 text-rosa-600">
                  <Icone nome="check" className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {erro && (
          <p role="alert" className="text-sm text-alerta">
            {erro}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-3">
          <BotaoPrimario type="button" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar e continuar"}
          </BotaoPrimario>
          <AvisoMedico />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {cabecalho}

      {passo === "momento" && (
        <Pergunta titulo="Qual é o seu momento hoje?">
          {(
            [
              ["tentando", "Estou tentando engravidar", "Quero me preparar", "folha", "menta"],
              ["suspeita", "Acho que posso estar grávida", "Atraso ou sintomas, sem confirmação", "teste", "lilas"],
              ["gravida", "Estou grávida", "Gestação confirmada", "coracao", "rosa"],
              ["nasceu", "Meu bebê já nasceu", "Estou no pós-parto", "bebe", "azul"],
              ["perda", "Passei por uma perda", "Quero apoio e informação", "flor", "baunilha"],
            ] as const
          ).map(([valor, titulo, descricao, ilustracao, fundo]) => (
            <Opcao
              key={valor}
              titulo={titulo}
              descricao={descricao}
              icone={<Bolha nome={ilustracao} fundo={FUNDOS[fundo]} className="size-12" />}
              selecionada={r.momento === valor}
              onClick={() => atualizar({ momento: valor })}
            />
          ))}
        </Pergunta>
      )}

      {passo === "teste" && (
        <Pergunta titulo="Você já fez um teste de gravidez?" ajuda="Pode ser de farmácia ou exame de sangue (Beta-hCG).">
          {(
            [
              ["positivo", "Sim, deu positivo"],
              ["negativo", "Sim, deu negativo"],
              ["nao_fez", "Ainda não fiz"],
            ] as const
          ).map(([valor, titulo]) => (
            <Opcao key={valor} titulo={titulo} selecionada={r.teste === valor} onClick={() => atualizar({ teste: valor })} />
          ))}
        </Pergunta>
      )}

      {passo === "data" && (
        <Pergunta titulo="De quanto tempo você está?" ajuda="Escolha a informação que você tem. Nós calculamos as semanas.">
          {(
            [
              ["semanas", "Sei quantas semanas", "Pelo ultrassom ou pelo médico", "prancheta"],
              ["dum", "Sei a data da última menstruação", "Primeiro dia da última menstruação", "calendario"],
              ["dpp", "Sei a data prevista do parto", "Informada pelo médico", "bebe"],
            ] as const
          ).map(([valor, titulo, descricao, ilustracao]) => (
            <Opcao
              key={valor}
              titulo={titulo}
              descricao={descricao}
              icone={<Bolha nome={ilustracao} fundo="bg-azul-50" className="size-12" />}
              selecionada={r.fonteData === valor}
              onClick={() => atualizar({ fonteData: valor, data: undefined, semanas: valor === "semanas" ? r.semanas ?? 9 : undefined })}
            />
          ))}
          {r.fonteData === "semanas" && (
            <div className="mt-2 flex items-center justify-between rounded-3xl bg-white/90 shadow-suave p-5">
              <button
                type="button"
                aria-label="Menos uma semana"
                onClick={() => atualizar({ semanas: Math.max(1, (r.semanas ?? 9) - 1) })}
                className="size-12 rounded-full border-2 border-linha text-2xl"
              >
                −
              </button>
              <span className="flex flex-col items-center">
                <span className="text-5xl font-bold leading-none" aria-live="polite">
                  {r.semanas}
                </span>
                <span className="text-sm text-suave">semanas</span>
              </span>
              <button
                type="button"
                aria-label="Mais uma semana"
                onClick={() => atualizar({ semanas: Math.min(42, (r.semanas ?? 9) + 1) })}
                className="size-12 rounded-full border-2 border-linha text-2xl"
              >
                +
              </button>
            </div>
          )}
          {(r.fonteData === "dum" || r.fonteData === "dpp") && (
            <label className="mt-2 flex flex-col gap-1.5">
              <span className="text-sm font-semibold">
                {r.fonteData === "dum" ? "Data da última menstruação" : "Data prevista do parto"}
              </span>
              <input
                type="date"
                value={r.data ?? ""}
                onChange={(e) => atualizar({ data: e.target.value || undefined })}
                className="h-12 rounded-xl border-2 border-linha bg-white px-4 text-base outline-none focus:border-rosa-600"
              />
            </label>
          )}
        </Pergunta>
      )}

      {passo === "detalhes" && (
        <Pergunta titulo="Sobre a sua gestação" ajuda="Opcional, mas ajuda a personalizar a agenda.">
          <SubPergunta titulo="Quantos bebês?">
            <div className="grid grid-cols-2 gap-3">
              <Opcao titulo="Um bebê" selecionada={r.multipla === false} onClick={() => atualizar({ multipla: false })} />
              <Opcao titulo="Gêmeos ou mais" selecionada={r.multipla === true} onClick={() => atualizar({ multipla: true })} />
            </div>
          </SubPergunta>
          <SubPergunta titulo="Onde você faz o pré-natal?">
            {(
              [
                ["sus", "SUS (UBS)"],
                ["particular", "Particular ou convênio"],
                ["nao_iniciou", "Ainda não comecei"],
              ] as const
            ).map(([valor, titulo]) => (
              <Opcao key={valor} titulo={titulo} selecionada={r.preNatal === valor} onClick={() => atualizar({ preNatal: valor })} />
            ))}
          </SubPergunta>
        </Pergunta>
      )}

      {passo === "historia" && (
        <Pergunta titulo="Você já tem filhos?" ajuda="Assim ajustamos o nível de detalhe das explicações.">
          <div className="grid grid-cols-2 gap-3">
            <Opcao titulo="Não, ainda não" selecionada={r.jaMae === false} onClick={() => atualizar({ jaMae: false, partoAnterior: undefined })} />
            <Opcao titulo="Sim, já sou mãe" selecionada={r.jaMae === true} onClick={() => atualizar({ jaMae: true })} />
          </div>
          {r.jaMae && (
            <SubPergunta titulo="Como foi o parto? (opcional)">
              {(
                [
                  ["normal", "Normal"],
                  ["cesarea", "Cesárea"],
                  ["ambos", "Já tive os dois"],
                ] as const
              ).map(([valor, titulo]) => (
                <Opcao key={valor} titulo={titulo} selecionada={r.partoAnterior === valor} onClick={() => atualizar({ partoAnterior: valor })} />
              ))}
            </SubPergunta>
          )}
          {r.momento !== "perda" && (
            <SubPergunta titulo="Já passou por alguma perda gestacional? (opcional)">
              {(
                [
                  ["nao", "Não"],
                  ["sim", "Sim"],
                  ["prefiro_nao_dizer", "Prefiro não dizer"],
                ] as const
              ).map(([valor, titulo]) => (
                <Opcao key={valor} titulo={titulo} selecionada={r.perdaAnterior === valor} onClick={() => atualizar({ perdaAnterior: valor })} />
              ))}
            </SubPergunta>
          )}
        </Pergunta>
      )}

      {passo === "saude" && (
        <Pergunta
          titulo="Você tem alguma condição de saúde acompanhada por médico?"
          ajuda="Por exemplo pressão alta, diabetes, tireoide ou gestação de alto risco. Opcional."
        >
          {(
            [
              ["nao", "Não"],
              ["sim", "Sim"],
              ["nao_sei", "Não sei"],
            ] as const
          ).map(([valor, titulo]) => (
            <Opcao key={valor} titulo={titulo} selecionada={r.altoRisco === valor} onClick={() => atualizar({ altoRisco: valor })} />
          ))}
        </Pergunta>
      )}

      {passo === "acompanhante" && (
        <Pergunta titulo="Quem está com você nessa fase?" ajuda="Opcional. No futuro, você poderá convidar essa pessoa para o app.">
          {(
            [
              ["parceiro", "Parceiro ou parceira"],
              ["familia", "Alguém da família"],
              ["ninguem", "Estou sozinha por enquanto"],
            ] as const
          ).map(([valor, titulo]) => (
            <Opcao key={valor} titulo={titulo} selecionada={r.acompanhante === valor} onClick={() => atualizar({ acompanhante: valor })} />
          ))}
        </Pergunta>
      )}

      {erro && (
        <p role="alert" className="text-sm text-alerta">
          {erro}
        </p>
      )}
      <div className="mt-auto">
        <BotaoPrimario type="button" onClick={avancar} disabled={!podeAvancar(passo, r)}>
          {indice === lista.length - 1 ? "Ver meu resultado" : "Continuar"}
        </BotaoPrimario>
      </div>
    </div>
  );
}
