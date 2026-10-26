import type { Metadata } from "next";
import { Suspense } from "react";
import { AvisoMedico, Logo, Pagina } from "@/components/ui";
import { FormEntrar } from "../formularios";

export const metadata: Metadata = { title: "Entrar" };

const ERROS_RETORNO: Record<string, string> = {
  link: "Esse link de confirmação expirou ou já foi usado. Entre com seu e-mail e senha.",
  google: "Não foi possível entrar com o Google. Tente com e-mail e senha.",
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
    <Pagina>
      <Logo tamanho={56} />
      <h1 className="text-3xl font-bold">Que bom te ver de novo</h1>
      <Suspense>
        <Formulario searchParams={searchParams} />
      </Suspense>
      <AvisoMedico />
    </Pagina>
  );
}
