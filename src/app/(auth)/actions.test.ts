import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarSupabaseFalso, destinoDe } from "@/test/supabase-falso";

const estado = vi.hoisted(() => ({ falso: null as unknown as ReturnType<typeof criarSupabaseFalso> }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => estado.falso.supabase }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ origin: "http://localhost:3000" }) }));
vi.mock("next/navigation", async () => {
  const { Redirecionou } = await import("@/test/supabase-falso");
  return {
    redirect: (destino: string) => {
      throw new Redirecionou(destino);
    },
  };
});

const { cadastrar, entrar } = await import("./actions");

function formulario(campos: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) fd.set(k, v);
  return fd;
}

const VALIDO = { nome: "  Raissa ", email: "raissa@exemplo.com", senha: "senhaforte123" };
const sessao = { access_token: "t", refresh_token: "r" };

beforeEach(() => {
  estado.falso = criarSupabaseFalso();
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe("cadastro: validação dos campos", () => {
  it("recusa nome vazio, e-mail inválido e senha curta sem chamar o Supabase", async () => {
    const r = await cadastrar(undefined, formulario({ nome: " ", email: "nao-e-email", senha: "123" }));
    expect(r?.erros?.nome?.[0]).toBe("Como podemos te chamar?");
    expect(r?.erros?.email?.[0]).toBe("Informe um e-mail válido.");
    expect(r?.erros?.senha?.[0]).toBe("Use pelo menos 8 caracteres.");
    expect(estado.falso.supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it("devolve nome e e-mail digitados, mas nunca a senha", async () => {
    const r = await cadastrar(undefined, formulario({ ...VALIDO, senha: "123" }));
    expect(r?.valores).toEqual({ nome: VALIDO.nome, email: VALIDO.email });
    expect(JSON.stringify(r)).not.toContain("123\"");
  });
});

describe("cadastro: conta criada", () => {
  it("com a confirmação de e-mail desligada, entra direto e vai para o consentimento", async () => {
    estado.falso.supabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u" }, session: sessao }, error: null });

    expect(await destinoDe(cadastrar(undefined, formulario(VALIDO)))).toBe("/consentimento");
    expect(estado.falso.supabase.auth.signUp).toHaveBeenCalledWith({
      email: "raissa@exemplo.com",
      password: "senhaforte123",
      options: { data: { nome: "Raissa" }, emailRedirectTo: "http://localhost:3000/auth/callback?next=/consentimento" },
    });
  });

  it("com a confirmação de e-mail ligada, pede para conferir o e-mail", async () => {
    estado.falso.supabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u" }, session: null }, error: null });
    expect(await cadastrar(undefined, formulario(VALIDO))).toEqual({ enviado: true });
  });

  it("usa só a origem do NEXT_PUBLIC_SITE_URL no link de confirmação (evita o /auth/callback duplicado)", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://ninna.com.br/auth/callback";
    estado.falso.supabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u" }, session: null }, error: null });
    await cadastrar(undefined, formulario(VALIDO));
    expect(estado.falso.supabase.auth.signUp.mock.calls[0][0].options.emailRedirectTo).toBe(
      "https://ninna.com.br/auth/callback?next=/consentimento",
    );
  });
});

describe("cadastro: erros do Supabase viram mensagens claras", () => {
  const casos: [string, number, RegExp][] = [
    ["over_email_send_rate_limit", 429, /envio de e-mails foi pausado/],
    ["over_request_rate_limit", 429, /Muitas tentativas/],
    ["email_provider_disabled", 400, /O cadastro está desativado no momento/],
    ["user_already_exists", 422, /Já existe uma conta/],
    ["email_exists", 422, /Já existe uma conta/],
    ["weak_password", 422, /senha é muito fraca/],
    ["email_address_invalid", 400, /e-mail não foi aceito/],
    ["signup_disabled", 422, /cadastros estão desativados/],
    ["codigo_novo_desconhecido", 500, /Não foi possível criar a conta agora/],
  ];

  it.each(casos)("%s", async (codigo, status, mensagem) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    estado.falso.supabase.auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: new AuthApiError("erro", status, codigo) });

    const r = await cadastrar(undefined, formulario(VALIDO));
    expect(r?.erro).toMatch(mensagem);
    expect(r?.valores).toEqual({ nome: VALIDO.nome, email: VALIDO.email });
  });

  it("queda de conexão mostra mensagem de internet, não de dados errados", async () => {
    estado.falso.supabase.auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: new AuthRetryableFetchError("fetch failed", 0) });
    const r = await cadastrar(undefined, formulario(VALIDO));
    expect(r?.erro).toMatch(/Confira sua internet/);
  });

  it("registra no log só o código do erro, sem e-mail ou senha", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    estado.falso.supabase.auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: new AuthApiError("erro", 429, "over_email_send_rate_limit") });
    await cadastrar(undefined, formulario(VALIDO));
    const registrado = JSON.stringify(log.mock.calls);
    expect(registrado).toContain("over_email_send_rate_limit");
    expect(registrado).not.toContain(VALIDO.email);
    expect(registrado).not.toContain(VALIDO.senha);
  });
});

describe("login", () => {
  it("entra e segue para o destino pedido", async () => {
    estado.falso.supabase.auth.signInWithPassword.mockResolvedValue({ data: { session: sessao }, error: null });
    expect(await destinoDe(entrar(undefined, formulario({ email: VALIDO.email, senha: VALIDO.senha, next: "/triagem/concluir" })))).toBe(
      "/triagem/concluir",
    );
  });

  it("ignora destinos externos (redirecionamento aberto) e vai para o painel", async () => {
    estado.falso.supabase.auth.signInWithPassword.mockResolvedValue({ data: { session: sessao }, error: null });
    for (const next of ["//site-malicioso.com", "https://site-malicioso.com", ""]) {
      expect(await destinoDe(entrar(undefined, formulario({ email: VALIDO.email, senha: VALIDO.senha, next })))).toBe("/app");
    }
  });

  it("explica cada tipo de falha", async () => {
    const tentar = async (error: unknown) => {
      estado.falso.supabase.auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error });
      return (await entrar(undefined, formulario({ email: VALIDO.email, senha: VALIDO.senha })))?.erro;
    };
    expect(await tentar(new AuthApiError("x", 400, "invalid_credentials"))).toBe("E-mail ou senha incorretos.");
    expect(await tentar(new AuthApiError("x", 400, "email_not_confirmed"))).toMatch(/Confirme seu e-mail/);
    expect(await tentar(new AuthApiError("x", 400, "email_provider_disabled"))).toMatch(/O login está desativado no momento/);
    expect(await tentar(new AuthApiError("x", 429, "over_request_rate_limit"))).toMatch(/Muitas tentativas/);
    expect(await tentar(new AuthRetryableFetchError("fetch failed", 0))).toMatch(/Confira sua internet/);
  });

  it("valida os campos antes de chamar o Supabase", async () => {
    const r = await entrar(undefined, formulario({ email: "x", senha: "" }));
    expect(r?.erros?.email).toBeDefined();
    expect(r?.erros?.senha).toBeDefined();
    expect(estado.falso.supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});
