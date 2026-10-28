import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icone } from "@/components/acolhida";
import { AvisoMedico, Pagina, TituloPagina, Voltar } from "@/components/ui";
import { FAIXAS, formatarTaxa, metodosPorFaixa, SEM_METODO, TEXTOS_CONTRACEPCAO, type Faixa, type Metodo } from "@/content/contracepcao";

export const metadata: Metadata = { title: "Métodos contraceptivos" };

// Cor de cada faixa de eficácia (pastéis do design system, texto escuro).
const COR_FAIXA: Record<Faixa, { fundo: string; barra: string }> = {
  "muito-eficaz": { fundo: "bg-menta", barra: "bg-verde" },
  eficaz: { fundo: "bg-baunilha", barra: "bg-ambar" },
  "menos-eficaz": { fundo: "bg-pessego", barra: "bg-laranja" },
};

const AMAMENTACAO: Record<Metodo["amamentacao"], string | null> = {
  sim: "Pode usar amamentando",
  "depois de 6 semanas": "Amamentando: a partir de 6 semanas",
  "depois de 6 meses": "Amamentando: só depois de 6 meses",
  "não se aplica": null,
};

function Etiqueta({ children, destaque = false }: { children: ReactNode; destaque?: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${destaque ? "bg-rosa-600 text-white" : "bg-azul-50 text-azul-900"}`}>{children}</span>
  );
}

function CartaoMetodo({ metodo, faixa }: { metodo: Metodo; faixa: Faixa }) {
  const etiquetas = [
    metodo.sus && "Grátis no SUS",
    metodo.hormonal ? "Com hormônio" : "Sem hormônio",
    metodo.duracao,
    AMAMENTACAO[metodo.amamentacao],
  ].filter((e): e is string => Boolean(e));

  return (
    <li className="flex flex-col gap-3 rounded-3xl bg-white/90 p-4 shadow-suave">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-bold leading-snug">{metodo.nome}</h4>
        {metodo.protegeIst && <Etiqueta destaque>Protege contra IST</Etiqueta>}
      </div>
      <p className="text-[14px] leading-relaxed text-suave">{metodo.comoFunciona}</p>
      <dl className="grid grid-cols-2 gap-2">
        <div className={`flex flex-col rounded-2xl px-3 py-2 ${COR_FAIXA[faixa].fundo}`}>
          <dt className="text-[11px] font-bold uppercase tracking-wide text-tinta/70">No dia a dia</dt>
          <dd className="text-[15px] font-bold">
            {formatarTaxa(metodo.usoComum)}
            {metodo.usoComum !== null && <span className="font-semibold text-tinta/70"> em 100</span>}
          </dd>
        </div>
        <div className="flex flex-col rounded-2xl bg-azul-50 px-3 py-2">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-tinta/70">Uso perfeito</dt>
          <dd className="text-[15px] font-bold">
            {formatarTaxa(metodo.usoCorreto)}
            {metodo.usoCorreto !== null && <span className="font-semibold text-tinta/70"> em 100</span>}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-1.5">
        {etiquetas.map((e) => (
          <Etiqueta key={e}>{e}</Etiqueta>
        ))}
      </div>
    </li>
  );
}

function Lista({ itens, icone = "check" }: { itens: readonly string[]; icone?: "check" | "alerta" }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {itens.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-snug">
          <span
            aria-hidden="true"
            className={`flex size-6 shrink-0 items-center justify-center rounded-full ${icone === "check" ? "bg-rosa-50 text-rosa-600" : "bg-baunilha text-tinta"}`}
          >
            <Icone nome={icone} className="size-3.5" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// Conteúdo público dentro do app: não lê dados da usuária (o proxy já exige login).
export default function ContracepcaoPage() {
  const t = TEXTOS_CONTRACEPCAO;
  return (
    <Pagina larga>
      <Voltar href="/app/conteudo" rotulo="Conteúdo" />
      <TituloPagina titulo="Métodos contraceptivos" subtitulo="Conheça as opções para escolher com a sua equipe" ilustracao="calendario" fundo="bg-menta" />
      <p className="text-[17px] leading-relaxed">{t.intro}</p>
      <p className="flex gap-3 rounded-3xl bg-rosa-50 p-5 text-[15px] leading-relaxed">
        <Icone nome="coracao" className="mt-0.5 size-5 text-rosa-600" />
        <span>{t.duplaProtecao}</span>
      </p>

      <section aria-labelledby="titulo-eficacia" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 id="titulo-eficacia" className="text-[22px] font-bold leading-tight">
            Quanto cada método protege
          </h2>
          <p className="text-[15px] leading-relaxed text-suave">
            Número de gestações em cada 100 mulheres no primeiro ano de uso. &ldquo;No dia a dia&rdquo; é como as pessoas costumam usar; &ldquo;uso
            perfeito&rdquo;, quando o método é usado sempre do jeito certo. Sem nenhum método, {SEM_METODO} em cada 100 engravidam em um ano.
          </p>
        </div>
        {metodosPorFaixa().map(({ faixa, metodos }) => (
          <section key={faixa} aria-labelledby={`faixa-${faixa}`} className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${COR_FAIXA[faixa].fundo}`}>
              <span aria-hidden="true" className={`h-8 w-1.5 shrink-0 rounded-full ${COR_FAIXA[faixa].barra}`} />
              <div className="flex flex-col">
                <h3 id={`faixa-${faixa}`} className="font-bold">
                  {FAIXAS[faixa].titulo}
                </h3>
                <p className="text-[13px] leading-snug text-tinta/80">{FAIXAS[faixa].descricao}</p>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {metodos.map((m) => (
                <CartaoMetodo key={m.id} metodo={m} faixa={faixa} />
              ))}
            </ul>
          </section>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="titulo-diu" className="flex flex-col gap-4 rounded-3xl bg-white/90 p-5 shadow-suave">
          <h2 id="titulo-diu" className="text-xl font-bold">
            DIU de cobre
          </h2>
          <p className="text-[15px] leading-relaxed">{t.diuCobre.resumo}</p>
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-suave">Vantagens</h3>
            <Lista itens={t.diuCobre.vantagens} />
          </div>
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-suave">Pode acontecer</h3>
            <Lista itens={t.diuCobre.desvantagens} icone="alerta" />
          </div>
          <p className="rounded-2xl bg-azul-50 p-3.5 text-[14px] leading-relaxed text-suave">{t.diuCobre.quemNaoPode}</p>
        </section>

        <section aria-labelledby="titulo-implante" className="flex flex-col gap-4 rounded-3xl bg-white/90 p-5 shadow-suave">
          <h2 id="titulo-implante" className="text-xl font-bold">
            Implante
          </h2>
          <p className="text-[15px] leading-relaxed">{t.implante.resumo}</p>
          <Lista itens={t.implante.pontos} />
        </section>

        <section aria-labelledby="titulo-cirurgia" className="flex flex-col gap-4 rounded-3xl bg-white/90 p-5 shadow-suave">
          <h2 id="titulo-cirurgia" className="text-xl font-bold">
            Laqueadura e vasectomia
          </h2>
          <Lista itens={t.cirurgia} />
        </section>

        <section aria-labelledby="titulo-emergencia" className="flex flex-col gap-4 rounded-3xl bg-white/90 p-5 shadow-suave">
          <h2 id="titulo-emergencia" className="text-xl font-bold">
            Contracepção de emergência
          </h2>
          <Lista itens={t.emergencia} />
        </section>
      </div>

      <p className="rounded-3xl bg-white/90 p-5 text-[15px] leading-relaxed shadow-suave">{t.falhas}</p>
      <Link
        href={`/app/agenda/nova?titulo=${encodeURIComponent("Consulta de planejamento reprodutivo")}&local=${encodeURIComponent("UBS")}`}
        className="flex h-13 items-center justify-center gap-2 self-stretch rounded-2xl bg-rosa-600 px-6 text-[17px] font-semibold text-white shadow-rosa hover:bg-rosa-700 sm:self-start"
      >
        <Icone nome="calendario" />
        Agendar consulta de planejamento
      </Link>
      <p className="text-[12px] leading-relaxed text-suave">
        Fonte: {t.fonte}. Informação geral, em revisão por profissional de saúde.
      </p>
      <AvisoMedico />
    </Pagina>
  );
}
