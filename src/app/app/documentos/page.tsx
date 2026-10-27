import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina } from "@/components/ui";
import { UsoDoPlano } from "@/components/uso-do-plano";
import { contarDocumentos, exigirUsuariaPronta, getPlano, linksDeMiniatura, listarDocumentos, type Documento } from "@/lib/dal";
import { limite } from "@/lib/planos";
import { formatarDataLonga } from "@/lib/datas";
import { categoria, formatarTamanho, lerFiltros, temFiltros } from "@/lib/documentos";
import { ExcluirDocumento } from "./excluir";
import { FiltrosDocumentos } from "./filtros";
import { IconeEnvio, IconePasta, IconePdf } from "./icones";

export const metadata: Metadata = { title: "Documentos" };

function mensagem(ok: string | undefined, n: string | undefined) {
  const total = Number(n) || 1;
  switch (ok) {
    case "enviados":
      return { texto: total === 1 ? "Documento enviado." : `${total} documentos enviados.` };
    case "editado":
      return { texto: "Alterações salvas." };
    case "excluido":
      return { texto: "Documento excluído." };
    case "erro":
      return { texto: "Não foi possível concluir. Tente de novo.", erro: true };
    case "erro_arquivo":
      return { texto: "Não foi possível abrir o arquivo agora. Tente de novo.", erro: true };
    default:
      return null;
  }
}

function CartaoDocumento({ doc, miniatura, filtros }: { doc: Documento; miniatura?: string; filtros: string }) {
  const cat = categoria(doc.categoria);
  const abrir = `/app/documentos/${doc.id}/arquivo`;
  const ehImagem = doc.tipo_mime.startsWith("image/");

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-white">
      <a href={abrir} target="_blank" rel="noopener" aria-label={`Abrir ${doc.nome}`} className="block">
        <div className="flex aspect-[16/9] items-center justify-center bg-azul-50 text-rosa-600">
          {ehImagem && miniatura ? (
            // eslint-disable-next-line @next/next/no-img-element -- link assinado temporário do Storage privado
            <img src={miniatura} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <IconePdf className="size-14" />
          )}
        </div>
      </a>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className={`self-start rounded-full px-2.5 py-1 text-[12px] font-bold ${cat.cor}`}>{cat.rotulo}</span>
        <h3 className="line-clamp-2 text-base font-bold leading-snug">{doc.nome}</h3>
        <dl className="flex flex-col gap-0.5 text-[13px] text-suave">
          {doc.data_documento && (
            <div className="flex gap-1">
              <dt>Data:</dt>
              <dd className="font-semibold text-tinta">{formatarDataLonga(doc.data_documento)}</dd>
            </div>
          )}
          {doc.profissional && (
            <div className="flex gap-1">
              <dt className="sr-only">Profissional ou estabelecimento:</dt>
              <dd className="truncate">{doc.profissional}</dd>
            </div>
          )}
          <div className="flex gap-1">
            <dt className="sr-only">Arquivo:</dt>
            <dd>
              {ehImagem ? "Imagem" : "PDF"} · {formatarTamanho(doc.tamanho)} · enviado em {formatarDataLonga(doc.created_at.slice(0, 10))}
            </dd>
          </div>
        </dl>
        {doc.descricao && <p className="line-clamp-2 text-sm text-suave">{doc.descricao}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1 border-t border-azul-50 px-3 py-2">
        <a href={abrir} target="_blank" rel="noopener" className="flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-azul-700 hover:bg-azul-50">
          Abrir
        </a>
        <a href={`${abrir}?baixar=1`} className="flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-azul-700 hover:bg-azul-50">
          Baixar
        </a>
        <Link href={`/app/documentos/${doc.id}/editar`} className="flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-azul-700 hover:bg-azul-50">
          Editar
        </Link>
        <ExcluirDocumento id={doc.id} nome={doc.nome} filtros={filtros} />
      </div>
    </li>
  );
}

async function Central({ searchParams }: { searchParams: PageProps<"/app/documentos">["searchParams"] }) {
  const { usuaria } = await exigirUsuariaPronta();
  const params = await searchParams;
  const filtros = lerFiltros(params);
  const [documentos, total, plano] = await Promise.all([
    listarDocumentos(usuaria.id, filtros),
    contarDocumentos(usuaria.id),
    getPlano(usuaria.id),
  ]);
  const miniaturas = await linksDeMiniatura(documentos.filter((d) => d.tipo_mime.startsWith("image/")).map((d) => d.caminho));
  const aviso = mensagem(typeof params.ok === "string" ? params.ok : undefined, typeof params.n === "string" ? params.n : undefined);
  const consultaAtual = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) => (typeof v === "string" && k !== "ok" && k !== "n" ? [[k, v]] : [])),
  ).toString();

  return (
    <>
      <UsoDoPlano usados={total} limite={limite(plano, "documentos")} rotulo="documentos" />

      {aviso && (
        <p role="status" className={`rounded-2xl px-4 py-3 text-[15px] font-semibold ${aviso.erro ? "bg-rosa-50 text-rosa-700" : "bg-azul-100 text-azul-900"}`}>
          {aviso.texto}
        </p>
      )}

      {total === 0 ? (
        // Estado vazio: ainda não há nenhum documento.
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-rosa-50 text-rosa-600">
            <IconePasta />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold">Seus documentos num lugar só</h2>
            <p className="text-[15px] leading-relaxed text-suave">
              Guarde exames, carteira de vacinação e receitas para mostrar nas consultas sem procurar no celular.
            </p>
          </div>
          <Link href="/app/documentos/enviar" className="flex h-12 items-center gap-2 rounded-2xl bg-rosa-600 px-5 font-semibold text-white hover:bg-rosa-700">
            <IconeEnvio className="size-5" />
            Enviar o primeiro documento
          </Link>
        </div>
      ) : (
        <>
          <FiltrosDocumentos filtros={filtros} />
          <p className="text-sm text-suave" aria-live="polite">
            {temFiltros(filtros) ? `${documentos.length} de ${total} documentos` : total === 1 ? "1 documento" : `${total} documentos`}
          </p>
          {documentos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-8 text-center">
              <p className="font-semibold">Nenhum documento com esses filtros</p>
              <Link href="/app/documentos" className="font-semibold text-rosa-600 underline">
                Limpar filtros
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {documentos.map((d) => (
                <CartaoDocumento key={d.id} doc={d} miniatura={miniaturas[d.caminho]} filtros={consultaAtual} />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

export default function DocumentosPage({ searchParams }: PageProps<"/app/documentos">) {
  return (
    <Pagina>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-[26px] font-bold">Documentos</h1>
          <p className="text-sm text-suave">Exames, vacinas e receitas. Só você tem acesso.</p>
        </div>
        <Link
          href="/app/documentos/enviar"
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-rosa-600 px-4 text-[15px] font-semibold text-white hover:bg-rosa-700"
        >
          <IconeEnvio className="size-5" />
          Enviar
        </Link>
      </div>
      <Suspense fallback={<Carregando />}>
        <Central searchParams={searchParams} />
      </Suspense>
    </Pagina>
  );
}
