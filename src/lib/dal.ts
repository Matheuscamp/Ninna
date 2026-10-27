import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TIPOS_CONSENTIMENTO, VERSAO_CONSENTIMENTO } from "@/lib/consentimento";
import { hojeEmSaoPaulo } from "@/lib/datas";
import { idadeGestacional, type Perfil } from "@/lib/triagem";

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
