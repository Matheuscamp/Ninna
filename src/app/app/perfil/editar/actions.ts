"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BUCKET_AVATARES, getFicha, getUsuaria, linkDaFoto } from "@/lib/dal";
import { hojeEmSaoPaulo } from "@/lib/datas";
import { TIPOS_ACEITOS, tipoPelosBytes } from "@/lib/documentos";
import { criarFichaSchema, TAMANHO_MAXIMO_FOTO } from "@/lib/ficha";
import { createClient } from "@/lib/supabase/server";

export type EstadoFicha =
  | { erro?: string; erros?: Record<string, string[] | undefined>; valores?: Record<string, string> }
  | undefined;

const CAMPOS = [
  "nome",
  "dataNascimento",
  "tipoSanguineo",
  "peso",
  "altura",
  "alergias",
  "medicamentos",
  "emergenciaNome",
  "emergenciaParentesco",
  "emergenciaTelefone",
] as const;

export async function salvarFicha(_estado: EstadoFicha, formData: FormData): Promise<EstadoFicha> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/perfil/editar");

  const valores = Object.fromEntries(CAMPOS.map((c) => [c, String(formData.get(c) ?? "")]));
  const campos = criarFichaSchema(hojeEmSaoPaulo()).safeParse(valores);
  if (!campos.success) return { erros: z.flattenError(campos.error).fieldErrors, valores };

  const f = campos.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      nome: f.nome,
      data_nascimento: f.dataNascimento ?? null,
      tipo_sanguineo: f.tipoSanguineo ?? null,
      peso_kg: f.peso ?? null,
      altura_cm: f.altura ?? null,
      alergias: f.alergias ?? null,
      medicamentos: f.medicamentos ?? null,
      emergencia_nome: f.emergenciaNome ?? null,
      emergencia_parentesco: f.emergenciaParentesco ?? null,
      emergencia_telefone: f.emergenciaTelefone ?? null,
    })
    .eq("id", usuaria.id)
    .select("id");
  if (error || data.length === 0) return { erro: "Não foi possível salvar agora. Tente de novo.", valores };

  revalidatePath("/app/perfil");
  redirect("/app/perfil?ok=ficha");
}

export type ResultadoFoto = { ok: true; url: string | null } | { ok: false; erro: string };

// Recebe a foto já recortada e reduzida no navegador (sem os dados de GPS da câmera).
export async function enviarFoto(formData: FormData): Promise<ResultadoFoto> {
  const usuaria = await getUsuaria();
  if (!usuaria) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };

  const foto = formData.get("foto");
  if (!(foto instanceof Blob) || foto.size === 0) return { ok: false, erro: "Escolha uma foto." };
  if (foto.size > TAMANHO_MAXIMO_FOTO) return { ok: false, erro: "A foto ficou grande demais. Tente outra." };

  // O tipo vem do conteúdo real do arquivo, não do nome nem do que o navegador diz.
  const bytes = new Uint8Array(await foto.arrayBuffer());
  const tipo = tipoPelosBytes(bytes.subarray(0, 16));
  if (!tipo || !tipo.startsWith("image/")) return { ok: false, erro: "Envie uma foto em JPG, PNG ou WEBP." };

  const anterior = (await getFicha(usuaria.id))?.foto_caminho ?? null;
  const caminho = `${usuaria.id}/${Date.now()}.${TIPOS_ACEITOS[tipo]}`;
  const supabase = await createClient();
  const armazenamento = supabase.storage.from(BUCKET_AVATARES);

  const { error: erroEnvio } = await armazenamento.upload(caminho, bytes, { contentType: tipo, upsert: false });
  if (erroEnvio) return { ok: false, erro: "Não foi possível enviar a foto. Tente de novo." };

  const { error } = await supabase.from("profiles").update({ foto_caminho: caminho }).eq("id", usuaria.id);
  if (error) {
    await armazenamento.remove([caminho]);
    return { ok: false, erro: "Não foi possível salvar a foto. Tente de novo." };
  }
  if (anterior && anterior !== caminho) await armazenamento.remove([anterior]);

  revalidatePath("/app/perfil");
  return { ok: true, url: await linkDaFoto(caminho) };
}

export async function removerFoto(): Promise<ResultadoFoto> {
  const usuaria = await getUsuaria();
  if (!usuaria) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };

  const anterior = (await getFicha(usuaria.id))?.foto_caminho ?? null;
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ foto_caminho: null }).eq("id", usuaria.id);
  if (error) return { ok: false, erro: "Não foi possível remover agora. Tente de novo." };
  if (anterior) await supabase.storage.from(BUCKET_AVATARES).remove([anterior]);

  revalidatePath("/app/perfil");
  return { ok: true, url: null };
}
