"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/app", rotulo: "Início", icone: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /> },
  {
    href: "/app/agenda",
    rotulo: "Agenda",
    icone: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  {
    href: "/app/documentos",
    rotulo: "Documentos",
    icone: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </>
    ),
  },
  { href: "/app/conteudo", rotulo: "Conteúdo", icone: <path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14" /> },
  {
    href: "/app/perfil",
    rotulo: "Perfil",
    icone: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  },
];

function abaAtiva(pathname: string, href: string) {
  // Guias e sinais de alerta são abertos a partir do Início.
  if (href === "/app") return pathname === "/app" || pathname.startsWith("/app/guias") || pathname === "/app/alertas";
  return pathname === href || pathname.startsWith(href + "/");
}

// Lê o endereço atual para destacar a aba. Fica dentro de um <Suspense> no layout:
// enquanto isso, BarraDeAbas aparece sem destaque (pathname vazio).
export function Abas() {
  return <BarraDeAbas pathname={usePathname()} />;
}

export function BarraDeAbas({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-10 border-t border-white/70 bg-white/85 shadow-[0_-10px_30px_-20px_rgba(31,42,68,0.35)] backdrop-blur-md print:hidden">
      <ul className="mx-auto grid h-[72px] max-w-lg grid-cols-5 px-1">
        {ABAS.map((aba) => {
          const ativa = abaAtiva(pathname, aba.href);
          return (
            <li key={aba.href}>
              <Link
                href={aba.href}
                aria-current={ativa ? "page" : undefined}
                className={`group flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${ativa ? "text-rosa-700" : "text-suave"}`}
              >
                <span className={`flex h-8 w-14 items-center justify-center rounded-full transition ${ativa ? "bg-rosa-100" : "group-hover:bg-azul-50"}`}>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-6 fill-none stroke-current"
                    strokeWidth={ativa ? 2.1 : 1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {aba.icone}
                  </svg>
                </span>
                {aba.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
