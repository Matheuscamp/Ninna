import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

type Rpc = (funcao: string, argumentos: object) => Promise<{ data: unknown; error: unknown }>;

const estado = vi.hoisted(() => ({
  fetch: null as unknown as Mock<typeof fetch>,
  rpc: null as unknown as Mock<Rpc>,
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/fetch", () => ({ fetchSupabase: (...args: Parameters<typeof fetch>) => estado.fetch(...args) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: estado.rpc }) }));

const { criarPreferencia, processarPagamento, reembolsarPagamento, sincronizarPagamentos } = await import("./mercadopago");

const ID = "3f2a6c1e-9b7d-4e2a-8c1f-0a1b2c3d4e5f";
const json = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status });

// Endereço, cabeçalhos e corpo (já lido) da chamada número `i` à API.
function chamada(i = 0) {
  const [url, opcoes] = estado.fetch.mock.calls[i];
  const { headers, body } = opcoes as { headers: Record<string, string>; body?: string };
  return { url, headers, corpo: body ? JSON.parse(body) : undefined };
}

beforeEach(() => {
  process.env.MERCADOPAGO_ACCESS_TOKEN = "APP_USR-teste";
  estado.fetch = vi.fn<typeof fetch>();
  estado.rpc = vi.fn<Rpc>(async () => ({ data: true, error: null }));
});

describe("criarPreferencia", () => {
  it("manda preço, referência e volta para o app; devolve o link do checkout", async () => {
    estado.fetch.mockResolvedValue(json({ init_point: "https://mp/checkout", sandbox_init_point: "https://mp/sandbox" }));
    const link = await criarPreferencia({ usuariaId: ID, periodo: "anual", origem: "https://ninna.com.br" });

    expect(link).toBe("https://mp/checkout");
    const { url, headers, corpo } = chamada();
    expect(url).toBe("https://api.mercadopago.com/checkout/preferences");
    expect(headers.Authorization).toBe("Bearer APP_USR-teste");
    expect(corpo.items[0]).toMatchObject({ unit_price: 99.9, currency_id: "BRL", quantity: 1 });
    expect(corpo.external_reference).toBe(`ninna:anual:${ID}`);
    expect(corpo.back_urls.success).toBe("https://ninna.com.br/app/premium/retorno");
    expect(corpo.auto_return).toBe("approved");
  });

  it("em localhost não pede volta automática (o Mercado Pago recusa)", async () => {
    estado.fetch.mockResolvedValue(json({ init_point: "https://mp/checkout" }));
    await criarPreferencia({ usuariaId: ID, periodo: "mensal", origem: "http://localhost:3000" });
    expect(chamada().corpo.auto_return).toBeUndefined();
  });

  it("credencial TEST- usa o checkout de sandbox", async () => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = "TEST-123";
    estado.fetch.mockResolvedValue(json({ init_point: "https://mp/checkout", sandbox_init_point: "https://mp/sandbox" }));
    expect(await criarPreferencia({ usuariaId: ID, periodo: "mensal", origem: "http://localhost:3000" })).toBe("https://mp/sandbox");
  });

  it("erro da API vira exceção", async () => {
    estado.fetch.mockResolvedValue(json({ message: "invalid" }, 400));
    await expect(criarPreferencia({ usuariaId: ID, periodo: "mensal", origem: "http://localhost:3000" })).rejects.toThrow(/400/);
  });
});

