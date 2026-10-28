import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Ilustracao, type NomeIlustracao } from "./ilustracoes";

// Peças visuais das telas públicas (início, triagem, entrar e cadastro):
// fundo com formas suaves, a cena da cegonha, bolhas com ilustrações e ícones de traço.

// Fundo em degradê com formas desfocadas. As formas são só decoração.
export function FundoSuave({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col overflow-hidden bg-linear-to-b from-rosa-50 via-azul-50 to-azul-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 size-72 rounded-full bg-rosa-100/70 blur-3xl" />
        <div className="absolute -right-20 top-40 size-80 rounded-full bg-azul-100/80 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-[#e6dcf7]/60 blur-3xl" />
      </div>
      {children}
    </div>
  );
}

// Ilustração dentro de um círculo branco (para opções e cards).
export function Bolha({ nome, className = "size-14", fundo = "bg-white" }: { nome: NomeIlustracao; className?: string; fundo?: string }) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm ${fundo} ${className}`}>
      <Ilustracao nome={nome} className="h-[78%] w-[78%]" />
    </span>
  );
}

// Cena de destaque: a cegonha do Ninna num cartão em degradê, com bolhas
// das fases ao redor. `compacta` para o topo das telas no celular.
export function CenaNinna({ compacta = false }: { compacta?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto w-full overflow-hidden rounded-[2.5rem] bg-linear-to-br from-rosa-100 via-[#f6e6f0] to-azul-100 shadow-[0_20px_60px_-30px_rgba(184,60,112,0.55)] ${
        compacta ? "h-44 max-w-md" : "aspect-[5/4] max-w-lg"
      }`}
    >
      <div className={`absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 ${compacta ? "w-40" : "w-[62%]"}`} />
      <div className={`absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 ${compacta ? "w-32" : "w-[44%]"}`} />
      <Image
        src="/ninna-icon.png"
        alt=""
        width={512}
        height={512}
        sizes={compacta ? "96px" : "(min-width: 1024px) 180px, 34vw"}
        priority
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[22%] shadow-lg ${compacta ? "size-24" : "w-[34%] aspect-square"}`}
      />
      <Bolha nome="coracao" className={`absolute ${compacta ? "left-[12%] top-6 size-12" : "left-[8%] top-[12%] w-[18%] aspect-square"}`} />
      <Bolha nome="calendario" className={`absolute ${compacta ? "right-[12%] top-8 size-12" : "right-[9%] top-[16%] w-[17%] aspect-square"}`} />
      <Bolha nome="flor" className={`absolute ${compacta ? "bottom-5 left-[20%] size-11" : "bottom-[12%] left-[12%] w-[16%] aspect-square"}`} />
      <Bolha nome="bebe" className={`absolute ${compacta ? "bottom-6 right-[18%] size-11" : "bottom-[10%] right-[10%] w-[19%] aspect-square"}`} />
      {!compacta && <Bolha nome="folha" className="absolute left-[40%] top-[5%] w-[11%] aspect-square" />}
      <Brilho className="left-[30%] top-[22%] size-5" />
      <Brilho className="right-[30%] bottom-[24%] size-4" />
      <Brilho className="left-[22%] bottom-[38%] size-3" />
    </div>
  );
}

function Brilho({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`absolute fill-white ${className}`}>
      <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
    </svg>
  );
}

// Ícones de traço, no mesmo estilo do restante do app.
const ICONES = {
  relogio: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2" />,
  cadeado: <path d="M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2" />,
  coracao: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  calendario: <path d="M3 10h18M8 3v4M16 3v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />,
  pasta: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 13h6" />,
  alerta: <path d="M12 3 2 20h20zM12 10v4M12 17v.5" />,
  semana: <path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14M9 8h6M9 12h4" />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12l5 5 9-10" />,
  presente: <path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z" />,
};

export type NomeIcone = keyof typeof ICONES;

export function Icone({ nome, className = "size-5" }: { nome: NomeIcone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} shrink-0 fill-none stroke-current`} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      {ICONES[nome]}
    </svg>
  );
}

// Topo das telas públicas: logo que leva ao início e um link à direita.
export function CabecalhoPublico({ direita }: { direita?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-2.5 rounded-2xl focus-visible:outline-3 focus-visible:outline-rosa-600">
        <Image src="/ninna-icon.png" alt="" width={44} height={44} className="rounded-[22%]" priority />
        <span className="text-xl font-bold text-rosa-600">Ninna</span>
      </Link>
      {direita}
    </header>
  );
}

// Pílula pequena com ícone, para "Grátis", "2 minutos" etc.
export function Selo({ icone, children }: { icone: NomeIcone; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-[14px] font-semibold text-azul-900">
      <span className="flex size-8 items-center justify-center rounded-full bg-white text-rosa-600 shadow-sm">
        <Icone nome={icone} className="size-4" />
      </span>
      {children}
    </span>
  );
}
