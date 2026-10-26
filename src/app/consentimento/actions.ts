"use server";

import { redirect } from "next/navigation";
import { TIPOS_CONSENTIMENTO, VERSAO_CONSENTIMENTO } from "@/lib/consentimento";
import { getUsuaria } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type EstadoConsentimento = { erro?: string } | undefined;

export async function aceitarConsentimento(
  _estado: EstadoConsentimento,
  formData: FormData,
): Promise<EstadoConsentimento> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/consentimento");

  if (TIPOS_CONSENTIMENTO.some((tipo) => formData.get(tipo) !== "on")) {
    return { erro: "Para usar o Ninna, é preciso aceitar os dois itens." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("consents").upsert(
    TIPOS_CONSENTIMENTO.map((tipo) => ({ user_id: usuaria.id, tipo, versao: VERSAO_CONSENTIMENTO })),
    { onConflict: "user_id,tipo,versao", ignoreDuplicates: true },
  );
  if (error) return { erro: "Não foi possível registrar agora. Tente de novo em instantes." };

  redirect("/triagem/concluir");
}
