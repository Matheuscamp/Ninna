import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { UsoDoPlano } from "@/components/uso-do-plano";
import { contarDocumentos, exigirUsuariaPronta, getPlano } from "@/lib/dal";
import { limite, vagasRestantes } from "@/lib/planos";
import { EnvioDocumentos } from "./envio";

export const metadata: Metadata = { title: "Enviar documentos" };

async function Envio() {
  const { usuaria } = await exigirUsuariaPronta();
  const [plano, total] = await Promise.all([getPlano(usuaria.id), contarDocumentos(usuaria.id)]);
  const vagas = vagasRestantes(plano, "documentos", total);

  return (
    <>
      <UsoDoPlano usados={total} limite={limite(plano, "documentos")} rotulo="documentos" />
      {vagas === 0 ? (
        // Limite atingido: no lugar da área de envio, explica o que fazer.
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-8 text-center">
          <p className="text-lg font-bold">Você chegou ao limite do plano gratuito</p>
          <p className="text-[15px] leading-relaxed text-suave">
            O plano gratuito guarda até {limite(plano, "documentos")} documentos. Exclua algum que não precisa mais para liberar espaço,
            ou aguarde o Premium, que chega em breve e não tem limite.
          </p>
          <Link href="/app/documentos" className="flex h-12 items-center rounded-2xl bg-rosa-600 px-5 font-semibold text-white hover:bg-rosa-700">
            Ver meus documentos
          </Link>
        </div>
      ) : (
        <EnvioDocumentos vagas={vagas} />
      )}
    </>
  );
}

export default function EnviarDocumentosPage() {
  return (
    <Pagina>
      <Voltar href="/app/documentos" rotulo="Documentos" />
      <h1 className="text-[26px] font-bold">Enviar documentos</h1>
      <Suspense fallback={<Carregando />}>
        <Envio />
      </Suspense>
    </Pagina>
  );
}
