import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/ui";
import { UsoDoPlano } from "@/components/uso-do-plano";
import { separarConsultas } from "@/lib/agenda";
import { limite } from "@/lib/planos";
import { exigirUsuariaPronta, getPlano, listarConsultas, type Consulta } from "@/lib/dal";
import { partesDaData, quantoFalta } from "@/lib/datas";
import { AlternarConcluida } from "./concluir";
import { RemoverConsulta } from "./remover";

export const metadata: Metadata = { title: "Agenda" };

const MENSAGENS: Record<string, { texto: string; erro?: boolean }> = {
  criada: { texto: "Consulta adicionada." },
  editada: { texto: "Alterações salvas." },
  removida: { texto: "Consulta removida." },
  concluida: { texto: "Consulta marcada como concluída." },
  reaberta: { texto: "Consulta desmarcada. Ela voltou para a agenda." },
  erro: { texto: "Não foi possível concluir. Tente de novo.", erro: true },
};

type Aba = "proximas" | "confirmar" | "concluidas";

const ABAS: { id: Aba; rotulo: string; vazio: string }[] = [
  { id: "proximas", rotulo: "Próximas", vazio: "Nenhuma consulta marcada. Toque em “Nova” para adicionar." },
  { id: "confirmar", rotulo: "Para confirmar", vazio: "Nada para confirmar. Consultas que passarem da data sem ser marcadas aparecem aqui." },
  { id: "concluidas", rotulo: "Concluídas", vazio: "Nenhuma consulta concluída ainda." },
];

