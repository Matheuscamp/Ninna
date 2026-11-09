import Link from "next/link";
import type { ReactNode } from "react";

// Parte visual: `sair` é o formulário que encerra a sessão.
export function CartaoConfirmarConta({ email, continuar, sair }: { email: string | undefined; continuar: string; sair: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-2xl bg-azul-50 p-4 text-[17px] font-bold [overflow-wrap:anywhere]">{email ?? "Conta sem e-mail"}</p>
      <p className="text-[15px] leading-relaxed text-suave">
        Se você não reconhece este e-mail, escolha a segunda opção e não digite nenhum dado seu: alguém pode ter te enviado um link da conta dessa
        pessoa.
      </p>
      <Link
        href={continuar}
        className="flex h-13 items-center justify-center rounded-2xl bg-rosa-600 text-[17px] font-semibold text-white shadow-rosa hover:bg-rosa-700"
      >
        É a minha conta, continuar
      </Link>
      {sair}
    </div>
  );
}
