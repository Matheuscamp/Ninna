"use server";

import { getUsuaria, temConsentimento } from "@/lib/dal";
import { hojeEmSaoPaulo } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";
import {
  calcularDum,
  classificarPerfil,
  dumPlausivel,
  limparRespostas,
  modificadores,
  respostasSchema,
} from "@/lib/triagem";

export type ResultadoSalvar =
  | { ok: true }
  | { ok: false; motivo: "login" | "consentimento" | "invalida" | "erro"; mensagem?: string };

export async function salvarTriagem(entrada: unknown): Promise<ResultadoSalvar> {
  const usuaria = await getUsuaria();
  if (!usuaria) return { ok: false, motivo: "login" };
  if (!(await temConsentimento(usuaria.id))) return { ok: false, motivo: "consentimento" };

  const validacao = respostasSchema.safeParse(entrada);
  if (!validacao.success) return { ok: false, motivo: "invalida", mensagem: "Algumas respostas estão incompletas." };
  const r = limparRespostas(validacao.data);

  const perfil = classificarPerfil(r);
  let dum: string | null = null;
  if (perfil === "gestante") {
    dum = calcularDum(r, hojeEmSaoPaulo());
    if (!dum || !dumPlausivel(dum, hojeEmSaoPaulo())) {
      return { ok: false, motivo: "invalida", mensagem: "Confira a data informada da gestação." };
    }
  }

  const m = modificadores(r);
  const supabase = await createClient();
  const { error: erroPerfil } = await supabase
    .from("profiles")
    .update({
      perfil,
      dum,
      dum_fonte: perfil === "gestante" ? r.fonteData : null,
      primeira_gestacao: m.primeiraGestacao,
      cesarea_anterior: m.cesareaAnterior,
      perda_anterior: m.perdaAnterior,
      alto_risco: m.altoRisco,
      multipla: m.multipla,
      pre_natal: r.preNatal ?? null,
      acompanhante: r.acompanhante ?? null,
    })
    .eq("id", usuaria.id);
  if (erroPerfil) return { ok: false, motivo: "erro", mensagem: "Não foi possível salvar agora. Tente de novo." };

  const { error: erroHistorico } = await supabase
    .from("triage_answers")
    .insert({ user_id: usuaria.id, perfil, respostas: r });
  if (erroHistorico) return { ok: false, motivo: "erro", mensagem: "Não foi possível salvar agora. Tente de novo." };

  return { ok: true };
}
