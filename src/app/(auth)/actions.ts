"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro?: string; erros?: Record<string, string[] | undefined>; enviado?: boolean } | undefined;

// Só aceita caminhos internos, para o "next" não virar um redirecionamento aberto.
function destinoSeguro(next: FormDataEntryValue | null, padrao = "/app") {
  const valor = typeof next === "string" ? next : "";
  return valor.startsWith("/") && !valor.startsWith("//") ? valor : padrao;
}

// Só a origem (protocolo + domínio + porta): um caminho a mais no
// NEXT_PUBLIC_SITE_URL duplicaria o /auth/callback dos links.
async function origem() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get("origin") || "http://localhost:3000";
  return new URL(base).origin;
}

const entrarSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }),
  senha: z.string().min(1, { error: "Informe sua senha." }),
});

export async function entrar(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const campos = entrarSchema.safeParse({ email: formData.get("email"), senha: formData.get("senha") });
  if (!campos.success) return { erros: z.flattenError(campos.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: campos.data.email,
    password: campos.data.senha,
  });
  if (error?.code === "email_not_confirmed") {
    return { erro: "Confirme seu e-mail pelo link que enviamos antes de entrar." };
  }
  if (error) return { erro: "E-mail ou senha incorretos." };

  redirect(destinoSeguro(formData.get("next")));
}

const cadastroSchema = z.object({
  nome: z.string().trim().min(1, { error: "Como podemos te chamar?" }).max(60),
  email: z.email({ error: "Informe um e-mail válido." }),
  senha: z.string().min(8, { error: "Use pelo menos 8 caracteres." }),
});

export async function cadastrar(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const campos = cadastroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!campos.success) return { erros: z.flattenError(campos.error).fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: campos.data.email,
    password: campos.data.senha,
    options: {
      data: { nome: campos.data.nome },
      emailRedirectTo: `${await origem()}/auth/callback?next=/consentimento`,
    },
  });
  if (error) return { erro: "Não foi possível criar a conta. Tente outro e-mail ou tente mais tarde." };

  // Com confirmação de e-mail ligada no Supabase, ainda não há sessão.
  if (!data.session) return { enviado: true };
  redirect("/consentimento");
}

export async function entrarComGoogle(formData: FormData) {
  const next = destinoSeguro(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origem()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/entrar?erro=google");
  redirect(data.url);
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
