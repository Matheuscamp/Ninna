"use server";

import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";
import { origem } from "@/lib/origem";
import { createClient } from "@/lib/supabase/server";

const SEM_CONEXAO = "Não conseguimos conectar agora. Confira sua internet e tente de novo.";

// Códigos de erro do Supabase Auth mais comuns no cadastro.
const ERROS_CADASTRO: Record<string, string> = {
  over_email_send_rate_limit:
    "Muitos cadastros em pouco tempo e o envio de e-mails foi pausado. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.",
  email_address_invalid: "Esse e-mail não foi aceito. Use um endereço de e-mail real.",
  email_exists: "Já existe uma conta com esse e-mail. Tente entrar.",
  user_already_exists: "Já existe uma conta com esse e-mail. Tente entrar.",
  weak_password: "Essa senha é muito fraca. Use pelo menos 8 caracteres, misturando letras e números.",
  signup_disabled: "Novos cadastros estão desativados no momento.",
  email_provider_disabled: "O cadastro está desativado no momento. Tente de novo mais tarde.",
};

export type EstadoForm =
  | {
      erro?: string;
      erros?: Record<string, string[] | undefined>;
      enviado?: boolean;
      // Devolvidos para o formulário não apagar o que foi digitado após um erro.
      // A senha nunca volta.
      valores?: { nome?: string; email?: string };
    }
  | undefined;

function valoresDigitados(formData: FormData) {
  const texto = (campo: string) => {
    const valor = formData.get(campo);
    return typeof valor === "string" ? valor : undefined;
  };
  return { nome: texto("nome"), email: texto("email") };
}

// Só aceita caminhos internos, para o "next" não virar um redirecionamento aberto.
function destinoSeguro(next: FormDataEntryValue | null, padrao = "/app") {
  const valor = typeof next === "string" ? next : "";
  return valor.startsWith("/") && !valor.startsWith("//") ? valor : padrao;
}

const entrarSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }),
  senha: z.string().min(1, { error: "Informe sua senha." }),
});

export async function entrar(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const valores = valoresDigitados(formData);
  const campos = entrarSchema.safeParse({ email: formData.get("email"), senha: formData.get("senha") });
  if (!campos.success) return { erros: z.flattenError(campos.error).fieldErrors, valores };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: campos.data.email,
    password: campos.data.senha,
  });
  if (isAuthRetryableFetchError(error)) return { erro: SEM_CONEXAO, valores };
  if (error?.code === "email_not_confirmed") {
    return { erro: "Confirme seu e-mail pelo link que enviamos antes de entrar.", valores };
  }
  if (error?.code === "over_request_rate_limit") return { erro: ERROS_CADASTRO.over_request_rate_limit, valores };
  if (error?.code === "email_provider_disabled") {
    return { erro: "O login está desativado no momento. Tente de novo mais tarde.", valores };
  }
  if (error) return { erro: "E-mail ou senha incorretos.", valores };

  redirect(destinoSeguro(formData.get("next")));
}

const cadastroSchema = z.object({
  nome: z.string().trim().min(1, { error: "Como podemos te chamar?" }).max(60),
  email: z.email({ error: "Informe um e-mail válido." }),
  senha: z.string().min(8, { error: "Use pelo menos 8 caracteres." }),
});

export async function cadastrar(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const valores = valoresDigitados(formData);
  const campos = cadastroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!campos.success) return { erros: z.flattenError(campos.error).fieldErrors, valores };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: campos.data.email,
    password: campos.data.senha,
    options: {
      data: { nome: campos.data.nome },
      emailRedirectTo: `${await origem()}/auth/callback?next=/consentimento`,
    },
  });
  if (isAuthRetryableFetchError(error)) return { erro: SEM_CONEXAO, valores };
  if (error) {
    // Registra só o código (sem e-mail ou senha) para facilitar o diagnóstico.
    console.error("[cadastro] erro do Supabase:", error.code ?? "sem_codigo", error.status);
    return {
      erro:
        (error.code && ERROS_CADASTRO[error.code]) ??
        "Não foi possível criar a conta agora. Tente de novo em alguns minutos.",
      valores,
    };
  }

  // Com confirmação de e-mail ligada no Supabase, ainda não há sessão.
  if (!data.session) return { enviado: true };
  redirect("/consentimento");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
