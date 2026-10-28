import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { FUNDOS, Ilustracao, VISUAL_DO_PERFIL } from "@/components/ilustracoes";
import { AvisoMedico, Carregando, Logo, Pagina } from "@/components/ui";
import { artigosDoPerfil } from "@/content/artigos";
import { faseDaSemana } from "@/content/guias";
import { separarConsultas } from "@/lib/agenda";
import { exigirUsuariaPronta, listarConsultas, listarTarefasFeitas, type PerfilUsuaria } from "@/lib/dal";
import { formatarDataLonga, formatarHoje, partesDaData, quantoFalta } from "@/lib/datas";
import { dataProvavelDoParto, PERFIS, trimestre, type Perfil } from "@/lib/triagem";
import { TarefasInicio } from "./tarefas-inicio";

export const metadata: Metadata = { title: "Início" };

// Ícones simples de traço, no mesmo estilo da barra de abas.
const ICONES: Record<string, ReactNode> = {
  consulta: <path d="M3 10h18M8 3v4M16 3v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM12 13v5M9.5 15.5h5" />,
  lista: <path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />,
  parto: <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />,
  lupa: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />,
  livro: <path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14" />,
  telefone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  alerta: <path d="M12 3 2 20h20zM12 10v4M12 17v.5" />,
  cronometro: <path d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2.5M10 2h4M19 6l1.5-1.5" />,
};

function Icone({ nome, className = "size-6" }: { nome: keyof typeof ICONES; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {ICONES[nome]}
    </svg>
  );
}

type Atalho = { href: string; rotulo: string; icone: keyof typeof ICONES; cor: string };

// A partir desta semana, o atalho do contador de contrações substitui o de tipos de parto.
const SEMANA_CONTRACOES = 34;

function atalhosDoPerfil(perfil: Perfil, semanas: number | null): Atalho[] {
  const alerta: Atalho = { href: "/app/alertas", rotulo: "Sinais de alerta", icone: "alerta", cor: "bg-alerta-50 text-alerta-900" };
  const novaConsulta: Atalho = { href: "/app/agenda/nova", rotulo: "Nova consulta", icone: "consulta", cor: "bg-rosa-50 text-rosa-600" };
  const conteudo: Atalho = { href: "/app/conteudo", rotulo: "Conteúdo", icone: "livro", cor: "bg-azul-100 text-azul-900" };
  switch (perfil) {
    case "gestante":
      return [
        novaConsulta,
        { href: "/app/guias/semana", rotulo: "Minha semana", icone: "lista", cor: "bg-azul-100 text-azul-900" },
        semanas !== null && semanas >= SEMANA_CONTRACOES
          ? { href: "/app/guias/contracoes", rotulo: "Contrações", icone: "cronometro", cor: "bg-rosa-50 text-rosa-600" }
          : { href: "/app/guias/parto", rotulo: "Tipos de parto", icone: "parto", cor: "bg-rosa-50 text-rosa-600" },
        alerta,
      ];
    case "suspeita":
      return [
        { href: "/app/guias/sintomas", rotulo: "Checar sintomas", icone: "lupa", cor: "bg-azul-100 text-azul-900" },
        { href: "/app/guias/sintomas#confirmar", rotulo: "Como confirmar", icone: "lista", cor: "bg-rosa-50 text-rosa-600" },
        novaConsulta,
        alerta,
      ];
    case "acolhimento":
      return [conteudo, { href: "tel:188", rotulo: "Conversar (CVV 188)", icone: "telefone", cor: "bg-rosa-50 text-rosa-600" }, novaConsulta, alerta];
    default:
      return [novaConsulta, conteudo, { href: "/app/agenda", rotulo: "Agenda", icone: "consulta", cor: "bg-azul-100 text-azul-900" }, alerta];
  }
}

// Próximo passo sugerido no cartão principal de quem não é gestante.
const PROXIMO_PASSO: Record<Exclude<Perfil, "gestante">, { href: string; rotulo: string }> = {
  suspeita: { href: "/app/guias/sintomas", rotulo: "Checar meus sintomas" },
  tentante: { href: "/app/conteudo", rotulo: "Ver conteúdo para você" },
  puerpera: { href: "/app/conteudo", rotulo: "Ver conteúdo do pós-parto" },
  acolhimento: { href: "/app/conteudo", rotulo: "Ver conteúdo de apoio" },
};

