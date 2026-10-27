import Link from "next/link";
import { FUNDOS, Ilustracao, type Fundo, type NomeIlustracao } from "./ilustracoes";

// Card visual da seção Conteúdo: título no alto, ilustração no canto de baixo.
// Hover: o card sobe um pouco, ganha sombra e a ilustração cresce de leve.
export function CartaoConteudo({
  href,
  titulo,
  ilustracao,
  fundo,
  selo,
  premium,
}: {
  href: string;
  titulo: string;
  ilustracao: NomeIlustracao;
  fundo: Fundo;
  selo?: string;
  premium?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex aspect-[4/5] flex-col overflow-hidden rounded-3xl p-4 text-tinta transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(31,27,45,0.35)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rosa-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${FUNDOS[fundo]}`}
    >
      {(selo || premium) && (
        <span className="relative z-10 mb-2 flex items-center gap-1 self-start rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
          {premium && (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-none stroke-rosa-600" strokeWidth={2.4} strokeLinecap="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          )}
          {premium ? "Premium" : selo}
        </span>
      )}
      <h3 className="relative z-10 line-clamp-4 text-[15px] font-bold leading-snug sm:text-base">{titulo}</h3>
      <Ilustracao
        nome={ilustracao}
        className="pointer-events-none absolute -bottom-1 -right-1 w-[78%] transition duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </Link>
  );
}
