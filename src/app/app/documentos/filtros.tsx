"use client";

import Form from "next/form";
import Link from "next/link";
import { CATEGORIAS, ORDENS, temFiltros, type Filtros } from "@/lib/documentos";
import { urlDaLista } from "./url";

// Busca, categoria, período e ordenação se combinam. Tudo vai na URL, então
// os filtros sobrevivem ao recarregar a página e funcionam sem JavaScript.
export function FiltrosDocumentos({ filtros }: { filtros: Filtros }) {
  const enviarAoMudar = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => e.currentTarget.form?.requestSubmit();
  const comPeriodo = Boolean(filtros.de || filtros.ate);

  return (
    <div className="flex flex-col gap-3">
      <Form action="/app/documentos" className="flex flex-col gap-3" role="search">
        {filtros.categoria && <input type="hidden" name="categoria" value={filtros.categoria} />}
        <div className="flex gap-2">
          <label htmlFor="busca" className="sr-only">
            Pesquisar pelo nome
          </label>
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 fill-none stroke-suave" strokeWidth={2} strokeLinecap="round">
              <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />
            </svg>
            <input
              id="busca"
              name="q"
              type="search"
              defaultValue={filtros.q}
              placeholder="Pesquisar pelo nome"
              maxLength={80}
              className="h-12 w-full rounded-xl border-2 border-linha bg-white pl-11 pr-3 text-base outline-none focus:border-rosa-600"
            />
          </div>
          <button type="submit" className="h-12 rounded-xl bg-rosa-600 px-4 font-semibold text-white hover:bg-rosa-700">
            Buscar
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="ordem" className="text-sm font-semibold text-suave">
            Ordenar por
          </label>
          <select
            id="ordem"
            name="ordem"
            defaultValue={filtros.ordem}
            onChange={enviarAoMudar}
            className="h-10 flex-1 rounded-xl border-2 border-linha bg-white px-2 text-sm font-semibold outline-none focus:border-rosa-600"
          >
            {ORDENS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </div>

        <details open={comPeriodo} className="group rounded-2xl bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
            Filtrar por data do documento
            <span aria-hidden="true" className="text-suave transition group-open:rotate-90">
              ›
            </span>
          </summary>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              De
              <input
                type="date"
                name="de"
                defaultValue={filtros.de}
                onChange={enviarAoMudar}
                className="h-11 rounded-xl border-2 border-linha px-2 text-base font-normal outline-none focus:border-rosa-600"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Até
              <input
                type="date"
                name="ate"
                defaultValue={filtros.ate}
                onChange={enviarAoMudar}
                className="h-11 rounded-xl border-2 border-linha px-2 text-base font-normal outline-none focus:border-rosa-600"
              />
            </label>
            <p className="col-span-2 text-[13px] text-suave">Documentos sem data cadastrada não aparecem quando há período.</p>
          </div>
        </details>
      </Form>

      <nav aria-label="Filtrar por categoria" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        <Link
          href={urlDaLista(filtros, { categoria: undefined })}
          aria-current={!filtros.categoria ? "page" : undefined}
          className={`shrink-0 rounded-full border-2 px-3.5 py-2 text-[13px] font-semibold ${!filtros.categoria ? "border-rosa-600 bg-rosa-600 text-white" : "border-linha bg-white"}`}
        >
          Todas
        </Link>
        {CATEGORIAS.map((c) => {
          const ativa = filtros.categoria === c.id;
          return (
            <Link
              key={c.id}
              href={urlDaLista(filtros, { categoria: c.id })}
              aria-current={ativa ? "page" : undefined}
              className={`shrink-0 rounded-full border-2 px-3.5 py-2 text-[13px] font-semibold ${ativa ? "border-rosa-600 bg-rosa-600 text-white" : "border-linha bg-white"}`}
            >
              {c.rotulo}
            </Link>
          );
        })}
      </nav>

      {(temFiltros(filtros) || filtros.ordem !== "recentes") && (
        <Link href="/app/documentos" className="self-start text-sm font-semibold text-rosa-600 underline">
          Limpar filtros
        </Link>
      )}
    </div>
  );
}
