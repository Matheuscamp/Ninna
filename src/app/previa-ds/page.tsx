// TEMPORÁRIA: prévia do design system na área logada. Apagar depois.
import { FundoSuave } from "@/components/acolhida";
import { BarraDeAbas } from "@/components/abas";
import { Pagina, TituloPagina } from "@/components/ui";
import { CartaoPrincipal } from "../app/page";
import { GuiaSemana } from "../app/guias/semana/guia-semana";
import { PerfilVisual } from "../app/perfil/visual";
import { TarefasInicio } from "../app/tarefas-inicio";
import { FASES } from "@/content/guias";

const PERFIL = { nome: "Maria", perfil: "gestante" as const, dum: "2026-08-20", primeira_gestacao: true, cesarea_anterior: false, alto_risco: false, pre_natal: "sus" };

export default function Previa() {
  return (
    <FundoSuave>
      <div className="flex flex-1 flex-col pb-[84px]">
        <Pagina>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">Olá, Maria!</h1>
          <CartaoPrincipal perfil={PERFIL} semanas={9} />
          <CartaoPrincipal perfil={{ ...PERFIL, perfil: "puerpera" }} semanas={null} />
          <TarefasInicio tarefas={FASES[0].tarefas} feitasIniciais={["f1-habitos"]} />
        </Pagina>
        <Pagina larga>
          <TituloPagina titulo="Perfil" ilustracao="coracao" fundo="bg-rosa-100" />
          <PerfilVisual email="maria@exemplo.com" plano="premium" semanas={9} perfil={PERFIL} ficha={null} fotoUrl={null} hoje="2026-10-28" />
        </Pagina>
        <Pagina>
          <TituloPagina titulo="O que fazer nesta fase" ilustracao="prancheta" fundo="bg-azul-100" />
          <GuiaSemana semanaAtual={9} feitasIniciais={[]} />
        </Pagina>
      </div>
      <BarraDeAbas pathname="/app" />
    </FundoSuave>
  );
}
