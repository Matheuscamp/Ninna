import type { Metadata } from "next";
import { AvisoMedico, Logo, Pagina } from "@/components/ui";
import { FormCadastro } from "../formularios";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <Pagina>
      <Logo tamanho={56} />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Crie sua conta</h1>
        <p className="leading-relaxed text-suave">Para salvar sua triagem e acompanhar cada fase com você.</p>
      </div>
      <FormCadastro />
      <AvisoMedico />
    </Pagina>
  );
}
