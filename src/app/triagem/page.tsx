import type { Metadata } from "next";
import { Pagina } from "@/components/ui";
import { AssistenteTriagem } from "./assistente";

export const metadata: Metadata = {
  title: "Triagem",
  description: "Responda algumas perguntas rápidas e o Ninna se adapta ao seu momento.",
};

export default function TriagemPage() {
  return (
    <Pagina>
      <AssistenteTriagem />
    </Pagina>
  );
}
