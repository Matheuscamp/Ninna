"use client";

import { useEffect, type ReactNode } from "react";
import { sair } from "@/app/(auth)/actions";
import { limparDadosDoAparelho, varrerDadosVencidos } from "@/lib/dados-do-aparelho";

export function VarreduraDoAparelho() {
  useEffect(() => varrerDadosVencidos(), []);
  return null;
}

export function LimparDadosAoAbrir() {
  useEffect(() => limparDadosDoAparelho(), []);
  return null;
}

// Encerrar a sessão também apaga o que ficou guardado neste navegador.
export function FormSair({ children }: { children: ReactNode }) {
  return (
    <form action={sair} onSubmit={() => limparDadosDoAparelho()}>
      {children}
    </form>
  );
}
