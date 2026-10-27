// Foto de perfil (link temporário do bucket privado) ou a inicial do nome.
export function Avatar({ url, nome, tamanho = "size-13", texto = "text-xl" }: { url: string | null; nome: string; tamanho?: string; texto?: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- link assinado temporário do Storage privado
      <img src={url} alt="" className={`${tamanho} shrink-0 rounded-full object-cover`} />
    );
  }
  return (
    <span aria-hidden="true" className={`flex ${tamanho} shrink-0 items-center justify-center rounded-full bg-rosa-100 font-bold text-rosa-700 ${texto}`}>
      {nome.charAt(0).toUpperCase() || "?"}
    </span>
  );
}
