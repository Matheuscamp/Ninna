"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { consultaSchema, LIMITE_GRATUITO } from "@/lib/agenda";
import { getUsuaria } from "@/lib/dal";
import { localParaIso } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";

export type EstadoConsulta =
  | { erro?: string; erros?: Record<string, string[] | undefined>; valores?: Record<string, string> }
  | undefined;

const CAMPOS = ["titulo", "data", "hora", "local", "observacoes"] as const;
const ERRO_SALVAR = "Não foi possível salvar agora. Tente de novo.";

// Lê e valida o formulário. Devolve os valores digitados para o formulário
// não perder nada se houver erro.
function lerFormulario(formData: FormData) {
  const valores = Object.fromEntries(CAMPOS.map((c) => [c, String(formData.get(c) ?? "")]));
  const campos = consultaSchema.safeParse({
    ...valores,
    local: valores.local.trim() || undefined,
    observacoes: valores.observacoes.trim() || undefined,
  });
  return { valores, campos };
}

// Regra do plano gratuito: no máximo LIMITE_GRATUITO consultas futuras.
async function passaDoLimite(usuariaId: string, dataHora: string, ignorarId?: number) {
  if (new Date(dataHora) <= new Date()) return false;
  const supabase = await createClient();
  let consulta = supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", usuariaId)
    .is("concluida_em", null)
    .gt("data_hora", new Date().toISOString());
  if (ignorarId !== undefined) consulta = consulta.neq("id", ignorarId);
  const { count, error } = await consulta;
  if (error) throw error;
  return (count ?? 0) >= LIMITE_GRATUITO;
}

const MENSAGEM_LIMITE = `No plano gratuito você pode ter até ${LIMITE_GRATUITO} consultas futuras. Remova ou edite uma delas, ou aguarde o Premium, que chega em breve.`;

export async function criarConsulta(_estado: EstadoConsulta, formData: FormData): Promise<EstadoConsulta> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/agenda");

  const { valores, campos } = lerFormulario(formData);
  if (!campos.success) return { erros: z.flattenError(campos.error).fieldErrors, valores };
  const dataHora = localParaIso(campos.data.data, campos.data.hora);

  try {
    if (await passaDoLimite(usuaria.id, dataHora)) return { erro: MENSAGEM_LIMITE, valores };
  } catch {
    return { erro: ERRO_SALVAR, valores };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("appointments").insert({
    user_id: usuaria.id,
    titulo: campos.data.titulo,
    data_hora: dataHora,
    local: campos.data.local ?? null,
    observacoes: campos.data.observacoes ?? null,
  });
  if (error) return { erro: ERRO_SALVAR, valores };

  redirect("/app/agenda?ok=criada");
}

// Recebe o id já "amarrado" pela página de edição (editarConsulta.bind(null, id)).
export async function editarConsulta(id: number, _estado: EstadoConsulta, formData: FormData): Promise<EstadoConsulta> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect(`/entrar?next=/app/agenda/${id}/editar`);

  const { valores, campos } = lerFormulario(formData);
  if (!campos.success) return { erros: z.flattenError(campos.error).fieldErrors, valores };
  const dataHora = localParaIso(campos.data.data, campos.data.hora);

  try {
    if (await passaDoLimite(usuaria.id, dataHora, id)) return { erro: MENSAGEM_LIMITE, valores };
  } catch {
    return { erro: ERRO_SALVAR, valores };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({
      titulo: campos.data.titulo,
      data_hora: dataHora,
      local: campos.data.local ?? null,
      observacoes: campos.data.observacoes ?? null,
    })
    .eq("id", id)
    .eq("user_id", usuaria.id)
    .select("id");
  // Sem linha alterada = consulta não existe mais, é de outra pessoa ou falta a regra de edição no banco.
  if (error || data.length === 0) return { erro: ERRO_SALVAR, valores };

  redirect("/app/agenda?ok=editada");
}

// Volta para a aba em que a usuária estava (próximas, confirmar ou concluídas).
function voltarParaAgenda(formData: FormData, ok: string): never {
  const aba = String(formData.get("aba") ?? "");
  const params = new URLSearchParams({ ok });
  if (["proximas", "confirmar", "concluidas"].includes(aba)) params.set("aba", aba);
  redirect(`/app/agenda?${params}`);
}

// Marca como concluída (guarda quando) ou desmarca (volta a ficar pendente).
export async function alternarConcluida(formData: FormData) {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/agenda");
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) voltarParaAgenda(formData, "erro");
  const concluir = formData.get("concluir") === "sim";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({ concluida_em: concluir ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", usuaria.id)
    .select("id");
  if (error || data.length === 0) voltarParaAgenda(formData, "erro");
  voltarParaAgenda(formData, concluir ? "concluida" : "reaberta");
}

export async function removerConsulta(formData: FormData) {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/agenda");
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) voltarParaAgenda(formData, "erro");

  const supabase = await createClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id).eq("user_id", usuaria.id);
  voltarParaAgenda(formData, error ? "erro" : "removida");
}