function CartaoConsulta({ consulta, aba, destaque, agora }: { consulta: Consulta; aba: Aba; destaque?: boolean; agora: Date }) {
  const p = partesDaData(consulta.data_hora);
  const concluida = aba === "concluidas";
  const confirmar = aba === "confirmar";

  return (
    <li className={`flex flex-col gap-3 rounded-3xl p-4 ${destaque ? "bg-azul-100" : "bg-white"}`}>
      <div className="flex gap-4">
        {/* Bloco de calendário: o dia em destaque facilita bater o olho na agenda. */}
        <div
          aria-hidden="true"
          className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl py-2 ${
            destaque ? "bg-white text-azul-900" : concluida ? "bg-azul-50 text-suave" : "bg-azul-100 text-azul-900"
          }`}
        >
          <span className="text-[11px] font-bold uppercase">{p.diaSemana}</span>
          <span className="text-2xl font-bold leading-none">{p.dia}</span>
          <span className="text-[11px] font-semibold uppercase">{p.mes}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {destaque && <span className="text-[12px] font-bold uppercase tracking-wide text-azul-700">Próxima</span>}
          <h3 className={`text-base font-bold leading-snug ${concluida ? "text-suave" : ""}`}>{consulta.titulo}</h3>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-suave">
            <span className="sr-only">{`${p.diaSemana}, ${p.dia} de ${p.mes}, `}</span>
            <span className={`font-semibold ${concluida ? "" : "text-rosa-600"}`}>{p.hora}</span>
            {aba === "proximas" && (
              <>
                <span aria-hidden="true">·</span>
                <span>{quantoFalta(consulta.data_hora, agora)}</span>
              </>
            )}
            {consulta.local && (
              <>
                <span aria-hidden="true">·</span>
                <span>{consulta.local}</span>
              </>
            )}
          </p>
          {consulta.observacoes && <p className="line-clamp-2 text-sm leading-snug text-suave">{consulta.observacoes}</p>}
          {confirmar && <p className="text-sm font-semibold text-rosa-700">Você foi a esta consulta?</p>}
        </div>
      </div>

      <div className={`flex flex-wrap items-center gap-1 border-t pt-2 ${destaque ? "border-white/60" : "border-azul-50"} ${confirmar ? "justify-between" : "justify-end"}`}>
        {confirmar && <AlternarConcluida id={consulta.id} titulo={consulta.titulo} concluida={false} destaque aba={aba} />}
        <div className="flex flex-wrap items-center justify-end gap-1">
          {aba === "proximas" && <AlternarConcluida id={consulta.id} titulo={consulta.titulo} concluida={false} aba={aba} />}
          {concluida && <AlternarConcluida id={consulta.id} titulo={consulta.titulo} concluida aba={aba} />}
          {!concluida && (
            <Link
              href={`/app/agenda/${consulta.id}/editar`}
              aria-label={`${confirmar ? "Remarcar" : "Editar"} ${consulta.titulo}`}
              className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-azul-700 hover:bg-white/70"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-none stroke-current" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
              </svg>
              {confirmar ? "Remarcar" : "Editar"}
            </Link>
          )}
          <RemoverConsulta id={consulta.id} titulo={consulta.titulo} aba={aba} />
        </div>
      </div>
    </li>
  );
}

// Agrupa por mês (ex.: "novembro de 2026"), mantendo a ordem.
function porMes(consultas: Consulta[]) {
  const grupos = new Map<string, Consulta[]>();
  for (const c of consultas) {
    const mes = partesDaData(c.data_hora).mesAno;
    grupos.set(mes, [...(grupos.get(mes) ?? []), c]);
  }
  return [...grupos.entries()];
}

async function Agenda({ searchParams }: { searchParams: PageProps<"/app/agenda">["searchParams"] }) {
  const { usuaria } = await exigirUsuariaPronta();
  const [consultas, params, plano] = await Promise.all([listarConsultas(usuaria.id), searchParams, getPlano(usuaria.id)]);
  const agora = new Date();
  const grupos = separarConsultas(consultas, agora);
  const listas: Record<Aba, Consulta[]> = { proximas: grupos.proximas, confirmar: grupos.paraConfirmar, concluidas: grupos.concluidas };
  const aba: Aba = ABAS.some((a) => a.id === params.aba) ? (params.aba as Aba) : "proximas";
  const lista = listas[aba];
  const mensagem = typeof params.ok === "string" ? MENSAGENS[params.ok] : undefined;
  return (
    <>
      <UsoDoPlano usados={grupos.proximas.length} limite={limite(plano, "consultasFuturas")} rotulo="consultas futuras" />

      {mensagem && (
        <p role="status" className={`rounded-2xl px-4 py-3 text-[15px] font-semibold ${mensagem.erro ? "bg-rosa-50 text-rosa-700" : "bg-azul-100 text-azul-900"}`}>
          {mensagem.texto}
        </p>
      )}

      <nav aria-label="Filtrar consultas" className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1">
        {ABAS.map((a) => {
          const ativa = a.id === aba;
          const total = listas[a.id].length;
          const alerta = a.id === "confirmar" && total > 0;
          return (
            <Link
              key={a.id}
              href={`/app/agenda?aba=${a.id}`}
              scroll={false}
              aria-current={ativa ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-1 text-[13px] font-bold ${ativa ? "bg-rosa-600 text-white" : "text-tinta hover:bg-azul-50"}`}
            >
              {a.rotulo}
              <span
                className={`min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 ${
                  ativa ? "bg-white/25" : alerta ? "bg-rosa-600 text-white" : "bg-azul-50 text-suave"
                }`}
              >
                {total}
              </span>
            </Link>
          );
        })}
      </nav>

      {lista.length === 0 ? (
        <p className="px-4 py-10 text-center text-[15px] leading-relaxed text-suave">{ABAS.find((a) => a.id === aba)?.vazio}</p>
      ) : aba === "proximas" ? (
        porMes(lista).map(([mes, doMes], i) => (
          <section key={mes} className="flex flex-col gap-2.5">
            <h2 className="text-sm font-semibold capitalize text-suave">{mes}</h2>
            <ul className="flex flex-col gap-3">
              {doMes.map((c, j) => (
                <CartaoConsulta key={c.id} consulta={c} aba={aba} destaque={i === 0 && j === 0} agora={agora} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((c) => (
            <CartaoConsulta key={c.id} consulta={c} aba={aba} agora={agora} />
          ))}
        </ul>
      )}
    </>
  );
}

export default function AgendaPage({ searchParams }: PageProps<"/app/agenda">) {
  return (
    <Pagina>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold">Agenda</h1>
        <Link
          href="/app/agenda/nova"
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-rosa-600 px-4 text-[15px] font-semibold text-white hover:bg-rosa-700"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nova
        </Link>
      </div>
      <Suspense fallback={<Carregando />}>
        <Agenda searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}
