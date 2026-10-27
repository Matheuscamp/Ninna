import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TIPOS_CONSENTIMENTO, VERSAO_CONSENTIMENTO } from "@/lib/consentimento";
import { hojeEmSaoPaulo } from "@/lib/datas";
import { escaparBusca, type Filtros } from "@/lib/documentos";
import { idadeGestacional, type Perfil } from "@/lib/triagem";

export const BUCKET_DOCUMENTOS = "documentos";

// Camada de acesso a dados: o único lugar que lê a sessão e decide
// se a usuária pode seguir. Toda página e ação logada passa por aqui.

// O Supabase devolve erros como objetos simples; vira um Error com código e mensagem
// para o log e a tela de erro mostrarem o motivo (ex.: tabela que ainda não existe).
function falhaDoBanco(contexto: string, erro: { code?: string; message: string }) {
  return new Error(`[${contexto}] ${erro.code ?? "sem_codigo"}: ${erro.message}`);
}

export type Usuaria = { id: string; email: string | undefined };

// getClaims valida a assinatura do token (chaves assimétricas do projeto),
// em geral sem chamada de rede.
export async function getUsuaria(): Promise<Usuaria | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  return claims?.sub ? { id: claims.sub, email: claims.email } : null;
}

export async function temConsentimento(usuariaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consents")
    .select("tipo")
    .eq("user_id", usuariaId)
    .eq("versao", VERSAO_CONSENTIMENTO)
    .is("revogado_em", null);
  if (error) throw falhaDoBanco("consentimento", error);
  const aceitos = new Set(data.map((c) => c.tipo));
  return TIPOS_CONSENTIMENTO.every((tipo) => aceitos.has(tipo));
}

export type PerfilUsuaria = {
  nome: string | null;
  perfil: Perfil | null;
  dum: string | null;
  primeira_gestacao: boolean | null;
  cesarea_anterior: boolean | null;
  alto_risco: boolean | null;
  pre_natal: string | null;
};

export async function getPerfil(usuariaId: string): Promise<PerfilUsuaria | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("nome, perfil, dum, primeira_gestacao, cesarea_anterior, alto_risco, pre_natal")
    .eq("id", usuariaId)
    .maybeSingle();
  if (error) throw falhaDoBanco("perfil", error);
  return data;
}

// Para páginas do app: exige login, consentimento e triagem feita, nessa ordem.
export async function exigirUsuariaPronta() {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app");
  if (!(await temConsentimento(usuaria.id))) redirect("/consentimento");
  const perfil = await getPerfil(usuaria.id);
  if (!perfil?.perfil) redirect("/triagem");
  const hoje = hojeEmSaoPaulo();
  const semanas = perfil.perfil === "gestante" && perfil.dum ? idadeGestacional(perfil.dum, hoje).semanas : null;
  return { usuaria, perfil: perfil as PerfilUsuaria & { perfil: Perfil }, semanas, hoje };
}

export type Consulta = {
  id: number;
  titulo: string;
  data_hora: string;
  local: string | null;
  observacoes: string | null;
  concluida_em: string | null;
};

export async function listarConsultas(usuariaId: string): Promise<Consulta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, titulo, data_hora, local, observacoes, concluida_em")
    .eq("user_id", usuariaId)
    .order("data_hora", { ascending: true });
  if (error) throw falhaDoBanco("agenda", error);
  return data;
}

export async function obterConsulta(usuariaId: string, id: number): Promise<Consulta | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, titulo, data_hora, local, observacoes, concluida_em")
    .eq("user_id", usuariaId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw falhaDoBanco("agenda", error);
  return data;
}

export async function listarTarefasFeitas(usuariaId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("task_progress").select("tarefa").eq("user_id", usuariaId);
  if (error) throw falhaDoBanco("tarefas", error);
  return data.map((t) => t.tarefa);
}

export type Documento = {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  data_documento: string | null;
  profissional: string | null;
  caminho: string;
  tipo_mime: string;
  tamanho: number;
  nome_original: string;
  created_at: string;
};

const CAMPOS_DOCUMENTO =
  "id, nome, categoria, descricao, data_documento, profissional, caminho, tipo_mime, tamanho, nome_original, created_at";

// Busca, categoria, período e ordenação se combinam numa única consulta.
// O RLS garante que só voltam documentos da própria usuária.
export async function listarDocumentos(usuariaId: string, f: Filtros): Promise<Documento[]> {
  const supabase = await createClient();
  let consulta = supabase.from("health_documents").select(CAMPOS_DOCUMENTO).eq("user_id", usuariaId);
  if (f.q) consulta = consulta.ilike("nome", `%${escaparBusca(f.q)}%`);
  if (f.categoria) consulta = consulta.eq("categoria", f.categoria);
  if (f.de) consulta = consulta.gte("data_documento", f.de);
  if (f.ate) consulta = consulta.lte("data_documento", f.ate);
  if (f.ordem === "nome") consulta = consulta.order("nome", { ascending: true });
  else if (f.ordem === "data_documento") consulta = consulta.order("data_documento", { ascending: false, nullsFirst: false });
  else consulta = consulta.order("created_at", { ascending: f.ordem === "antigos" });
  const { data, error } = await consulta.limit(200);
  if (error) throw falhaDoBanco("documentos", error);
  return data;
}

export async function contarDocumentos(usuariaId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("health_documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", usuariaId);
  if (error) throw falhaDoBanco("documentos", error);
  return count ?? 0;
}

export async function obterDocumento(usuariaId: string, id: string): Promise<Documento | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("health_documents")
    .select(CAMPOS_DOCUMENTO)
    .eq("user_id", usuariaId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw falhaDoBanco("documentos", error);
  return data;
}

// Links temporários para as miniaturas das imagens (nada de link público permanente).
export async function linksDeMiniatura(caminhos: string[], segundos = 300): Promise<Record<string, string>> {
  if (caminhos.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET_DOCUMENTOS).createSignedUrls(caminhos, segundos);
  if (error) return {};
  const links: Record<string, string> = {};
  for (const d of data) if (d.path && d.signedUrl) links[d.path] = d.signedUrl;
  return links;
}
