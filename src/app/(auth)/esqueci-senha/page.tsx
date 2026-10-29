import type { Metadata } from "next";
import { Suspense } from "react";
import { FormEsqueciSenha } from "../formularios";
import { TelaAuth } from "../tela";

export const metadata: Metadata = { title: "Esqueci minha senha" };

const ERROS_RETORNO: Record<string, string> = {
  link: "Esse link expirou ou já foi usado. Peça um novo abaixo.",
};

async function Formulario({ searchParams }: { searchParams: PageProps<"/esqueci-senha">["searchParams"] }) {
  const { erro } = await searchParams;
  return <FormEsqueciSenha erroRetorno={typeof erro === "string" ? ERROS_RETORNO[erro] : undefined} />;
}

export default function EsqueciSenhaPage({ searchParams }: PageProps<"/esqueci-senha">) {
  return (
    <TelaAuth
      titulo="Esqueceu a senha?"
      subtitulo="Acontece! Informe o e-mail da sua conta e enviamos um link para você criar uma nova."
      link={{ href: "/entrar", rotulo: "Entrar" }}
    >
      <Suspense>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </TelaAuth>
  );
}
