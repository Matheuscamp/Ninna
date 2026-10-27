"use server";

import { redirect } from "next/navigation";
import { BUCKET_AVATARES, BUCKET_DOCUMENTOS, getUsuaria } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type EstadoExclusao = { erro?: string } | undefined;

export async function excluirConta(_estado: EstadoExclusao, formData: FormData): Promise<EstadoExclusao> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar");
  if (formData.get("confirmo") !== "on") return { erro: "Marque a confirmação para continuar." };

  const supabase = await createClient();

  // Os arquivos do Storage não somem em cascata com a conta: apaga antes.
  // Se não der para apagar, a conta não é excluída (para não sobrar arquivo de saúde solto).
  for (const bucket of [BUCKET_DOCUMENTOS, BUCKET_AVATARES]) {
    const armazenamento = supabase.storage.from(bucket);
    for (;;) {
      const { data: arquivos, error: erroLista } = await armazenamento.list(usuaria.id, { limit: 100 });
      if (erroLista || !arquivos || arquivos.length === 0) break;
      const { error: erroRemover } = await armazenamento.remove(arquivos.map((a) => `${usuaria.id}/${a.name}`));
      if (erroRemover) return { erro: "Não foi possível apagar seus arquivos agora. Tente de novo em instantes." };
    }
  }

  // Função do banco que apaga a própria conta; o resto dos dados some em cascata.
  const { error } = await supabase.rpc("excluir_minha_conta");
  if (error) return { erro: "Não foi possível excluir agora. Tente de novo em instantes." };

  await supabase.auth.signOut();
  redirect("/conta-excluida");
}
