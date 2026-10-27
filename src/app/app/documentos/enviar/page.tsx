import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta } from "@/lib/dal";
import { EnvioDocumentos } from "./envio";

export const metadata: Metadata = { title: "Enviar documentos" };

async function Envio() {
  await exigirUsuariaPronta();
  return <EnvioDocumentos />;
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
