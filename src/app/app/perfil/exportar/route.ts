import { NextResponse } from "next/server";
import { getUsuaria } from "@/lib/dal";
import { hojeEmSaoPaulo } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";

// Portabilidade de dados (LGPD, art. 18): tudo o que o Ninna guarda sobre a usuária, em JSON.
export async function GET() {
  const usuaria = await getUsuaria();
  if (!usuaria) return NextResponse.json({ erro: "não autenticada" }, { status: 401 });

  const supabase = await createClient();
  const [perfil, consentimentos, triagens, consultas, tarefas, documentos, assinatura, pagamentos] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", usuaria.id).maybeSingle(),
    supabase.from("consents").select("tipo, versao, aceito_em, revogado_em").eq("user_id", usuaria.id),
    supabase.from("triage_answers").select("perfil, respostas, created_at").eq("user_id", usuaria.id),
    supabase.from("appointments").select("titulo, data_hora, local, observacoes, concluida_em, created_at").eq("user_id", usuaria.id),
    supabase.from("task_progress").select("tarefa, feita_em").eq("user_id", usuaria.id),
    supabase
      .from("health_documents")
      .select("nome, categoria, descricao, data_documento, profissional, tipo_mime, tamanho, nome_original, created_at")
      .eq("user_id", usuaria.id),
    supabase.from("assinaturas").select("plano, valido_ate").eq("user_id", usuaria.id).maybeSingle(),
    supabase.from("pagamentos").select("id, periodo, valor, status, aprovado_em, estornado_em").eq("user_id", usuaria.id),
  ]);

  // Planos e pagamentos podem ainda não existir no banco (migrações pendentes): saem vazios.
  const falhou = [perfil, consentimentos, triagens, consultas, tarefas, documentos].find((r) => r.error);
  if (falhou) return NextResponse.json({ erro: "não foi possível exportar agora" }, { status: 500 });

  const dados = {
    exportado_em: new Date().toISOString(),
    conta: { email: usuaria.email },
    perfil: perfil.data,
    consentimentos: consentimentos.data,
    triagens: triagens.data,
    consultas: consultas.data,
    tarefas_feitas: tarefas.data,
    // Os arquivos em si podem ser baixados um a um na Central de Documentos.
    documentos: documentos.data,
    plano: assinatura.data,
    pagamentos: pagamentos.data,
  };

  return new NextResponse(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="ninna-meus-dados-${hojeEmSaoPaulo()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
