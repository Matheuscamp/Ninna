import type { Metadata } from "next";
import { FundoSuave } from "@/components/acolhida";
import { AssistenteTriagem } from "./assistente";

export const metadata: Metadata = {
  title: "Triagem",
  description: "Responda algumas perguntas rápidas e o Ninna se adapta ao seu momento.",
};

export default function TriagemPage() {
  return (
    <FundoSuave>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-8 pt-5">
        <AssistenteTriagem />
      </main>
    </FundoSuave>
  );
}
