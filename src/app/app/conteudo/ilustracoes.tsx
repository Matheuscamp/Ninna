import type { ReactNode } from "react";

// Ilustrações dos cards de conteúdo: formas simples, na paleta do Ninna, no estilo
// "figura no canto do card" da referência. São SVG próprios (sem licença de imagem,
// nítidos em qualquer tela e sem peso de download).

const ROSA = "#b83c70";
const ROSA_CLARO = "#e7a9c2";
const AZUL = "#2f6596";
const VERDE = "#4f9a6b";
const AMARELO = "#f2c46b";
const BRANCO = "#ffffff";

export const ILUSTRACOES = {
  prancheta: (
    <>
      <rect x="62" y="22" width="62" height="84" rx="10" fill={BRANCO} />
      <rect x="80" y="16" width="26" height="14" rx="5" fill={ROSA} />
      <path d="M74 50h38M74 64h38M74 78h24" stroke={ROSA_CLARO} strokeWidth="5" strokeLinecap="round" />
      <circle cx="120" cy="96" r="18" fill={ROSA} />
      <path d="M111 96l6 6 11-12" stroke={BRANCO} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  coracao: (
    <>
      <path d="M95 112s-40-24-40-52a22 22 0 0 1 40-12 22 22 0 0 1 40 12c0 28-40 52-40 52z" fill={ROSA} />
      <path d="M72 58a10 10 0 0 1 12-8" stroke={BRANCO} strokeWidth="5" strokeLinecap="round" fill="none" opacity=".7" />
      <path d="M140 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={BRANCO} />
      <path d="M52 34l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={BRANCO} opacity=".8" />
    </>
  ),
  maca: (
    <>
      <path d="M96 44c-8-6-34-8-38 20s14 50 28 48c6-1 8-4 10-4s4 3 10 4c14 2 32-20 28-48s-30-26-38-20z" fill={ROSA} />
      <path d="M96 44c0-10 4-18 12-22" stroke="#6b4a2b" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M100 36c10-14 26-12 30-8-6 10-20 14-30 8z" fill={VERDE} />
      <path d="M72 70a14 14 0 0 1 8-12" stroke={BRANCO} strokeWidth="5" strokeLinecap="round" fill="none" opacity=".6" />
    </>
  ),
  teste: (
    <>
      <g transform="rotate(-28 100 70)">
        <rect x="88" y="10" width="26" height="108" rx="13" fill={BRANCO} />
        <rect x="93" y="48" width="16" height="30" rx="5" fill="#f4f0f6" />
        <path d="M97 56v14M105 56v14" stroke={ROSA} strokeWidth="4" strokeLinecap="round" />
        <rect x="88" y="92" width="26" height="26" rx="13" fill={ROSA_CLARO} />
      </g>
      <circle cx="58" cy="92" r="14" fill={BRANCO} opacity=".6" />
    </>
  ),
  casa: (
    <>
      <path d="M50 68l46-36 46 36v44H50z" fill={BRANCO} />
      <path d="M44 70l52-42 52 42" stroke={AZUL} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="82" y="78" width="28" height="34" rx="4" fill={AZUL} opacity=".25" />
      <path d="M96 48v20M86 58h20" stroke={ROSA} strokeWidth="7" strokeLinecap="round" />
    </>
  ),
  folha: (
    <>
      <path d="M60 110c0-44 26-74 74-82-2 48-30 80-74 82z" fill={VERDE} />
      <path d="M62 108c18-26 40-46 64-66" stroke={BRANCO} strokeWidth="4" strokeLinecap="round" fill="none" opacity=".7" />
      <g transform="rotate(30 128 92)">
        <rect x="108" y="82" width="44" height="20" rx="10" fill={BRANCO} />
        <rect x="130" y="82" width="22" height="20" rx="10" fill={ROSA} />
      </g>
    </>
  ),
  calendario: (
    <>
      <rect x="54" y="30" width="84" height="80" rx="12" fill={BRANCO} />
      <rect x="54" y="30" width="84" height="22" rx="10" fill={ROSA} />
      <path d="M74 22v16M118 22v16" stroke={AZUL} strokeWidth="6" strokeLinecap="round" />
      <path d="M96 64c-8 12-12 18-12 24a12 12 0 0 0 24 0c0-6-4-12-12-24z" fill={ROSA} />
    </>
  ),
  lua: (
    <>
      {/* Lua crescente: círculo (100,62) r40 menos o círculo (118,50) r34, entre os dois pontos onde se cruzam. */}
      <path d="M98.7 22A40 40 0 1 0 136.4 78.6A34 34 0 0 1 98.7 22Z" fill={AMARELO} />
      <path d="M140 34l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={BRANCO} />
      <path d="M128 72l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill={BRANCO} opacity=".8" />
      <circle cx="146" cy="96" r="4" fill={BRANCO} opacity=".8" />
    </>
  ),
  gota: (
    <>
      <rect x="76" y="48" width="44" height="66" rx="14" fill={BRANCO} />
      <rect x="84" y="30" width="28" height="20" rx="6" fill={AZUL} />
      <path d="M90 22h16" stroke={AZUL} strokeWidth="6" strokeLinecap="round" />
      <path d="M84 84h28M84 98h28" stroke={ROSA_CLARO} strokeWidth="4" strokeLinecap="round" />
      <path d="M136 64c-6 9-9 13-9 17a9 9 0 0 0 18 0c0-4-3-8-9-17z" fill={BRANCO} opacity=".9" />
    </>
  ),
  flor: (
    <>
      <path d="M96 112V70" stroke={VERDE} strokeWidth="6" strokeLinecap="round" />
      <path d="M96 96c10-14 26-14 30-10-6 12-20 14-30 10z" fill={VERDE} />
      {[0, 72, 144, 216, 288].map((angulo) => (
        <ellipse key={angulo} cx="96" cy="38" rx="14" ry="22" fill={ROSA_CLARO} transform={`rotate(${angulo} 96 58)`} />
      ))}
      <circle cx="96" cy="58" r="13" fill={AMARELO} />
    </>
  ),
  conversa: (
    <>
      <path d="M50 40h62a12 12 0 0 1 12 12v26a12 12 0 0 1-12 12H76l-16 14v-14h-10a12 12 0 0 1-12-12V52a12 12 0 0 1 12-12z" fill={BRANCO} />
      <path d="M86 70s-14-8-14-17a7 7 0 0 1 14-3 7 7 0 0 1 14 3c0 9-14 17-14 17z" fill={ROSA} />
      <path d="M128 66h14a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10h-4v10l-12-10h-4" fill={ROSA_CLARO} />
    </>
  ),
  lupa: (
    <>
      <circle cx="88" cy="60" r="32" fill={BRANCO} />
      <circle cx="88" cy="60" r="32" stroke={AZUL} strokeWidth="8" fill="none" />
      <path d="M112 84l24 24" stroke={AZUL} strokeWidth="12" strokeLinecap="round" />
      <path d="M76 60l8 8 16-16" stroke={ROSA} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  bebe: (
    <>
      <circle cx="96" cy="74" r="38" fill={BRANCO} />
      <circle cx="84" cy="70" r="4" fill="#1f1b2d" />
      <circle cx="108" cy="70" r="4" fill="#1f1b2d" />
      <path d="M86 86c6 6 14 6 20 0" stroke="#1f1b2d" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="76" cy="82" r="5" fill={ROSA_CLARO} />
      <circle cx="116" cy="82" r="5" fill={ROSA_CLARO} />
      <path d="M96 36c-2-10 8-14 12-8" stroke={ROSA} strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type NomeIlustracao = keyof typeof ILUSTRACOES;

// Fundos dos cards (tons claros da paleta). O texto escuro mantém contraste em todos.
export const FUNDOS = {
  rosa: "bg-rosa-100",
  azul: "bg-azul-100",
  lilas: "bg-[#e6dcf7]",
  pessego: "bg-[#fde2cc]",
  menta: "bg-[#d6efe2]",
  baunilha: "bg-[#fbeec4]",
} as const;

export type Fundo = keyof typeof FUNDOS;

// Qual ilustração e cor cada artigo usa. Fica só na camada visual: os dados dos artigos não mudam.
export const VISUAL_DOS_ARTIGOS: Record<string, { ilustracao: NomeIlustracao; fundo: Fundo }> = {
  "primeira-consulta-pre-natal": { ilustracao: "prancheta", fundo: "rosa" },
  "exames-pre-natal": { ilustracao: "prancheta", fundo: "azul" },
  "direitos-gestante-trabalho": { ilustracao: "coracao", fundo: "lilas" },
  "alimentacao-gestacao": { ilustracao: "maca", fundo: "menta" },
  "quando-fazer-teste": { ilustracao: "teste", fundo: "rosa" },
  "teste-gratuito-ubs": { ilustracao: "casa", fundo: "azul" },
  "sinais-iniciais": { ilustracao: "teste", fundo: "lilas" },
  "deu-positivo": { ilustracao: "coracao", fundo: "pessego" },
  "acido-folico": { ilustracao: "folha", fundo: "menta" },
  "consulta-pre-concepcional": { ilustracao: "prancheta", fundo: "rosa" },
  "periodo-fertil": { ilustracao: "calendario", fundo: "azul" },
  "habitos-engravidar": { ilustracao: "folha", fundo: "baunilha" },
  "recuperacao-pos-parto": { ilustracao: "lua", fundo: "lilas" },
  "amamentacao-primeiros-dias": { ilustracao: "gota", fundo: "azul" },
  "tristeza-depressao-pos-parto": { ilustracao: "conversa", fundo: "rosa" },
  "sono-bebe-mae": { ilustracao: "lua", fundo: "azul" },
  "luto-gestacional": { ilustracao: "flor", fundo: "lilas" },
  "corpo-depois-da-perda": { ilustracao: "coracao", fundo: "pessego" },
  "grupos-de-apoio": { ilustracao: "conversa", fundo: "menta" },
  "tentar-de-novo": { ilustracao: "flor", fundo: "baunilha" },
};

export function visualDoArtigo(slug: string) {
  return VISUAL_DOS_ARTIGOS[slug] ?? { ilustracao: "coracao" as const, fundo: "rosa" as const };
}

export function Ilustracao({ nome, className = "" }: { nome: NomeIlustracao; className?: string }) {
  return (
    <svg viewBox="40 10 120 110" aria-hidden="true" className={className} preserveAspectRatio="xMaxYMax meet">
      {ILUSTRACOES[nome]}
    </svg>
  );
}
