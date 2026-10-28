import { Suspense, type ReactNode } from "react";
import { Abas, BarraDeAbas } from "@/components/abas";
import { FundoSuave } from "@/components/acolhida";

// O layout não lê a sessão: cada página faz isso dentro do próprio <Suspense>,
// para a barra de abas aparecer na hora (Cache Components).
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <FundoSuave>
      <div className="flex flex-1 flex-col pb-[84px] print:pb-0">{children}</div>
      <Suspense fallback={<BarraDeAbas pathname="" />}>
        <Abas />
      </Suspense>
    </FundoSuave>
  );
}
