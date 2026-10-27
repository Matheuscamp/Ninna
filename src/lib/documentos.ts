import { z } from "zod";

// Regras da Central de Documentos, usadas no navegador (validação imediata)
// e no servidor (validação que vale de verdade).

export const CATEGORIAS = [
  { id: "exames_laboratoriais", rotulo: "Exames laboratoriais", cor: "bg-azul-100 text-azul-900" },
  { id: "exames_imagem", rotulo: "Exames de imagem", cor: "bg-[#e3ecfb] text-[#24407a]" },
  { id: "vacinas", rotulo: "Vacinas e vacinação", cor: "bg-[#e3f4ea] text-[#1f5a36]" },
  { id: "consultas", rotulo: "Consultas médicas", cor: "bg-rosa-50 text-rosa-700" },
  { id: "receitas", rotulo: "Receitas e prescrições", cor: "bg-[#fdf0dc] text-[#7a4a0c]" },
  { id: "outros", rotulo: "Outros documentos", cor: "bg-azul-50 text-suave" },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["id"];
const IDS_CATEGORIAS = CATEGORIAS.map((c) => c.id) as [Categoria, ...Categoria[]];

export function categoria(id: string) {
  return CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1];
}

export const TIPOS_ACEITOS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

export type TipoAceito = keyof typeof TIPOS_ACEITOS;
export const ACCEPT_INPUT = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";
export const TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB (o mesmo limite do bucket)
export const MAX_ARQUIVOS_POR_ENVIO = 10;

export function tipoAceito(tipo: string): tipo is TipoAceito {
  return tipo in TIPOS_ACEITOS;
}

export function validarArquivo(arquivo: { name: string; type: string; size: number }): string | null {
  if (!tipoAceito(arquivo.type)) return "Formato não aceito. Envie JPG, PNG, WEBP ou PDF.";
  if (arquivo.size === 0) return "O arquivo está vazio.";
  if (arquivo.size > TAMANHO_MAXIMO) return "O arquivo passa de 10 MB.";
  return null;
}

// Reconhece o tipo real pelos primeiros bytes ("assinatura" do arquivo), para
// um arquivo com extensão trocada não passar como imagem ou PDF.
export function tipoPelosBytes(b: Uint8Array): TipoAceito | null {
  const comeca = (...bytes: number[]) => bytes.every((v, i) => b[i] === v);
  if (comeca(0x25, 0x50, 0x44, 0x46)) return "application/pdf"; // %PDF
  if (comeca(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (comeca(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  // RIFF....WEBP
  if (comeca(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

export function nomeSemExtensao(nomeArquivo: string) {
  return nomeArquivo.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 120) || "Documento";
}

export function formatarTamanho(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

export const metadadosSchema = z.object({
  nome: z.string().trim().min(1, { error: "Dê um nome ao documento." }).max(120),
  categoria: z.enum(IDS_CATEGORIAS, { error: "Escolha uma categoria." }),
  descricao: textoOpcional(500),
  dataDocumento: z
    .union([z.literal(""), z.iso.date({ error: "Data inválida." })])
    .optional()
    .transform((v) => v || undefined),
  profissional: textoOpcional(120),
});

export type Metadados = z.infer<typeof metadadosSchema>;

export const ORDENS = [
  { id: "recentes", rotulo: "Enviados por último" },
  { id: "antigos", rotulo: "Enviados primeiro" },
  { id: "data_documento", rotulo: "Data do documento" },
  { id: "nome", rotulo: "Nome (A–Z)" },
] as const;

export type Ordem = (typeof ORDENS)[number]["id"];

export type Filtros = { q?: string; categoria?: Categoria; de?: string; ate?: string; ordem: Ordem };

const dataValida = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

// Lê os filtros da URL, descartando valores inválidos.
export function lerFiltros(params: Record<string, string | string[] | undefined>): Filtros {
  const texto = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 80) : "");
  const q = texto(params.q);
  const cat = texto(params.categoria);
  const ordem = texto(params.ordem);
  return {
    q: q || undefined,
    categoria: IDS_CATEGORIAS.includes(cat as Categoria) ? (cat as Categoria) : undefined,
    de: dataValida(params.de),
    ate: dataValida(params.ate),
    ordem: ORDENS.some((o) => o.id === ordem) ? (ordem as Ordem) : "recentes",
  };
}

export function temFiltros(f: Filtros) {
  return Boolean(f.q || f.categoria || f.de || f.ate);
}

// % e _ são curingas no ILIKE: escapa para buscar o texto literal.
export function escaparBusca(texto: string) {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`);
}
