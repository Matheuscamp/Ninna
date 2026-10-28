import type { Metadata } from "next";
import { Pagina, Voltar } from "@/components/ui";
import { FormExcluir } from "./form";

export const metadata: Metadata = { title: "Excluir conta" };

export default function ExcluirPage() {
  return (
    <Pagina>
      <Voltar href="/app/perfil" rotulo="Perfil" />
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">Excluir conta e dados</h1>
      <div className="flex flex-col gap-2 rounded-3xl bg-white/90 shadow-suave p-5 text-[15px] leading-relaxed">
        <p>Isso apaga de vez sua conta e tudo o que o Ninna guarda sobre você:</p>
        <ul className="list-disc pl-5 text-suave">
          <li>perfil, foto, ficha de saúde e respostas da triagem</li>
          <li>consultas da agenda e tarefas marcadas</li>
          <li>documentos de saúde enviados (arquivos e informações)</li>
          <li>registros de consentimento</li>
        </ul>
        <p>Não dá para desfazer. Se quiser guardar uma cópia, exporte seus dados antes, pelo Perfil.</p>
      </div>
      <FormExcluir />
    </Pagina>
  );
}