function CartaoPrincipal({ perfil, semanas }: { perfil: PerfilUsuaria & { perfil: Perfil }; semanas: number | null }) {
  if (perfil.perfil === "gestante" && semanas !== null && perfil.dum) {
    const progresso = Math.min(100, Math.round((semanas / 40) * 100));
    const faltam = Math.max(0, 40 - semanas);
    return (
      <section
        aria-labelledby="titulo-semana"
        className="relative flex flex-col gap-4 overflow-hidden rounded-[2rem] bg-linear-to-br from-rosa-100 via-[#f6e6f0] to-azul-100 p-5 text-azul-900 shadow-flutuante"
      >
        <Ilustracao nome="coracao" className="pointer-events-none absolute -right-3 -top-3 h-28 opacity-90" />
        <div className="relative flex flex-col gap-1">
          <span className="text-sm font-semibold text-azul-700">{trimestre(semanas)}º trimestre</span>
          <h2 id="titulo-semana" className="text-[34px] font-bold leading-none tracking-tight">
            Semana {semanas}
          </h2>
          <span className="mt-1.5 self-start rounded-full bg-white/80 px-3 py-1 text-[13px] font-bold shadow-suave">
            {faltam > 0 ? `faltam ${faltam} semanas` : "reta final"}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div
            role="progressbar"
            aria-label="Progresso da gestação"
            aria-valuemin={0}
            aria-valuemax={40}
            aria-valuenow={semanas}
            className="h-2.5 overflow-hidden rounded-full bg-white/80"
          >
            <div className="h-full rounded-full bg-rosa-600" style={{ width: `${progresso}%` }} />
          </div>
          <div className="flex justify-between text-[12px] font-semibold text-azul-700">
            <span>{semanas} de 40 semanas</span>
            <span>Parto previsto: {formatarDataLonga(dataProvavelDoParto(perfil.dum))}</span>
          </div>
        </div>
        <p className="text-[15px] leading-relaxed">{faseDaSemana(semanas).resumo}</p>
        <Link href="/app/guias/semana" className="flex h-12 items-center justify-center rounded-2xl bg-white/90 text-[15px] font-semibold text-azul-900 shadow-suave hover:bg-white">
          Ver o que fazer nesta semana
        </Link>
      </section>
    );
  }

  const info = PERFIS[perfil.perfil];
  const passo = perfil.perfil === "gestante" ? null : PROXIMO_PASSO[perfil.perfil];
  const visual = VISUAL_DO_PERFIL[perfil.perfil];
  return (
    <section className={`relative flex flex-col gap-3 overflow-hidden rounded-[2rem] p-5 shadow-flutuante ${FUNDOS[visual.fundo]}`}>
      <Ilustracao nome={visual.ilustracao} className="pointer-events-none absolute -right-2 -top-2 h-28" />
      <span className="relative text-sm font-semibold text-tinta/70">Seu momento</span>
      <h2 className="relative max-w-[65%] text-[30px] font-bold leading-tight tracking-tight">{info.titulo}</h2>
      <p className="relative text-[15px] leading-relaxed text-tinta/85">{info.descricao}</p>
      {passo && (
        <Link href={passo.href} className="relative flex h-12 items-center justify-center rounded-2xl bg-white/90 text-[15px] font-semibold shadow-suave hover:bg-white">
          {passo.rotulo}
        </Link>
      )}
    </section>
  );
}