describe("processarPagamento", () => {
  const pagamento = { id: 42, status: "approved", external_reference: `ninna:mensal:${ID}`, transaction_amount: 14.9, currency_id: "BRL" };

  it("aprovado: credita pelo banco com o id do pagamento", async () => {
    estado.fetch.mockResolvedValue(json(pagamento));
    expect(await processarPagamento("42")).toEqual({ situacao: "aprovado", usuariaId: ID });
    expect(chamada().url).toBe("https://api.mercadopago.com/v1/payments/42");
    expect(estado.rpc).toHaveBeenCalledWith("creditar_pagamento", { p_id: "42", p_user: ID, p_periodo: "mensal", p_meses: 1, p_valor: 14.9 });
  });

  it("estornado: estorna pelo banco", async () => {
    estado.fetch.mockResolvedValue(json({ ...pagamento, status: "refunded" }));
    expect(await processarPagamento("42")).toEqual({ situacao: "estornado", usuariaId: ID });
    expect(estado.rpc).toHaveBeenCalledWith("estornar_pagamento", { p_id: "42" });
  });

  it("pendente: não grava nada", async () => {
    estado.fetch.mockResolvedValue(json({ ...pagamento, status: "pending" }));
    expect(await processarPagamento("42")).toEqual({ situacao: "pendente", usuariaId: ID });
    expect(estado.rpc).not.toHaveBeenCalled();
  });

  it("valor adulterado ou pagamento inexistente: ignora", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    estado.fetch.mockResolvedValueOnce(json({ ...pagamento, transaction_amount: 0.01 }));
    expect(await processarPagamento("42")).toEqual({ situacao: "ignorado" });
    estado.fetch.mockResolvedValueOnce(json({ message: "not found" }, 404));
    expect(await processarPagamento("123456")).toEqual({ situacao: "ignorado" });
    expect(estado.rpc).not.toHaveBeenCalled();
  });

  it("falha ao gravar vira exceção (para o Mercado Pago reenviar o aviso)", async () => {
    estado.fetch.mockResolvedValue(json(pagamento));
    estado.rpc.mockResolvedValue({ data: null, error: { code: "PGRST202", message: "função não encontrada" } });
    await expect(processarPagamento("42")).rejects.toThrow(/PGRST202/);
  });
});

describe("sincronizarPagamentos", () => {
  const aprovado = { id: 7, status: "approved", external_reference: `ninna:mensal:${ID}`, transaction_amount: 14.9, currency_id: "BRL" };

  it("procura os pedidos de cada período e credita o aprovado", async () => {
    estado.fetch.mockImplementation(async (url) =>
      json({ results: String(url).includes(encodeURIComponent(`ninna:mensal:${ID}`)) ? [aprovado] : [] }),
    );
    expect(await sincronizarPagamentos(ID)).toBe("aprovado");
    expect(estado.fetch).toHaveBeenCalledTimes(2);
    expect(chamada().url).toMatch(/^https:\/\/api\.mercadopago\.com\/v1\/payments\/search\?external_reference=ninna%3A/);
    expect(estado.rpc).toHaveBeenCalledWith("creditar_pagamento", expect.objectContaining({ p_id: "7", p_user: ID }));
  });

  it("aprovado vence pendente; sem pagamentos devolve null", async () => {
    estado.fetch.mockResolvedValueOnce(json({ results: [{ ...aprovado, id: 8, status: "pending" }, aprovado] }));
    estado.fetch.mockResolvedValueOnce(json({ results: [] }));
    expect(await sincronizarPagamentos(ID)).toBe("aprovado");

    estado.fetch.mockImplementation(async () => json({ results: [] }));
    expect(await sincronizarPagamentos(ID)).toBeNull();
  });

  it("só pendentes: pendente, sem gravar nada", async () => {
    estado.fetch.mockImplementation(async () => json({ results: [{ ...aprovado, status: "pending" }] }));
    expect(await sincronizarPagamentos(ID)).toBe("pendente");
    expect(estado.rpc).not.toHaveBeenCalled();
  });
});

describe("reembolsarPagamento", () => {
  it("pede o reembolso integral (com chave de idempotência) e tira o período do Premium", async () => {
    estado.fetch.mockResolvedValue(json({ id: 1, status: "approved" }, 201));
    await reembolsarPagamento("42");
    const { url, headers } = chamada();
    expect(url).toBe("https://api.mercadopago.com/v1/payments/42/refunds");
    expect(estado.fetch.mock.calls[0][1]?.method).toBe("POST");
    expect(headers["X-Idempotency-Key"]).toBe("ninna-reembolso-42");
    expect(estado.rpc).toHaveBeenCalledWith("estornar_pagamento", { p_id: "42" });
  });

  it("se o Mercado Pago recusar, não mexe no Premium", async () => {
    estado.fetch.mockResolvedValue(json({ message: "refund not allowed" }, 400));
    await expect(reembolsarPagamento("42")).rejects.toThrow(/400/);
    expect(estado.rpc).not.toHaveBeenCalled();
  });
});
