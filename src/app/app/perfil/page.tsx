import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { sair } from "@/app/(auth)/actions";
import { AvisoMedico, Carregando, Pagina } from "@/components/ui";
import { exigirUsuariaPronta } from "@/lib/dal";
import { formatarDataLonga } from "@/lib/datas";
import { dataProvavelDoParto, PERFIS, trimestre } from "@/lib/triagem";

export const metadata: Metadata = { title: "Perfil" };

const PRE_NATAL: Record<string, string> = { sus: "SUS (UBS)", particular: "Particular ou convênio", nao_iniciou: "Ainda não iniciado" };

async function Dados() {
  const { usuaria, perfil, semanas } = await exigirUsuariaPronta();
  const detalhes = [
    semanas !== null && perfil.dum ? `${semanas} semanas · ${trimestre(semanas)}º trimestre` : null,
    perfil.dum && semanas !== null ? `Parto previsto: ${formatarDataLonga(dataProvavelDoParto(perfil.dum))}` : null,
    perfil.primeira_gestacao === true ? "Primeiro filho" : perfil.primeira_gestacao === false ? "Já é mãe" : null,
    perfil.pre_natal ? `Pré-natal: ${PRE_NATAL[perfil.pre_natal]}` : null,
  ].filter(Boolean);

  return (
    <>
      <section className="flex flex-col gap-1.5 rounded-3xl bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-suave">Seu momento</h2>
        <p className="text-xl font-bold">{PERFIS[perfil.perfil].titulo}</p>
        {detalhes.map((d) => (
          <p key={d} className="text-[15px] text-suave">
            {d}
          </p>
        ))}
        <Link href="/triagem" className="mt-2 self-start rounded-xl bg-rosa-50 px-4 py-2.5 text-[15px] font-semibold text-rosa-600">
          Refazer a triagem
        </Link>
      </section>
      <section className="flex flex-col gap-1.5 rounded-3xl bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-suave">Conta</h2>
        <p className="font-semibold">{perfil.nome ?? "Sem nome"}</p>
        <p className="text-[15px] text-suave">{usuaria.email}</p>
        <p className="text-[15px] text-suave">Plano gratuito · Premium em breve</p>
      </section>
    </>
  );
}

export default function PerfilPage() {
  return (
    <Pagina>
      <h1 className="text-[26px] font-bold">Perfil</h1>
      <Suspense fallback={<Carregando />}>
        <Dados />
      </Suspense>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Seus dados</h2>
        {/* Link comum (não <Link>): a rota devolve um arquivo para baixar. */}
        <a href="/app/perfil/exportar" className="flex h-12 items-center justify-center rounded-2xl border-2 border-linha bg-white font-semibold">
          Exportar meus dados
        </a>
        <Link href="/app/perfil/excluir" className="flex h-12 items-center justify-center rounded-2xl font-semibold text-alerta">
          Excluir conta e dados
        </Link>
      </section>

      <form action={sair}>
        <button type="submit" className="h-12 w-full rounded-2xl bg-white font-semibold text-suave hover:text-tinta">
          Sair
        </button>
      </form>
      <AvisoMedico />
    </Pagina>
  );
}
