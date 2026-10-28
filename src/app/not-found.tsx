import Link from "next/link";
import { TelaAvulsa } from "@/components/acolhida";

export default function NaoEncontrada() {
  return (
    <TelaAvulsa ilustracao="lupa" fundo="bg-azul-100">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">Página não encontrada</h1>
      <p className="leading-relaxed text-suave">O endereço pode ter mudado ou estar digitado errado.</p>
      <Link href="/" className="flex h-13 items-center justify-center rounded-2xl bg-rosa-600 text-[17px] font-semibold text-white shadow-rosa hover:bg-rosa-700">
        Voltar ao início
      </Link>
    </TelaAvulsa>
  );
}
