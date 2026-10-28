import type { Metadata } from "next";
import Link from "next/link";
import { Pagina, TituloPagina, Voltar } from "@/components/ui";
import { PASSOS_CONFIRMAR } from "@/content/guias";
import { ChecadorSintomas } from "./checador";

export const metadata: Metadata = { title: "Checar meus sintomas" };

// Conteúdo público dentro do app: não lê dados da usuária (o proxy já exige login).
export default function GuiaSintomasPage() {
  return (
    <Pagina>
      <Voltar href="/app" />
      <TituloPagina titulo="O que você está sentindo?" ilustracao="lupa" fundo="bg-lilas" />
      <p className="-mt-2 text-[15px] leading-relaxed text-suave">
        Toque nos sinais que você percebeu. Nenhum sintoma, sozinho, confirma ou descarta a gravidez.
      </p>
      <ChecadorSintomas />

      <section id="confirmar" className="flex scroll-mt-4 flex-col gap-3">
        <h2 className="text-lg font-bold">Como confirmar e quais consultas fazer</h2>
        <ol className="flex flex-col gap-4 rounded-3xl bg-white/90 shadow-suave p-5">
          {PASSOS_CONFIRMAR.map((p, i) => (
            <li key={p.titulo} className="flex gap-3">
              <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-azul-100 text-sm font-bold text-azul-900">
                {i + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-bold">{p.titulo}</span>
                <span className="text-sm leading-relaxed text-suave">{p.texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Link
        href={`/app/agenda/nova?titulo=${encodeURIComponent("Exame de sangue (Beta-hCG)")}&local=${encodeURIComponent("UBS")}`}
        className="flex h-12 items-center justify-center rounded-2xl border-2 border-linha bg-white font-semibold"
      >
        Agendar exame de sangue
      </Link>
      <Link
        href="/triagem"
        className="flex h-13 items-center justify-center rounded-2xl bg-rosa-600 text-[17px] font-semibold text-white hover:bg-rosa-700"
      >
        Fiz o teste e deu positivo
      </Link>
      <p className="text-center text-[12px] leading-relaxed text-suave">
        Sangramento forte ou dor intensa: procure atendimento imediatamente.
      </p>
    </Pagina>
  );
}
