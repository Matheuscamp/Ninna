"use server";

import { FASES } from "@/content/guias";
import { getUsuaria } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

const IDS_TAREFAS = new Set(FASES.flatMap((f) => f.tarefas.map((t) => t.id)));

export async function marcarTarefa(tarefa: string, feita: boolean): Promise<{ ok: boolean }> {
  if (!IDS_TAREFAS.has(tarefa)) return { ok: false };
  const usuaria = await getUsuaria();
  if (!usuaria) return { ok: false };

  const supabase = await createClient();
  const { error } = feita
    ? await supabase.from("task_progress").upsert({ user_id: usuaria.id, tarefa }, { ignoreDuplicates: true })
    : await supabase.from("task_progress").delete().eq("user_id", usuaria.id).eq("tarefa", tarefa);
  return { ok: !error };
}
