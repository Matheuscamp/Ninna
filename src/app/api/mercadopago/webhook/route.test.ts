import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

type Processar = (id: string) => Promise<{ situacao: string }>;

const estado = vi.hoisted(() => ({ processar: null as unknown as Mock<Processar> }));
vi.mock("@/lib/mercadopago", () => ({ processarPagamento: (id: string) => estado.processar(id) }));

const { POST } = await import("./route");

function aviso({ id = "42", tipo = "payment", headers = {} }: { id?: string; tipo?: string; headers?: Record<string, string> } = {}) {
  return new NextRequest(`https://ninna.com.br/api/mercadopago/webhook?data.id=${id}&type=${tipo}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action: "payment.updated", type: tipo, data: { id } }),
  });
}

const assinatura = (id: string, segredo: string) => {
  const v1 = createHmac("sha256", segredo).update(`id:${id};request-id:req-1;ts:1700000000;`).digest("hex");
  return { "x-signature": `ts=1700000000,v1=${v1}`, "x-request-id": "req-1" };
};

beforeEach(() => {
  delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  estado.processar = vi.fn<Processar>(async () => ({ situacao: "aprovado" }));
});

describe("webhook do Mercado Pago", () => {
  it("processa aviso de pagamento", async () => {
    const r = await POST(aviso());
    expect(r.status).toBe(200);
    expect(estado.processar).toHaveBeenCalledWith("42");
  });

  it("outros tipos de aviso são aceitos sem processar", async () => {
    expect((await POST(aviso({ tipo: "merchant_order" }))).status).toBe(200);
    expect(estado.processar).not.toHaveBeenCalled();
  });

  it("id que não é número é recusado", async () => {
    expect((await POST(aviso({ id: "abc" }))).status).toBe(400);
    expect(estado.processar).not.toHaveBeenCalled();
  });

  it("com segredo configurado, exige assinatura válida", async () => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = "segredo";
    expect((await POST(aviso())).status).toBe(401);
    expect((await POST(aviso({ headers: assinatura("42", "outro") }))).status).toBe(401);
    expect(estado.processar).not.toHaveBeenCalled();

    expect((await POST(aviso({ headers: assinatura("42", "segredo") }))).status).toBe(200);
    expect(estado.processar).toHaveBeenCalledOnce();
  });

  it("falha ao processar responde 500, para o Mercado Pago reenviar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    estado.processar.mockRejectedValue(new Error("rede"));
    expect((await POST(aviso())).status).toBe(500);
  });
});
