import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/ui";
import { artigosDoPerfil } from "@/content/artigos";
import { exigirUsuariaPronta } from "@/lib/dal";
import { PERFIS } from "@/lib/triagem";
import { CartaoConteudo } from "./cartao";
import { visualDoArtigo, type Fundo, type NomeIlustracao } from "./ilustracoes";

export const metadata: Metadata = { title: "Conteúdo" };

const GUIAS = {
  gestante: [
    { href: "/app/guias/semana", titulo: "O que fazer nesta fase" },
    { href: "/app/guias/parto", titulo: "Tipos de parto" },
  ],
  suspeita: [{ href: "/app/guias/sintomas", titulo: "Checar meus sintomas" }],
} as const;

const VISUAL_DOS_GUIAS: Record<string, { ilustracao: NomeIlustracao; fundo: Fundo }> = {
  "/app/guias/semana": { ilustracao: "prancheta", fundo: "azul" },
  "/app/guias/parto": { ilustracao: "bebe", fundo: "rosa" },
  "/app/guias/sintomas": { ilustracao: "lupa", fundo: "lilas" },
};

// 2 colunas no celular, 3 no tablet, 4 no computador.
const GRADE = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

async function Lista() {
  const { perfil } = await exigirUsuariaPronta();
  const guias = perfil.perfil === "gestante" || perfil.perfil === "suspeita" ? GUIAS[perfil.perfil] : [];

  return (
    <>
      <p className="-mt-3 text-[15px] text-suave">
        Selecionado para o perfil {PERFIS[perfil.perfil].titulo}. Em revisão por profissionais de saúde.
      </p>

      {guias.length > 0 && (
        <section aria-labelledby="titulo-guias" className="flex flex-col gap-3">
          <h2 id="titulo-guias" className="text-lg font-bold">
            Guias interativos
          </h2>
          <ul className={GRADE}>
            {guias.map((g) => (
              <li key={g.href}>
                <CartaoConteudo href={g.href} titulo={g.titulo} selo="Guia interativo" {...VISUAL_DOS_GUIAS[g.href]} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="titulo-artigos" className="flex flex-col gap-3">
        <h2 id="titulo-artigos" className="text-lg font-bold">
          Para ler
        </h2>
        <ul className={GRADE}>
          {artigosDoPerfil(perfil.perfil).map((a) => (
            <li key={a.slug}>
              <CartaoConteudo href={`/app/conteudo/${a.slug}`} titulo={a.titulo} premium={a.premium} {...visualDoArtigo(a.slug)} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function ConteudoPage() {
  return (
    <Pagina larga>
      <h1 className="text-[26px] font-bold">Conteúdo</h1>
      <Suspense fallback={<Carregando />}>
        <Lista />
      </Suspense>
    </Pagina>
  );
}
