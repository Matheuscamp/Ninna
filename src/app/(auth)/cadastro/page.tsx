import type { Metadata } from "next";
import { FormCadastro } from "../formularios";
import { TelaAuth } from "../tela";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <TelaAuth
      titulo="Crie sua conta"
      subtitulo="Para salvar sua triagem e acompanhar cada fase com você. É grátis."
      link={{ href: "/entrar?next=/triagem/concluir", rotulo: "Entrar" }}
    >
      <FormCadastro />
    </TelaAuth>
  );
}