function Secao({ titulo, acao, children }: { titulo: string; acao?: { href: string; rotulo: string }; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold">{titulo}</h2>
        {acao && (
          <Link href={acao.href} className="rounded-full bg-white/80 px-3 py-1 text-[13px] font-semibold text-rosa-700 shadow-suave hover:bg-white">
            {acao.rotulo}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

async function Inicio() {
  const { usuaria, perfil, semanas } = await exigirUsuariaPronta();
  const gestante = perfil.perfil === "gestante" && semanas !== null;
  const [consultas, feitas] = await Promise.all([
    listarConsultas(usuaria.id),
    gestante ? listarTarefasFeitas(usuaria.id) : Promise.resolve([]),
  ]);
  const agora = new Date();
  const { proximas, paraConfirmar } = separarConsultas(consultas, agora);
  const proxima = proximas[0];
  const fase = gestante ? faseDaSemana(semanas) : null;
  const tarefasFeitas = fase ? fase.tarefas.filter((t) => feitas.includes(t.id)).length : 0;
  const artigos = artigosDoPerfil(perfil.perfil).filter((a) => !a.premium).slice(0, 2);

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">Olá{perfil.nome ? `, ${perfil.nome}` : ""}!</h1>
          <p className="text-sm capitalize text-suave">{formatarHoje(agora)}</p>
        </div>
        <Logo tamanho={44} />
      </header>

      <CartaoPrincipal perfil={perfil} semanas={semanas} />

      <nav aria-label="Atalhos" className="grid grid-cols-4 gap-2">
        {atalhosDoPerfil(perfil.perfil, semanas).map((a) => (
          <Link key={a.href + a.rotulo} href={a.href} className="flex flex-col items-center gap-1.5 rounded-2xl p-1 text-center">
            <span className={`flex size-14 items-center justify-center rounded-2xl shadow-suave ${a.cor}`}>
              <Icone nome={a.icone} />
            </span>
            <span className="text-[12px] font-semibold leading-tight">{a.rotulo}</span>
          </Link>
        ))}
      </nav>

      <Secao titulo="Agenda" acao={{ href: "/app/agenda", rotulo: "Ver tudo" }}>
        {paraConfirmar.length > 0 && (
          <Link href="/app/agenda?aba=confirmar" className="flex items-center justify-between gap-3 rounded-2xl bg-rosa-50 px-4 py-3 text-rosa-700">
            <span className="text-sm font-semibold">
              {paraConfirmar.length === 1 ? "1 consulta para confirmar" : `${paraConfirmar.length} consultas para confirmar`}
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        )}
        {proxima ? (
          <Link href="/app/agenda" className="flex items-center gap-4 rounded-3xl bg-white/90 shadow-suave p-4">
            <span aria-hidden="true" className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-azul-100 py-2 text-azul-900">
              <span className="text-[11px] font-bold uppercase">{partesDaData(proxima.data_hora).diaSemana}</span>
              <span className="text-2xl font-bold leading-none">{partesDaData(proxima.data_hora).dia}</span>
              <span className="text-[11px] font-semibold uppercase">{partesDaData(proxima.data_hora).mes}</span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[12px] font-bold uppercase tracking-wide text-azul-700">Próxima · {quantoFalta(proxima.data_hora, agora)}</span>
              <span className="font-bold leading-snug">{proxima.titulo}</span>
              <span className="text-sm text-suave">
                {partesDaData(proxima.data_hora).hora}
                {proxima.local ? ` · ${proxima.local}` : ""}
              </span>
            </span>
          </Link>
        ) : (
          <p className="text-[15px] text-suave">
            Nenhuma consulta marcada.{" "}
            <Link href="/app/agenda/nova" className="font-semibold text-rosa-600 underline">
              Adicionar
            </Link>
          </p>
        )}
      </Secao>

      {fase && (
        <Secao titulo="Para fazer nesta fase" acao={{ href: "/app/guias/semana", rotulo: `${tarefasFeitas} de ${fase.tarefas.length} feitas` }}>
          <TarefasInicio tarefas={fase.tarefas} feitasIniciais={feitas} />
        </Secao>
      )}

      <Secao titulo="Para você" acao={{ href: "/app/conteudo", rotulo: "Ver conteúdo" }}>
        <div className="flex flex-col gap-2.5">
          {artigos.map((a) => (
            <Link key={a.slug} href={`/app/conteudo/${a.slug}`} className="flex items-center gap-3 rounded-2xl bg-white/90 shadow-suave p-4">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rosa-50 text-rosa-600">
                <Icone nome="livro" className="size-5" />
              </span>
              <span className="flex-1 font-semibold leading-snug">{a.titulo}</span>
              <span aria-hidden="true" className="text-suave">
                ›
              </span>
            </Link>
          ))}
        </div>
      </Secao>
    </>
  );
}

export default function InicioPage() {
  return (
    <Pagina>
      <Suspense fallback={<Carregando />}>
        <Inicio />
      </Suspense>
      <AvisoMedico />
    </Pagina>
  );
}
