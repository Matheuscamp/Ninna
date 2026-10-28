import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando, Pagina, Voltar } from "@/components/ui";
import { exigirUsuariaPronta, getFicha, linkDaFoto } from "@/lib/dal";
import { formatarTelefone } from "@/lib/ficha";
import { EditorFoto } from "./foto";
import { FormFicha } from "./form";

export const metadata: Metadata = { title: "Dados pessoais e de saúde" };

async function Edicao() {
  const { usuaria, perfil } = await exigirUsuariaPronta();
  const ficha = await getFicha(usuaria.id);

  // Sem a migração da ficha, os campos ainda não existem no banco.
  if (!ficha) {
    return (
      <p className="rounded-3xl bg-white/90 shadow-suave p-5 text-[15px] leading-relaxed text-suave">
        Esta área ainda está sendo preparada. Tente de novo em instantes.
      </p>
    );
  }

  const nome = perfil.nome ?? "";
  return (
    <>
      <EditorFoto urlInicial={await linkDaFoto(ficha.foto_caminho)} nome={nome || usuaria.email || "?"} />
      <FormFicha
        iniciais={{
          nome,
          dataNascimento: ficha.data_nascimento ?? "",
          tipoSanguineo: ficha.tipo_sanguineo ?? "",
          peso: ficha.peso_kg !== null ? String(ficha.peso_kg).replace(".", ",") : "",
          altura: ficha.altura_cm !== null ? String(ficha.altura_cm) : "",
          alergias: ficha.alergias ?? "",
          medicamentos: ficha.medicamentos ?? "",
          emergenciaNome: ficha.emergencia_nome ?? "",
          emergenciaParentesco: ficha.emergencia_parentesco ?? "",
          emergenciaTelefone: ficha.emergencia_telefone ? formatarTelefone(ficha.emergencia_telefone) : "",
        }}
      />
    </>
  );
}

export default function EditarFichaPage() {
  return (
    <Pagina>
      <Voltar href="/app/perfil" rotulo="Perfil" />
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">Dados pessoais e de saúde</h1>
      <Suspense fallback={<Carregando />}>
        <Edicao />
      </Suspense>
    </Pagina>
  );
}
