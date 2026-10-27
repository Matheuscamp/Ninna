import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { criarSupabaseFalso, destinoDe } from "@/test/supabase-falso";

type CriarPreferencia = (dados: { usuariaId: string; periodo: string; origem: string }) => Promise<string>;
type Sincronizar = (usuariaId: string) => Promise<string | null>;
type Reembolsar = (id: string) => Promise<void>;

const estado = vi.hoisted(() => ({
  falso: null as unknown as ReturnType<typeof import("@/test/supabase-falso").criarSupabaseFalso>,
  criarPreferencia: null as unknown as Mock<CriarPreferencia>,
  sincronizar: null as unknown as Mock<Sincronizar>,
  reembolsar: null as unknown as Mock<Reembolsar>,
}));

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
vi.mock("@/lib/mercadopago", () => ({
  mercadoPagoConfigurado: () => Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
  criarPreferencia: (dados: Parameters<CriarPreferencia>[0]) => estado.criarPreferencia(dados),
  sincronizarPagamentos: (usuariaId: string) => estado.sincronizar(usuariaId),
  reembolsarPagamento: (id: string) => estado.reembolsar(id),
}));

const { iniciarPagamento, pedirReembolso, verificarPagamento } = await import("./actions");

const escolher = (periodo: string) => {
  const dados = new FormData();
  dados.set("periodo", periodo);
  return dados;
};

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  process.env.MERCADOPAGO_ACCESS_TOKEN = "APP_USR-teste";
  estado.falso = criarSupabaseFalso();
  estado.falso.responder("assinaturas", { data: null });
  estado.criarPreferencia = vi.fn<CriarPreferencia>(async () => "https://mp/checkout");
  estado.sincronizar = vi.fn<Sincronizar>(async () => "aprovado");
  estado.reembolsar = vi.fn<Reembolsar>(async () => {});
});

describe("iniciar pagamento do Premium", () => {
  it("cria o pedido do período escolhido e leva ao checkout", async () => {
    expect(await destinoDe(iniciarPagamento(undefined, escolher("anual")))).toBe("https://mp/checkout");
    expect(estado.criarPreferencia).toHaveBeenCalledWith({ usuariaId: "usuaria-1", periodo: "anual", origem: "http://localhost:3000" });
  });

  it("período desconhecido é recusado", async () => {
    expect(await iniciarPagamento(undefined, escolher("vitalicio"))).toEqual({ erro: "Escolha um dos planos." });
    expect(estado.criarPreferencia).not.toHaveBeenCalled();
  });

  it("sem credencial do Mercado Pago, avisa em vez de quebrar", async () => {
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    expect(await iniciarPagamento(undefined, escolher("mensal"))).toMatchObject({ erro: expect.stringMatching(/ainda não está disponível/) });
  });

  it("Premium sem prazo não compra de novo", async () => {
    estado.falso.responder("assinaturas", { data: { plano: "premium", valido_ate: null } });
    expect(await iniciarPagamento(undefined, escolher("mensal"))).toMatchObject({ erro: expect.any(String) });
    expect(estado.criarPreferencia).not.toHaveBeenCalled();
  });

  it("falha do Mercado Pago vira mensagem", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    estado.criarPreferencia.mockRejectedValue(new Error("500"));
    expect(await iniciarPagamento(undefined, escolher("mensal"))).toMatchObject({ erro: expect.stringMatching(/Tente de novo/) });
  });

  it("deslogada vai para o login", async () => {
    estado.falso.deslogar();
    expect(await destinoDe(iniciarPagamento(undefined, escolher("mensal")))).toBe("/entrar?next=/app/premium");
  });
});

describe("verificar pagamento (\"já paguei\")", () => {
  it("encontrou pagamento: mostra o resultado na tela do Premium", async () => {
    expect(await destinoDe(verificarPagamento())).toBe("/app/premium?pagamento=aprovado");
    expect(estado.sincronizar).toHaveBeenCalledWith("usuaria-1");
  });

  it("nenhum pagamento: avisa sem sair da tela", async () => {
    estado.sincronizar.mockResolvedValue(null);
    expect(await verificarPagamento()).toMatchObject({ erro: expect.stringMatching(/Não encontramos/) });
  });

  it("falha na consulta vira mensagem", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    estado.sincronizar.mockRejectedValue(new Error("rede"));
    expect(await verificarPagamento()).toMatchObject({ erro: expect.stringMatching(/Tente de novo/) });
  });
});

describe("pedir reembolso (direito de arrependimento)", () => {
  const pedir = (id = "42") => {
    const dados = new FormData();
    dados.set("pagamento", id);
    return pedirReembolso(undefined, dados);
  };
  const horasAtras = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

  it("dentro de 7 dias: reembolsa e mostra a confirmação", async () => {
    estado.falso.responder("pagamentos", { data: { status: "aprovado", aprovado_em: horasAtras(24) } });
    expect(await destinoDe(pedir())).toBe("/app/premium?pagamento=reembolsado");
    expect(estado.reembolsar).toHaveBeenCalledWith("42");
    // Confere que o pagamento é da própria usuária.
    expect(estado.falso.consultas.pagamentos[0].eq).toHaveBeenCalledWith("user_id", "usuaria-1");
  });

  it("depois de 7 dias: recusa sem chamar o Mercado Pago", async () => {
    estado.falso.responder("pagamentos", { data: { status: "aprovado", aprovado_em: horasAtras(24 * 8) } });
    expect(await pedir()).toMatchObject({ erro: expect.stringMatching(/prazo de 7 dias/) });
    expect(estado.reembolsar).not.toHaveBeenCalled();
  });

  it("pagamento de outra pessoa (não volta pelo RLS) ou já reembolsado: recusa", async () => {
    estado.falso.responder("pagamentos", { data: null });
    expect(await pedir()).toEqual({ erro: "Pagamento não encontrado." });
    estado.falso.responder("pagamentos", { data: { status: "estornado", aprovado_em: horasAtras(1) } });
    expect(await pedir()).toMatchObject({ erro: expect.stringMatching(/já foi reembolsado/) });
    expect(estado.reembolsar).not.toHaveBeenCalled();
  });

  it("id inválido é recusado antes de consultar o banco", async () => {
    expect(await pedir("1; drop")).toEqual({ erro: "Pagamento não encontrado." });
    expect(estado.falso.supabase.from).not.toHaveBeenCalled();
  });

  it("falha no Mercado Pago vira mensagem", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    estado.falso.responder("pagamentos", { data: { status: "aprovado", aprovado_em: horasAtras(1) } });
    estado.reembolsar.mockRejectedValue(new Error("400"));
    expect(await pedir()).toMatchObject({ erro: expect.stringMatching(/Tente de novo/) });
  });
});
