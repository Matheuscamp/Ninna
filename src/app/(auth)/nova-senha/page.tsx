import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getUsuaria } from "@/lib/dal";
import { FormNovaSenha } from "../formularios";
import { TelaAuth } from "../tela";

export const metadata: Metadata = { title: "Nova senha" };

// Só abre com a sessão criada pelo link do e-mail (ver /auth/callback).
async function Conteudo() {
  if (await getUsuaria()) return <FormNovaSenha />;
  return (
    <div className="flex flex-col gap-4">
      <p role="alert" className="rounded-2xl bg-rosa-50 p-4 text-[15px] text-rosa-700">
        Esse link expirou ou já foi usado. Peça um novo para criar sua senha.
      </p>
      <Link href="/esqueci-senha" className="flex h-13 items-center justify-center rounded-2xl bg-rosa-600 text-[17px] font-semibold text-white shadow-rosa hover:bg-rosa-700">
        Pedir novo link
      </Link>
    </div>
  );
}

export default function NovaSenhaPage() {
  return (
    <TelaAuth
      titulo="Crie uma nova senha"
      subtitulo="Escolha uma senha que você não usa em outros sites."
      link={{ href: "/entrar", rotulo: "Entrar" }}
    >
      <Suspense>
        <Conteudo />
      </Suspense>
    </TelaAuth>
  );
}
