import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { ALERTAS_BEBE, alertasDoPerfil } from "@/content/guias";
import { exigirUsuariaPronta } from "@/lib/dal";

export const metadata: Metadata = { title: "Sinais de alerta" };

function Lista({ alertas }: { alertas: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-3 rounded-3xl bg-white p-5">
      {alertas.map((alerta) => (
        <li key={alerta} className="flex gap-3 text-base leading-snug">
          <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-alerta" />
          {alerta}
        </li>
      ))}
    </ul>
  );
}

// Sempre gratuito, em todos os perfis.
async function Alertas() {
  const { perfil } = await exigirUsuariaPronta();
  return (
    <>
      <Lista alertas={alertasDoPerfil(perfil.perfil)} />
      {perfil.perfil === "puerpera" && (
        <section aria-labelledby="titulo-bebe" className="flex flex-col gap-3">
          <h2 id="titulo-bebe" className="text-lg font-bold text-[#8a1c12]">
            E no bebê, se ele tiver:
          </h2>
          <Lista alertas={ALERTAS_BEBE} />
        </section>
      )}
    </>
  );
}

export default function AlertasPage() {
  return (
    <Pagina>
      <Voltar href="/app" />
      <h1 className="text-[26px] font-bold leading-tight text-[#8a1c12]">Procure atendimento imediatamente se tiver:</h1>
      <Suspense fallback={<Carregando />}>
        <Alertas />
      </Suspense>
      <a
        href="tel:192"
        className="flex h-13 items-center justify-center rounded-2xl bg-alerta text-[17px] font-semibold text-white"
      >
        Ligar para o SAMU (192)
      </a>
      <p className="text-center text-[15px] leading-relaxed text-suave">
        Precisa de apoio emocional? O CVV atende 24 horas, de graça:{" "}
        <a href="tel:188" className="font-semibold text-rosa-600 underline">
          188
        </a>
        .
      </p>
      <p className="text-center text-[13px] text-suave">Conteúdo em revisão por profissional de saúde.</p>
    </Pagina>
  );
}
