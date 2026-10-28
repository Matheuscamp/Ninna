import type { Metadata } from "next";
import { Suspense } from "react";
import { FormEntrar } from "../formularios";
import { TelaAuth } from "../tela";

export const metadata: Metadata = { title: "Entrar" };

const ERROS_RETORNO: Record<string, string> = {
  link: "Esse link de confirmação expirou ou já foi usado. Entre com seu e-mail e senha.",
};

// Os parâmetros da URL são lidos no servidor, para o HTML inicial já sair
// igual ao que o navegador vai montar.
async function Formulario({ searchParams }: { searchParams: PageProps<"/entrar">["searchParams"] }) {
  const { next, erro } = await searchParams;
  return (
    <FormEntrar
      next={typeof next === "string" ? next : "/app"}
      erroRetorno={typeof erro === "string" ? ERROS_RETORNO[erro] : undefined}
    />
  );
}

export default function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  return (
    <TelaAuth
      titulo="Que bom te ver de novo"
      subtitulo="Entre para ver sua agenda, seus documentos e o que fazer nesta fase."
      link={{ href: "/cadastro", rotulo: "Criar conta" }}
    >
      <Suspense>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </TelaAuth>
  );
}
