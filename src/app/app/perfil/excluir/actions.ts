"use server";

import { redirect } from "next/navigation";
import { getUsuaria } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type EstadoExclusao = { erro?: string } | undefined;

export async function excluirConta(_estado: EstadoExclusao, formData: FormData): Promise<EstadoExclusao> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar");
  if (formData.get("confirmo") !== "on") return { erro: "Marque a confirmação para continuar." };

  const supabase = await createClient();
  // Função do banco que apaga a própria conta; o resto dos dados some em cascata.
  const { error } = await supabase.rpc("excluir_minha_conta");
  if (error) return { erro: "Não foi possível excluir agora. Tente de novo em instantes." };

  await supabase.auth.signOut();
  redirect("/conta-excluida");
}
