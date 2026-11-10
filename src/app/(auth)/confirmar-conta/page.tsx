import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormSair } from "@/components/dados-do-aparelho";
import { BotaoSecundario } from "@/components/ui";
import { getUsuaria } from "@/lib/dal";
import { TelaAuth } from "../tela";
import { CartaoConfirmarConta } from "./cartao";

export const metadata: Metadata = { title: "Confirme sua conta" };

// Parada obrigatória dos links de e-mail que funcionam em qualquer aparelho (ver
// /auth/callback): a pessoa confere de qual conta é o link antes de usar o app.
async function Conteudo({ searchParams }: { searchParams: PageProps<"/confirmar-conta">["searchParams"] }) {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar");
  const { para } = await searchParams;
  return (
    <CartaoConfirmarConta
      email={usuaria.email}
      continuar={para === "senha" ? "/nova-senha" : "/consentimento"}
      sair={
        <FormSair>
          <BotaoSecundario type="submit">Não é a minha conta, sair</BotaoSecundario>
        </FormSair>
      }
    />
  );
}

export default function ConfirmarContaPage({ searchParams }: PageProps<"/confirmar-conta">) {
  return (
    <TelaAuth titulo="Esta é a sua conta?" subtitulo="Este link abriu a conta do e-mail abaixo. Confira antes de continuar." link={{ href: "/entrar", rotulo: "Entrar" }}>
      <Suspense>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </TelaAuth>
  );
}
