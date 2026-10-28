import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FundoSuave } from "@/components/acolhida";

export const metadata: Metadata = { title: "Salvando sua triagem" };

export default function ConcluirLayout({ children }: { children: ReactNode }) {
  return <FundoSuave>{children}</FundoSuave>;
}
