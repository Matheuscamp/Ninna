import Link from "next/link";

// Linha discreta com o uso do plano (agenda, documentos).
// Limites pequenos viram marcadores; limites maiores, uma barra. No Premium: "ilimitado".
export function UsoDoPlano({ usados, limite, rotulo }: { usados: number; limite: number | null; rotulo: string }) {
  if (limite === null) {
    return <p className="-mt-3 text-[13px] text-suave">Plano Premium · {rotulo} ilimitados</p>;
  }

  const cheio = usados >= limite;
  return (
    <div className="-mt-3 flex items-center gap-2 text-[13px] text-suave">
      {limite <= 5 ? (
        <span className="flex gap-1" aria-hidden="true">
          {Array.from({ length: limite }, (_, i) => (
            <span key={i} className={`h-1.5 w-4 rounded-full ${i < usados ? "bg-rosa-600" : "bg-linha"}`} />
          ))}
        </span>
      ) : (
        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-linha" aria-hidden="true">
          <span className="block h-full rounded-full bg-rosa-600" style={{ width: `${Math.min(100, (usados / limite) * 100)}%` }} />
        </span>
      )}
      <p className={cheio ? "font-semibold text-rosa-700" : ""}>
        {cheio
          ? `Limite de ${limite} ${rotulo} do plano gratuito atingido`
          : `${usados} de ${limite} ${rotulo} no plano gratuito`}
        {cheio && (
          <>
            {" · "}
            <Link href="/app/premium" className="underline underline-offset-2 hover:text-rosa-600">
              Conhecer o Premium
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
