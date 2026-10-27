import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { acaoDoPagamento, assinaturaWebhookValida, fimDoArrependimento, lerReferencia, montarReferencia, podeReembolsar } from "./pagamentos";
import { precoPorMes } from "./planos";

const ID = "3f2a6c1e-9b7d-4e2a-8c1f-0a1b2c3d4e5f";

describe("referência do pedido", () => {
  it("vai e volta com a usuária e o período", () => {
    expect(lerReferencia(montarReferencia(ID, "anual"))).toEqual({ usuariaId: ID, periodo: "anual" });
  });

  it("recusa referências de outro sistema ou adulteradas", () => {
    expect(lerReferencia(null)).toBeNull();
    expect(lerReferencia("pedido-123")).toBeNull();
    expect(lerReferencia(`ninna:vitalicio:${ID}`)).toBeNull();
    expect(lerReferencia("ninna:anual:nao-e-uuid")).toBeNull();
    expect(lerReferencia(`ninna:anual:${ID}:extra`)).toBeNull();
  });
});

describe("o que fazer com cada pagamento", () => {
  const aprovado = { id: 1, status: "approved", external_reference: montarReferencia(ID, "mensal"), transaction_amount: 14.9, currency_id: "BRL" };

  it("aprovado com o valor certo credita o período", () => {
    expect(acaoDoPagamento(aprovado)).toEqual({ tipo: "creditar", usuariaId: ID, periodo: "mensal" });
  });

  it("valor ou moeda diferentes do preço não creditam", () => {
    expect(acaoDoPagamento({ ...aprovado, transaction_amount: 1 }).tipo).toBe("ignorar");
    expect(acaoDoPagamento({ ...aprovado, external_reference: montarReferencia(ID, "anual") }).tipo).toBe("ignorar");
    expect(acaoDoPagamento({ ...aprovado, currency_id: "USD" }).tipo).toBe("ignorar");
  });

  it("pagamento de outro sistema é ignorado", () => {
    expect(acaoDoPagamento({ ...aprovado, external_reference: "outro" }).tipo).toBe("ignorar");
  });

  it("estorno e chargeback tiram o período", () => {
    expect(acaoDoPagamento({ ...aprovado, status: "refunded" })).toEqual({ tipo: "estornar", usuariaId: ID });
    expect(acaoDoPagamento({ ...aprovado, status: "charged_back" }).tipo).toBe("estornar");
  });

  it("Pix e boleto à espera ficam pendentes; recusado não faz nada", () => {
    expect(acaoDoPagamento({ ...aprovado, status: "pending" })).toMatchObject({ tipo: "nada", situacao: "pendente" });
    expect(acaoDoPagamento({ ...aprovado, status: "in_process" })).toMatchObject({ tipo: "nada", situacao: "pendente" });
    expect(acaoDoPagamento({ ...aprovado, status: "rejected" })).toMatchObject({ tipo: "nada", situacao: "recusado" });
    expect(acaoDoPagamento({ ...aprovado, status: "cancelled" })).toMatchObject({ tipo: "nada", situacao: "recusado" });
  });
});

describe("assinatura do webhook", () => {
  const segredo = "segredo-de-teste";
  const assinar = (manifesto: string) => createHmac("sha256", segredo).update(manifesto).digest("hex");

  it("aceita a assinatura feita com o segredo", () => {
    const v1 = assinar("id:123;request-id:req-1;ts:1700000000;");
    expect(assinaturaWebhookValida({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: "req-1", dataId: "123", segredo })).toBe(true);
  });

  it("sem x-request-id, a parte sai do texto assinado", () => {
    const v1 = assinar("id:123;ts:1700000000;");
    expect(assinaturaWebhookValida({ xSignature: `ts=1700000000, v1=${v1}`, xRequestId: null, dataId: "123", segredo })).toBe(true);
  });

  it("recusa assinatura de outro pagamento, segredo errado ou cabeçalho ausente", () => {
    const v1 = assinar("id:123;request-id:req-1;ts:1700000000;");
    const base = { xSignature: `ts=1700000000,v1=${v1}`, xRequestId: "req-1", dataId: "123", segredo };
    expect(assinaturaWebhookValida({ ...base, dataId: "999" })).toBe(false);
    expect(assinaturaWebhookValida({ ...base, segredo: "outro" })).toBe(false);
    expect(assinaturaWebhookValida({ ...base, xSignature: null })).toBe(false);
    expect(assinaturaWebhookValida({ ...base, xSignature: "ts=1700000000" })).toBe(false);
    expect(assinaturaWebhookValida({ ...base, xSignature: "ts=1700000000,v1=zz" })).toBe(false);
  });
});

describe("preço por mês", () => {
  it("12 meses saem mais baratos que o mensal", () => {
    expect(precoPorMes("mensal").economia).toBe(0);
    const anual = precoPorMes("anual");
    expect(anual.porMes).toBeCloseTo(8.325);
    expect(anual.economia).toBe(44);
  });
});

describe("direito de arrependimento", () => {
  const aprovadoEm = "2026-10-27T15:00:00Z";

  it("pode desistir até 7 dias depois da liberação", () => {
    expect(podeReembolsar({ status: "aprovado", aprovado_em: aprovadoEm }, new Date("2026-11-03T14:59:00Z"))).toBe(true);
    expect(podeReembolsar({ status: "aprovado", aprovado_em: aprovadoEm }, new Date("2026-11-03T15:01:00Z"))).toBe(false);
    expect(fimDoArrependimento(aprovadoEm).toISOString()).toBe("2026-11-03T15:00:00.000Z");
  });

  it("pagamento já reembolsado não pode ser reembolsado de novo", () => {
    expect(podeReembolsar({ status: "estornado", aprovado_em: aprovadoEm }, new Date("2026-10-28T00:00:00Z"))).toBe(false);
  });
});
