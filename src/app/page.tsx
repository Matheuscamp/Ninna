import Link from "next/link";
import { CabecalhoPublico, CenaNinna, FundoSuave, Icone, Selo, type NomeIcone } from "@/components/acolhida";
import { FUNDOS, Ilustracao, type Fundo, type NomeIlustracao } from "@/components/ilustracoes";
import { AvisoMedico } from "@/components/ui";

const MOMENTOS: { titulo: string; texto: string; ilustracao: NomeIlustracao; fundo: Fundo }[] = [
  { titulo: "Tentando engravidar", texto: "Preparo, ácido fólico e consulta antes da gravidez", ilustracao: "folha", fundo: "menta" },
  { titulo: "Suspeita de gravidez", texto: "Quando fazer o teste e onde fazer de graça", ilustracao: "teste", fundo: "lilas" },
  { titulo: "Grávida", texto: "O que fazer e quais exames em cada semana", ilustracao: "coracao", fundo: "rosa" },
  { titulo: "Pós-parto", texto: "Recuperação, amamentação e o bebê", ilustracao: "bebe", fundo: "azul" },
  { titulo: "Depois de uma perda", texto: "Acolhimento e informação, no seu tempo", ilustracao: "flor", fundo: "baunilha" },
];

const RECURSOS: { titulo: string; texto: string; icone: NomeIcone }[] = [
  { titulo: "Semana a semana", texto: "Como está o bebê, o que fazer e quais exames pedir em cada fase.", icone: "semana" },
  { titulo: "Agenda do pré-natal", texto: "Consultas e exames num só lugar, para não esquecer nenhum.", icone: "calendario" },
  { titulo: "Documentos de saúde", texto: "Exames, laudos e receitas guardados com segurança.", icone: "pasta" },
  { titulo: "Sinais de alerta", texto: "Quando procurar atendimento, sempre à mão e sempre grátis.", icone: "alerta" },
];

const CTA =
  "flex h-14 items-center justify-center gap-2 rounded-2xl bg-rosa-600 px-6 text-[17px] font-semibold text-white shadow-rosa transition hover:bg-rosa-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rosa-600";

export default function LandingPage() {
  return (
    <FundoSuave>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-5 pb-10 pt-5 lg:gap-20 lg:pt-8">
        <CabecalhoPublico
          direita={
            <Link href="/entrar" className="flex h-11 items-center rounded-2xl bg-white/80 px-4 font-semibold text-rosa-700 shadow-sm hover:bg-white">
              Entrar
            </Link>
          }
        />

        {/* Destaque: no celular a cena vem antes do texto; no computador, ao lado. */}
        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="order-2 flex flex-col gap-5 lg:order-1">
            <span className="flex items-center gap-2 self-start rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-bold text-rosa-700 shadow-sm">
              <Icone nome="coracao" className="size-4" />
              Para cada fase da maternidade
            </span>
            <h1 className="text-[38px] font-bold leading-[1.1] tracking-tight lg:text-[52px]">
              Seu momento, <span className="text-rosa-600">do seu jeito.</span>
            </h1>
            <p className="text-[17px] leading-relaxed text-suave lg:text-lg">
              Responda algumas perguntas rápidas e o Ninna se adapta a você, com orientação confiável, agenda do pré-natal e acolhimento em cada
              fase.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/triagem" className={CTA}>
                Começar a triagem
                <Icone nome="seta" />
              </Link>
              <Link
                href="/entrar"
                className="flex h-14 items-center justify-center rounded-2xl border-2 border-white bg-white/70 px-6 font-semibold text-tinta hover:bg-white"
              >
                Já tenho conta
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-3 pt-1">
              <Selo icone="presente">Grátis para começar</Selo>
              <Selo icone="relogio">Menos de 2 minutos</Selo>
              <Selo icone="cadeado">Dados protegidos</Selo>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <CenaNinna />
          </div>
        </section>

        <section aria-labelledby="titulo-momentos" className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h2 id="titulo-momentos" className="text-[28px] font-bold leading-tight tracking-tight">
              Feito para o seu momento
            </h2>
            <p className="text-[15px] text-suave">A triagem identifica a sua fase e o app muda junto com você.</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {MOMENTOS.map((m, i) => (
              <li key={m.titulo} className={i === MOMENTOS.length - 1 ? "col-span-2 sm:col-span-1" : ""}>
                <Link
                  href="/triagem"
                  className={`group flex h-full flex-col overflow-hidden rounded-3xl p-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-3 focus-visible:outline-rosa-600 ${FUNDOS[m.fundo]}`}
                >
                  {/* Espaço só da ilustração, para ela nunca cobrir o texto. */}
                  <span className="relative -mr-4 -mt-4 mb-2 block h-24">
                    <Ilustracao nome={m.ilustracao} className="absolute right-0 top-0 h-full transition group-hover:scale-105" />
                  </span>
                  <span className="relative font-bold leading-snug">{m.titulo}</span>
                  <span className="relative mt-1 text-[13px] leading-snug text-tinta/75">{m.texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-recursos" className="flex flex-col gap-5">
          <h2 id="titulo-recursos" className="text-[28px] font-bold leading-tight tracking-tight">
            Tudo do pré-natal, num lugar só
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {RECURSOS.map((r) => (
              <li key={r.titulo} className="flex gap-4 rounded-3xl bg-white/85 p-5 shadow-sm sm:flex-col sm:gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rosa-50 text-rosa-600">
                  <Icone nome={r.icone} className="size-6" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-bold">{r.titulo}</span>
                  <span className="text-[14px] leading-relaxed text-suave">{r.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] bg-rosa-600 px-6 py-8 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
          <div aria-hidden="true" className="absolute -bottom-20 right-24 size-40 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-2">
            <h2 className="text-[24px] font-bold leading-tight">Comece pela triagem</h2>
            <p className="text-[15px] leading-relaxed text-white/90">Sem precisar de conta. No fim, você decide se quer salvar.</p>
          </div>
          <Link
            href="/triagem"
            className="relative mt-5 flex h-13 items-center justify-center gap-2 rounded-2xl bg-white/90 shadow-suave px-6 font-semibold text-rosa-700 hover:bg-rosa-50 lg:mt-0 lg:shrink-0"
          >
            Começar agora
            <Icone nome="seta" />
          </Link>
        </section>

        <footer className="mt-auto flex flex-col items-center gap-3 text-center">
          <AvisoMedico />
          <nav aria-label="Documentos" className="flex justify-center gap-4 text-[13px] font-semibold text-suave">
            <Link href="/termos" className="hover:underline">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:underline">
              Política de Privacidade
            </Link>
          </nav>
        </footer>
      </main>
    </FundoSuave>
  );
}
