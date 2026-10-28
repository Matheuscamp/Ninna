"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { codigoDoConvite, COOKIE_CONVITE, destinoSeguro, DIAS_CONVITE, resumoDoConvite } from "@/lib/convite";

export type EstadoConvite = { erro?: string } | undefined;

// Confere o código do teste fechado e libera o site neste navegador.
export async function entrarComConvite(_estado: EstadoConvite, formData: FormData): Promise<EstadoConvite> {
  const codigo = codigoDoConvite();
  const destino = destinoSeguro(formData.get("next"));
  if (!codigo) redirect(destino);

  const digitado = String(formData.get("codigo") ?? "");
  const [esperado, recebido] = await Promise.all([resumoDoConvite(codigo), resumoDoConvite(digitado)]);
  if (recebido !== esperado) return { erro: "Código não confere. Confira com quem te convidou." };

  (await cookies()).set(COOKIE_CONVITE, esperado, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_CONVITE * 24 * 60 * 60,
  });
  redirect(destino);
}
