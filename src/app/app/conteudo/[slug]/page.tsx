import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { artigoPorSlug } from "@/content/artigos";
import { exigirUsuariaPronta, getPlano } from "@/lib/dal";
import { FUNDOS, Ilustracao, visualDoArtigo } from "../ilustracoes";

export const metadata: Metadata = { title: "Artigo" };

async function Artigo({ params }: { params: PageProps<"/app/conteudo/[slug]">["params"] }) {
  const { usuaria } = await exigirUsuariaPronta();
  const [{ slug }, plano] = await Promise.all([params, getPlano(usuaria.id)]);
  const artigo = artigoPorSlug(slug);
  if (!artigo) notFound();
  const bloqueado = artigo.premium && plano !== "premium";

  const visual = visualDoArtigo(artigo.slug);

  return (
    <article className="flex flex-col gap-4">
      {/* Mesma ilustração do card, para dar continuidade visual ao abrir o artigo. */}
      <div className={`relative h-40 overflow-hidden rounded-3xl ${FUNDOS[visual.fundo]}`}>
        <Ilustracao nome={visual.ilustracao} className="absolute -bottom-2 right-2 h-[115%]" />
      </div>
      <h1 className="text-[26px] font-bold leading-tight">{artigo.titulo}</h1>
      {bloqueado ? (
        <div className="flex flex-col gap-3 rounded-3xl bg-rosa-50 p-5">
          <p className="font-bold text-rosa-700">Conteúdo Premium</p>
          <p className="text-[15px] leading-relaxed">
            Este artigo faz parte do Ninna Premium. Sinais de alerta e orientações de segurança continuam sempre gratuitos.
          </p>
          <Link href="/app/premium" className="flex h-12 items-center justify-center rounded-2xl bg-rosa-600 px-5 font-semibold text-white hover:bg-rosa-700">
            Conhecer o Premium
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[17px] leading-relaxed">{artigo.resumo}</p>
          {artigo.pontos && (
            <ul className="flex flex-col gap-3 rounded-3xl bg-white p-5">
              {artigo.pontos.map((ponto) => (
                <li key={ponto} className="flex gap-3 text-[15px] leading-relaxed">
                  <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-rosa-600" />
                  {ponto}
                </li>
              ))}
            </ul>
          )}
          <p className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-suave">
            {artigo.fonte ? `Baseado na ${artigo.fonte}. ` : "Versão resumida. "}
            Conteúdo em revisão por profissional de saúde.
          </p>
        </>
      )}
    </article>
  );
}

export default function ArtigoPage({ params }: PageProps<"/app/conteudo/[slug]">) {
  return (
    <Pagina>
      <Voltar href="/app/conteudo" rotulo="Conteúdo" />
      <Suspense fallback={<Carregando />}>
        <Artigo params={params} />
      </Suspense>
    </Pagina>
  );
}
