import { AuthApiError } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarSupabaseFalso } from "@/test/supabase-falso";

const estado = vi.hoisted(() => ({ falso: null as unknown as ReturnType<typeof criarSupabaseFalso> }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => estado.falso.supabase }));

const { GET } = await import("./route");

const abrir = async (busca: string) => (await GET(new NextRequest(`https://ninna.com.br/auth/callback?${busca}`))).headers.get("location");
const vencido = new AuthApiError("Email link is invalid or has expired", 403, "otp_expired");

beforeEach(() => {
  estado.falso = criarSupabaseFalso();
});

describe("retorno dos links de e-mail", () => {
  it("link com code abre a sessão e segue para o destino", async () => {
    expect(await abrir("code=abc&next=/nova-senha")).toBe("https://ninna.com.br/nova-senha");
    expect(estado.falso.supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("link com token_hash de recuperação funciona em qualquer aparelho", async () => {
    expect(await abrir("token_hash=h1&type=recovery&next=/nova-senha")).toBe("https://ninna.com.br/nova-senha");
    expect(estado.falso.supabase.auth.verifyOtp).toHaveBeenCalledWith({ type: "recovery", token_hash: "h1" });
  });

  it("recusa tipos de link que não usamos", async () => {
    expect(await abrir("token_hash=h1&type=email_change")).toBe("https://ninna.com.br/entrar?erro=link");
    expect(estado.falso.supabase.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("link de nova senha vencido volta para pedir outro", async () => {
    estado.falso.supabase.auth.exchangeCodeForSession.mockResolvedValue({ data: {}, error: vencido });
    expect(await abrir("code=abc&next=/nova-senha")).toBe("https://ninna.com.br/esqueci-senha?erro=link");
    expect(await abrir("next=/nova-senha&error=access_denied")).toBe("https://ninna.com.br/esqueci-senha?erro=link");
  });

  it("link de confirmação vencido volta para o login", async () => {
    estado.falso.supabase.auth.verifyOtp.mockResolvedValue({ data: {}, error: vencido });
    expect(await abrir("token_hash=h1&type=signup&next=/consentimento")).toBe("https://ninna.com.br/entrar?erro=link");
  });

  it("ignora destinos externos", async () => {
    expect(await abrir("code=abc&next=//site-malicioso.com")).toBe("https://ninna.com.br/app");
  });
});
