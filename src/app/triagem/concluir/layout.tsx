import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Salvando sua triagem" };

export default function ConcluirLayout({ children }: { children: ReactNode }) {
  return children;
}
