import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TIPOS_CONSENTIMENTO, VERSAO_CONSENTIMENTO } from "@/lib/consentimento";
import type { Perfil } from "@/lib/triagem";

// Camada de acesso a dados: o único lugar que lê a sessão e decide
// se a usuária pode seguir. Toda página e ação logada passa por aqui.

export type Usuaria = { id: string; email: string | undefined };

export async function getUsuaria(): Promise<Usuaria | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email } : null;
}

export async function temConsentimento(usuariaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consents")
    .select("tipo")
    .eq("user_id", usuariaId)
    .eq("versao", VERSAO_CONSENTIMENTO)
    .is("revogado_em", null);
  if (error) throw error;
  const aceitos = new Set(data.map((c) => c.tipo));
  return TIPOS_CONSENTIMENTO.every((tipo) => aceitos.has(tipo));
}

export type PerfilUsuaria = {
  nome: string | null;
  perfil: Perfil | null;
  dum: string | null;
};

export async function getPerfil(usuariaId: string): Promise<PerfilUsuaria | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("nome, perfil, dum")
    .eq("id", usuariaId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Para páginas do app: exige login, consentimento e triagem feita, nessa ordem.
export async function exigirUsuariaPronta() {
  const usuaria = await getUsuaria();
  if (!usuaria) redirect("/entrar?next=/app");
  if (!(await temConsentimento(usuaria.id))) redirect("/consentimento");
  const perfil = await getPerfil(usuaria.id);
  if (!perfil?.perfil) redirect("/triagem");
  return { usuaria, perfil: perfil as PerfilUsuaria & { perfil: Perfil } };
}
