import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Pagina } from "@/components/ui";

export const metadata: Metadata = { title: "Conta excluída" };

export default function ContaExcluidaPage() {
  return (
    <Pagina>
      <Logo tamanho={56} />
      <h1 className="text-3xl font-bold">Sua conta foi excluída</h1>
      <p className="leading-relaxed text-suave">
        Apagamos sua conta e todos os seus dados. Se quiser voltar algum dia, é só fazer a triagem de novo.
      </p>
      <Link href="/" className="flex h-13 items-center justify-center rounded-2xl bg-rosa-600 text-[17px] font-semibold text-white">
        Ir para o início
      </Link>
    </Pagina>
  );
}
