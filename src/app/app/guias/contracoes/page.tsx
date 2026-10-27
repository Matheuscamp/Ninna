import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { SEMANA_A_TERMO, TEXTOS_CONTRACOES } from "@/content/contracoes";
import { exigirUsuariaPronta, getPlano } from "@/lib/dal";
import { ContadorContracoes } from "./contador";

export const metadata: Metadata = { title: "Contador de contrações" };

async function Contador() {
  const { usuaria, perfil, semanas } = await exigirUsuariaPronta();
  const plano = await getPlano(usuaria.id);
  const prematuro = perfil.perfil === "gestante" && semanas !== null && semanas < SEMANA_A_TERMO;

  return (
    <>
      {prematuro && (
        <p role="alert" className="rounded-2xl bg-[#fdecea] px-4 py-3 text-[15px] font-semibold leading-relaxed text-[#8a1c12]">
          {TEXTOS_CONTRACOES.prematuro}
        </p>
      )}
      {plano === "premium" ? (
        <ContadorContracoes />
      ) : (
        <div className="flex flex-col gap-3 rounded-3xl bg-rosa-50 p-5">
          <p className="font-bold text-rosa-700">Recurso Premium</p>
          <p className="text-[15px] leading-relaxed">
            O contador mede a duração e o intervalo das contrações, mostra a média da última hora e avisa quando o ritmo indica que é hora de ligar
            para a maternidade. Funciona mesmo sem internet.
          </p>
          <Link href="/app/premium" className="flex h-12 items-center justify-center rounded-2xl bg-rosa-600 px-5 font-semibold text-white hover:bg-rosa-700">
            Conhecer o Premium
          </Link>
        </div>
      )}
    </>
  );
}

export default function ContracoesPage() {
  return (
    <Pagina>
      <Voltar href="/app" />
      <h1 className="text-[26px] font-bold leading-tight">Contador de contrações</h1>
      <p className="-mt-2 text-[15px] leading-relaxed text-suave">{TEXTOS_CONTRACOES.como}</p>
      <Suspense fallback={<Carregando />}>
        <Contador />
      </Suspense>

      {/* Sempre visível, também no plano gratuito: sinais de que não dá para esperar o ritmo. */}
      <section aria-labelledby="titulo-ir-agora" className="flex flex-col gap-3 rounded-3xl bg-white p-5">
        <h2 id="titulo-ir-agora" className="text-lg font-bold text-[#8a1c12]">
          Vá à maternidade agora, sem esperar, se:
        </h2>
        <ul className="flex flex-col gap-2.5">
          {TEXTOS_CONTRACOES.irAgora.map((sinal) => (
            <li key={sinal} className="flex gap-3 leading-snug">
              <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-alerta" />
              {sinal}
            </li>
          ))}
        </ul>
        <a href="tel:192" className="flex h-12 items-center justify-center rounded-2xl bg-alerta font-semibold text-white">
          Ligar para o SAMU (192)
        </a>
      </section>
    </Pagina>
  );
}
