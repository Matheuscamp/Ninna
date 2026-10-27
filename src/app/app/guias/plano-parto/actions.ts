"use server";

import { redirect } from "next/navigation";
import { getPlano, getUsuaria } from "@/lib/dal";
import { lerRespostas } from "@/lib/plano-parto";
import { createClient } from "@/lib/supabase/server";

export type EstadoPlanoParto = { erro?: string } | undefined;

// Salva o plano de parto (recurso Premium) e abre o documento pronto para imprimir.
export async function salvarPlanoDeParto(_estado: EstadoPlanoParto, formData: FormData): Promise<EstadoPlanoParto> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/guias/plano-parto");
  if ((await getPlano(usuaria.id)) !== "premium") return { erro: "O plano de parto é um recurso Premium." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("planos_de_parto")
    .upsert({ user_id: usuaria.id, respostas: lerRespostas(formData), atualizado_em: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) {
    if (error.code === "PGRST205") return { erro: "O plano de parto ainda não está disponível. Tente de novo mais tarde." };
    return { erro: "Não conseguimos salvar agora. Tente de novo em instantes." };
  }
  redirect("/app/guias/plano-parto/documento?ok=salvo");
}
