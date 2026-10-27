import Link from "next/link";
import { Logo, Pagina } from "@/components/ui";

export default function NaoEncontrada() {
  return (
    <Pagina>
      <Logo tamanho={56} />
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="leading-relaxed text-suave">O endereço pode ter mudado ou estar digitado errado.</p>
      <Link
        href="/"
        className="flex h-13 items-center justify-center rounded-2xl bg-rosa-600 text-[17px] font-semibold text-white hover:bg-rosa-700"
      >
        Voltar ao início
      </Link>
    </Pagina>
  );
}
