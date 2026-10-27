import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/ui";
import { artigosDoPerfil } from "@/content/artigos";
import { exigirUsuariaPronta } from "@/lib/dal";
import { PERFIS } from "@/lib/triagem";

export const metadata: Metadata = { title: "Conteúdo" };

const GUIAS = {
  gestante: [
    { href: "/app/guias/semana", titulo: "O que fazer nesta fase" },
    { href: "/app/guias/parto", titulo: "Tipos de parto" },
  ],
  suspeita: [{ href: "/app/guias/sintomas", titulo: "Checar meus sintomas" }],
} as const;

function Cadeado() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Premium" className="size-5 shrink-0 fill-none stroke-rosa-600" strokeWidth={1.8} strokeLinecap="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

async function Lista() {
  const { perfil } = await exigirUsuariaPronta();
  const guias = perfil.perfil === "gestante" || perfil.perfil === "suspeita" ? GUIAS[perfil.perfil] : [];

  return (
    <>
      <p className="-mt-3 text-[15px] text-suave">
        Selecionado para o perfil {PERFIS[perfil.perfil].titulo}. Em revisão por profissionais de saúde.
      </p>
      {guias.map((g) => (
        <Link key={g.href} href={g.href} className="flex items-center justify-between gap-3 rounded-2xl bg-azul-100 p-4 text-azul-900">
          <span className="flex flex-col gap-0.5">
            <span className="font-bold">{g.titulo}</span>
            <span className="text-[13px]">Guia interativo</span>
          </span>
          <span aria-hidden="true">›</span>
        </Link>
      ))}
      <ul className="flex flex-col gap-3">
        {artigosDoPerfil(perfil.perfil).map((a) => (
          <li key={a.slug}>
            <Link href={`/app/conteudo/${a.slug}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
              <span className="flex flex-col gap-1">
                <span className="font-semibold">{a.titulo}</span>
                <span className={`text-[13px] font-medium ${a.premium ? "text-rosa-600" : "text-suave"}`}>
                  {a.premium ? "Premium · em breve" : "Gratuito"}
                </span>
              </span>
              {a.premium ? <Cadeado /> : <span aria-hidden="true" className="text-suave">›</span>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function ConteudoPage() {
  return (
    <Pagina>
      <h1 className="text-[26px] font-bold">Conteúdo</h1>
      <Suspense fallback={<Carregando />}>
        <Lista />
      </Suspense>
    </Pagina>
  );
}
