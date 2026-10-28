import Link from "next/link";
import type { ReactNode } from "react";
import { CabecalhoPublico, CenaNinna, FundoSuave, Icone, type NomeIcone } from "@/components/acolhida";
import { AvisoMedico } from "@/components/ui";

const BENEFICIOS: { icone: NomeIcone; texto: string }[] = [
  { icone: "semana", texto: "Orientação para a sua fase, semana a semana" },
  { icone: "calendario", texto: "Agenda do pré-natal com consultas e exames" },
  { icone: "pasta", texto: "Seus documentos de saúde guardados com segurança" },
  { icone: "cadeado", texto: "Dados protegidos pela LGPD, nunca usados em anúncios" },
];

// Moldura de entrar e cadastro: no computador, a cena e os benefícios ao lado do
// formulário; no celular, uma faixa ilustrada acima do cartão do formulário.
export function TelaAuth({
  titulo,
  subtitulo,
  link,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  link: { href: string; rotulo: string };
  children: ReactNode;
}) {
  return (
    <FundoSuave>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 pb-8 pt-5">
        <CabecalhoPublico
          direita={
            <Link href={link.href} className="flex h-11 items-center rounded-2xl bg-white/80 px-4 text-[15px] font-semibold text-rosa-700 shadow-sm hover:bg-white">
              {link.rotulo}
            </Link>
          }
        />

        <div className="grid flex-1 items-start gap-10 lg:grid-cols-2 lg:items-center">
          <aside className="hidden flex-col gap-8 lg:flex">
            <CenaNinna />
            <ul className="flex flex-col gap-3.5">
              {BENEFICIOS.map((b) => (
                <li key={b.texto} className="flex items-center gap-3 text-[15px] font-semibold">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-rosa-600 shadow-sm">
                    <Icone nome={b.icone} />
                  </span>
                  {b.texto}
                </li>
              ))}
            </ul>
          </aside>

          <div className="mx-auto flex w-full max-w-md flex-col gap-5">
            <div className="lg:hidden">
              <CenaNinna compacta />
            </div>
            <section className="flex flex-col gap-5 rounded-[2rem] bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(31,42,68,0.45)] sm:p-8">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[28px] font-bold leading-tight tracking-tight">{titulo}</h1>
                {subtitulo && <p className="text-[15px] leading-relaxed text-suave">{subtitulo}</p>}
              </div>
              {children}
            </section>
          </div>
        </div>

        <AvisoMedico />
      </main>
    </FundoSuave>
  );
}
