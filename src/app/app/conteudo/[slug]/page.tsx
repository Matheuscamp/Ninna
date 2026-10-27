import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { artigoPorSlug } from "@/content/artigos";
import { exigirUsuariaPronta } from "@/lib/dal";
import { FUNDOS, Ilustracao, visualDoArtigo } from "../ilustracoes";

export const metadata: Metadata = { title: "Artigo" };

async function Artigo({ params }: { params: PageProps<"/app/conteudo/[slug]">["params"] }) {
  await exigirUsuariaPronta();
  const { slug } = await params;
  const artigo = artigoPorSlug(slug);
  if (!artigo) notFound();

  const visual = visualDoArtigo(artigo.slug);

  return (
    <article className="flex flex-col gap-4">
      {/* Mesma ilustração do card, para dar continuidade visual ao abrir o artigo. */}
      <div className={`relative h-40 overflow-hidden rounded-3xl ${FUNDOS[visual.fundo]}`}>
        <Ilustracao nome={visual.ilustracao} className="absolute -bottom-2 right-2 h-[115%]" />
      </div>
      <h1 className="text-[26px] font-bold leading-tight">{artigo.titulo}</h1>
      {artigo.premium ? (
        <div className="flex flex-col gap-2 rounded-3xl bg-rosa-50 p-5">
          <p className="font-bold text-rosa-700">Conteúdo Premium</p>
          <p className="text-[15px] leading-relaxed">
            Este artigo faz parte do Ninna Premium, que chega em breve. Sinais de alerta e orientações de segurança
            continuam sempre gratuitos.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[17px] leading-relaxed">{artigo.resumo}</p>
          <p className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-suave">
            Versão resumida. O texto completo está sendo escrito e revisado por profissional de saúde.
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
