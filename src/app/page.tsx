import Link from "next/link";
import { AvisoMedico, Logo, Pagina } from "@/components/ui";

const MOMENTOS = [
  "Tentando engravidar",
  "Com suspeita de gravidez",
  "Grávida, semana a semana",
  "No pós-parto",
  "Depois de uma perda",
];

export default function LandingPage() {
  return (
    <Pagina>
      <div className="flex items-center gap-3">
        <Logo tamanho={56} />
        <span className="text-xl font-bold text-rosa-600">Ninna</span>
      </div>
      <h1 className="text-[34px] font-bold leading-tight">Seu momento, do seu jeito.</h1>
      <p className="text-[17px] leading-relaxed text-suave">
        Responda algumas perguntas rápidas e o Ninna se adapta a você, com orientação confiável, agenda do pré-natal e
        acolhimento em cada fase.
      </p>
      <ul className="flex flex-wrap gap-2">
        {MOMENTOS.map((m) => (
          <li key={m} className="rounded-full bg-white px-3.5 py-2 text-sm font-medium">
            {m}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Link
          href="/triagem"
          className="flex h-13 items-center justify-center rounded-2xl bg-rosa-600 text-[17px] font-semibold text-white hover:bg-rosa-700"
        >
          Começar a triagem
        </Link>
        <Link href="/entrar" className="flex h-12 items-center justify-center font-semibold text-rosa-600">
          Já tenho conta
        </Link>
        <p className="text-center text-[13px] text-suave">Leva menos de 2 minutos.</p>
        <AvisoMedico />
      </div>
    </Pagina>
  );
}
