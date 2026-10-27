"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { BUCKET_DOCUMENTOS, contarDocumentos, getPlano, getUsuaria } from "@/lib/dal";
import { atingiuLimite, LIMITES_GRATUITOS } from "@/lib/planos";
import { metadadosSchema, TIPOS_ACEITOS, tipoAceito, tipoPelosBytes, validarArquivo, type Metadados } from "@/lib/documentos";
import { fetchSupabase } from "@/lib/supabase/fetch";
import { createClient } from "@/lib/supabase/server";

// Caminho gerado pelo servidor: {id da usuária}/{uuid}.{extensão}
const CAMINHO_VALIDO = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/;

function caminhoDaUsuaria(caminho: string, usuariaId: string) {
  return CAMINHO_VALIDO.test(caminho) && caminho.startsWith(`${usuariaId}/`);
}

export type Preparo = { ok: true; url: string; caminho: string } | { ok: false; erro: string; limite?: boolean };

const MENSAGEM_LIMITE = `Você chegou ao limite de ${LIMITES_GRATUITOS.documentos} documentos do plano gratuito. Exclua algum ou assine o Premium, que não tem limite.`;

// Passo 1 do envio: valida o arquivo e devolve um link de envio de uso único.
// O navegador manda o arquivo direto para o Storage (com barra de progresso).
export async function prepararEnvio(arquivo: { nome: string; tipo: string; tamanho: number }): Promise<Preparo> {
  const usuaria = await getUsuaria();
  if (!usuaria) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };

  const erro = validarArquivo({ name: arquivo.nome, type: arquivo.tipo, size: arquivo.tamanho });
  if (erro || !tipoAceito(arquivo.tipo)) return { ok: false, erro: erro ?? "Formato não aceito." };

  // Limite do plano conferido antes de o arquivo subir.
  try {
    const [plano, total] = await Promise.all([getPlano(usuaria.id), contarDocumentos(usuaria.id)]);
    if (atingiuLimite(plano, "documentos", total)) return { ok: false, erro: MENSAGEM_LIMITE, limite: true };
  } catch {
    return { ok: false, erro: "Não foi possível iniciar o envio. Tente de novo." };
  }

  const caminho = `${usuaria.id}/${crypto.randomUUID()}.${TIPOS_ACEITOS[arquivo.tipo]}`;
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET_DOCUMENTOS).createSignedUploadUrl(caminho);
  if (error) return { ok: false, erro: "Não foi possível iniciar o envio. Tente de novo." };
  return { ok: true, url: data.signedUrl, caminho };
}

