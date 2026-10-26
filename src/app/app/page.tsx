import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { sair } from "@/app/(auth)/actions";
import { AvisoMedico, Logo, Pagina } from "@/components/ui";
import { exigirUsuariaPronta } from "@/lib/dal";
import { dataProvavelDoParto, idadeGestacional, PERFIS, trimestre } from "@/lib/triagem";

export const metadata: Metadata = { title: "Início" };

async function Inicio() {
  const { perfil } = await exigirUsuariaPronta();
  const info = PERFIS[perfil.perfil];
  const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const ig = perfil.perfil === "gestante" && perfil.dum ? idadeGestacional(perfil.dum, hoje) : null;

  return (
    <>
      <h1 className="text-2xl font-bold">Olá{perfil.nome ? `, ${perfil.nome}` : ""}!</h1>
      <section className="flex flex-col gap-1.5 rounded-3xl bg-azul-100 p-6 text-azul-900">
        <span className="text-sm font-semibold text-azul-700">
          {ig ? `${trimestre(ig.semanas)}º trimestre` : info.titulo}
        </span>
        <span className="text-3xl font-bold leading-tight">
          {ig ? `Semana ${ig.semanas}${ig.dias ? ` e ${ig.dias} dia${ig.dias > 1 ? "s" : ""}` : ""}` : info.titulo}
        </span>
        <span className="text-[15px] leading-relaxed">
          {ig && perfil.dum
            ? `Data provável do parto: ${new Date(dataProvavelDoParto(perfil.dum) + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}.`
            : info.descricao}
        </span>
      </section>
      <section className="flex flex-col gap-3 rounded-3xl bg-white p-5">
        <h2 className="font-bold">Preparado para você</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] text-suave">
          {info.preparado.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm text-suave">Agenda, guias e conteúdo chegam nas próximas etapas do MVP.</p>
      </section>
      <Link href="/triagem" className="text-center font-semibold text-rosa-600 underline">
        Refazer a triagem
      </Link>
    </>
  );
}

export default function AppPage() {
  return (
    <Pagina>
      <header className="flex items-center justify-between">
        <Logo tamanho={40} />
        <form action={sair}>
          <button type="submit" className="h-11 rounded-xl px-3 text-sm font-semibold text-suave hover:bg-white">
            Sair
          </button>
        </form>
      </header>
      <Suspense fallback={<p className="text-suave">Carregando…</p>}>
        <Inicio />
      </Suspense>
      <AvisoMedico />
    </Pagina>
  );
}