// Lê só os primeiros bytes do arquivo enviado, por um link que expira em 60 s.
// Usa o fetch próprio do Supabase (fora do fetch do Next, que duplica a resposta
// para cache e fazia a leitura parcial travar) e desiste em 15 s.
async function primeirosBytes(caminho: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage.from(BUCKET_DOCUMENTOS).createSignedUrl(caminho, 60);
  if (!data) return null;
  try {
    const resposta = await fetchSupabase(data.signedUrl, {
      headers: { Range: "bytes=0-15" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resposta.ok) return null;
    // Com Range, vêm só 16 bytes; se o servidor ignorar, vem o arquivo (até 10 MB).
    return new Uint8Array(await resposta.arrayBuffer()).subarray(0, 16);
  } catch {
    return null;
  }
}

async function apagarArquivo(caminho: string) {
  const supabase = await createClient();
  await supabase.storage.from(BUCKET_DOCUMENTOS).remove([caminho]);
}

export type Registro = { ok: true; id: string } | { ok: false; erro: string; limite?: boolean };

// Passo 2: confere o arquivo que chegou ao Storage e grava as informações.
export async function registrarDocumento(entrada: { caminho: string; nomeOriginal: string; metadados: Metadados }): Promise<Registro> {
  const usuaria = await getUsuaria();
  if (!usuaria) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };
  if (!caminhoDaUsuaria(entrada.caminho, usuaria.id)) return { ok: false, erro: "Envio inválido." };

  const metadados = metadadosSchema.safeParse(entrada.metadados);
  if (!metadados.success) {
    await apagarArquivo(entrada.caminho);
    return { ok: false, erro: "Confira o nome e a categoria do documento." };
  }

  const supabase = await createClient();
  const { data: info, error: erroInfo } = await supabase.storage.from(BUCKET_DOCUMENTOS).info(entrada.caminho);
  if (erroInfo || !info) return { ok: false, erro: "O arquivo não chegou ao servidor. Tente enviar de novo." };

  // Validação no servidor: tipo declarado, tamanho e assinatura real do arquivo.
  const tipo = info.contentType ?? "";
  const tamanho = info.size ?? 0;
  const bytes = await primeirosBytes(entrada.caminho);
  const invalido =
    validarArquivo({ name: entrada.nomeOriginal, type: tipo, size: tamanho }) ??
    (!bytes || tipoPelosBytes(bytes) !== tipo ? "O conteúdo do arquivo não corresponde ao formato. Envie uma imagem ou PDF válido." : null);
  if (invalido) {
    await apagarArquivo(entrada.caminho);
    return { ok: false, erro: invalido };
  }

  const m = metadados.data;
  const { data, error } = await supabase
    .from("health_documents")
    .insert({
      user_id: usuaria.id,
      nome: m.nome,
      categoria: m.categoria,
      descricao: m.descricao ?? null,
      data_documento: m.dataDocumento ?? null,
      profissional: m.profissional ?? null,
      caminho: entrada.caminho,
      tipo_mime: tipo,
      tamanho,
      nome_original: entrada.nomeOriginal.slice(0, 255),
    })
    .select("id")
    .single();
  if (error) {
    await apagarArquivo(entrada.caminho);
    // O banco também barra o 11º documento do plano gratuito (vários envios ao mesmo tempo).
    if (error.message?.includes("limite_documentos")) return { ok: false, erro: MENSAGEM_LIMITE, limite: true };
    return { ok: false, erro: "Não foi possível salvar o documento. Tente de novo." };
  }
  return { ok: true, id: data.id };
}

// Se o envio falhar depois do arquivo chegar ao Storage, não deixa arquivo solto.
export async function descartarEnvio(caminho: string) {
  const usuaria = await getUsuaria();
  if (usuaria && caminhoDaUsuaria(caminho, usuaria.id)) await apagarArquivo(caminho);
}

export type EstadoEdicao =
  | { erro?: string; erros?: Record<string, string[] | undefined>; valores?: Record<string, string> }
  | undefined;

export async function editarDocumento(id: string, _estado: EstadoEdicao, formData: FormData): Promise<EstadoEdicao> {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect(`/entrar?next=/app/documentos/${id}/editar`);

  const valores = Object.fromEntries(
    ["nome", "categoria", "descricao", "dataDocumento", "profissional"].map((c) => [c, String(formData.get(c) ?? "")]),
  );
  const campos = metadadosSchema.safeParse(valores);
  if (!campos.success) return { erros: z.flattenError(campos.error).fieldErrors, valores };

  const m = campos.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("health_documents")
    .update({
      nome: m.nome,
      categoria: m.categoria,
      descricao: m.descricao ?? null,
      data_documento: m.dataDocumento ?? null,
      profissional: m.profissional ?? null,
    })
    .eq("id", id)
    .eq("user_id", usuaria.id)
    .select("id");
  if (error || data.length === 0) return { erro: "Não foi possível salvar agora. Tente de novo.", valores };

  redirect("/app/documentos?ok=editado");
}

// Volta para a lista mantendo os filtros que estavam aplicados.
function voltarParaLista(formData: FormData, ok: string): never {
  const params = new URLSearchParams(String(formData.get("filtros") ?? ""));
  params.delete("ok");
  params.set("ok", ok);
  redirect(`/app/documentos?${params}`);
}

export async function excluirDocumento(formData: FormData) {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app/documentos");
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("health_documents")
    .select("caminho")
    .eq("id", id)
    .eq("user_id", usuaria.id)
    .maybeSingle();
  if (!doc) voltarParaLista(formData, "erro");

  // Primeiro o arquivo: se falhar, nada é apagado e a usuária pode tentar de novo.
  const { error: erroArquivo } = await supabase.storage.from(BUCKET_DOCUMENTOS).remove([doc.caminho]);
  if (erroArquivo) voltarParaLista(formData, "erro");
  const { error } = await supabase.from("health_documents").delete().eq("id", id).eq("user_id", usuaria.id);
  voltarParaLista(formData, error ? "erro" : "excluido");
}
