import { z } from "zod";

// Regras da triagem: classificação de perfil e cálculo da idade gestacional.
// Funções puras, usadas no navegador (resultado) e no servidor (gravação).

export const MOMENTOS = ["tentando", "suspeita", "gravida", "nasceu", "perda"] as const;
export type Momento = (typeof MOMENTOS)[number];

export type Perfil = "tentante" | "suspeita" | "gestante" | "puerpera" | "acolhimento";

const TESTES = ["positivo", "negativo", "nao_fez"] as const;
type Momentos = { momento: Momento; teste?: (typeof TESTES)[number] };

export const respostasSchema = z
  .object({
    momento: z.enum(MOMENTOS),
    teste: z.enum(TESTES).optional(),
    fonteData: z.enum(["dum", "dpp", "semanas"]).optional(),
    data: z.iso.date().optional(),
    semanas: z.number().int().min(1).max(42).optional(),
    multipla: z.boolean().optional(),
    preNatal: z.enum(["sus", "particular", "nao_iniciou"]).optional(),
    jaMae: z.boolean(),
    partoAnterior: z.enum(["normal", "cesarea", "ambos"]).optional(),
    perdaAnterior: z.enum(["sim", "nao", "prefiro_nao_dizer"]).optional(),
    altoRisco: z.enum(["sim", "nao", "nao_sei"]).optional(),
    acompanhante: z.enum(["parceiro", "familia", "ninguem"]).optional(),
    nome: z.string().trim().max(60).optional(),
  })
  .refine((r) => !ehGestante(r) || r.fonteData !== undefined, {
    message: "Informe a data ou as semanas da gestação.",
    path: ["fonteData"],
  });

export type Respostas = z.infer<typeof respostasSchema>;

function ehGestante(r: Momentos): boolean {
  return r.momento === "gravida" || (r.momento === "suspeita" && r.teste === "positivo");
}

export function classificarPerfil(r: Momentos): Perfil {
  if (ehGestante(r)) return "gestante";
  switch (r.momento) {
    case "tentando":
      return "tentante";
    case "suspeita":
      return "suspeita";
    case "nasceu":
      return "puerpera";
    default:
      return "acolhimento";
  }
}

const DIA_MS = 24 * 60 * 60 * 1000;

// Datas como "AAAA-MM-DD" em UTC para não sofrer com fuso horário.
function paraUtc(iso: string) {
  return Date.parse(iso + "T00:00:00Z");
}

function paraIso(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

// Tudo é convertido para a data da última menstruação (DUM): a idade
// gestacional é sempre recalculada a partir dela, nunca salva fixa.
export function calcularDum(
  r: Partial<Pick<Respostas, "fonteData" | "data" | "semanas">>,
  hoje: string,
): string | null {
  if (r.fonteData === "dum" && r.data) return r.data;
  if (r.fonteData === "dpp" && r.data) return paraIso(paraUtc(r.data) - 280 * DIA_MS);
  if (r.fonteData === "semanas" && r.semanas) return paraIso(paraUtc(hoje) - r.semanas * 7 * DIA_MS);
  return null;
}

export function idadeGestacional(dum: string, hoje: string) {
  const dias = Math.floor((paraUtc(hoje) - paraUtc(dum)) / DIA_MS);
  return { semanas: Math.floor(dias / 7), dias: dias % 7 };
}

export function trimestre(semanas: number): 1 | 2 | 3 {
  if (semanas <= 13) return 1;
  if (semanas <= 27) return 2;
  return 3;
}

export function dataProvavelDoParto(dum: string) {
  return paraIso(paraUtc(dum) + 280 * DIA_MS);
}

// Uma DUM é plausível se der entre 1 e 42 semanas de gestação hoje.
export function dumPlausivel(dum: string, hoje: string) {
  const { semanas } = idadeGestacional(dum, hoje);
  return semanas >= 1 && semanas <= 42;
}

// Mantém só as respostas que valem para o caminho final da triagem. Quem volta
// e troca de resposta (ex.: de "grávida" para "tentando") não deve levar junto
// a data da gestação: a LGPD pede guardar só o necessário.
export function limparRespostas(r: Respostas): Respostas {
  const gestante = ehGestante(r);
  const limpas: Respostas = {
    momento: r.momento,
    jaMae: r.jaMae,
    teste: r.momento === "suspeita" ? r.teste : undefined,
    fonteData: gestante ? r.fonteData : undefined,
    data: gestante && r.fonteData !== "semanas" ? r.data : undefined,
    semanas: gestante && r.fonteData === "semanas" ? r.semanas : undefined,
    multipla: gestante ? r.multipla : undefined,
    preNatal: gestante ? r.preNatal : undefined,
    partoAnterior: r.jaMae ? r.partoAnterior : undefined,
    perdaAnterior: r.momento === "perda" ? undefined : r.perdaAnterior,
    altoRisco: r.altoRisco,
    acompanhante: r.acompanhante,
    nome: r.nome,
  };
  return Object.fromEntries(Object.entries(limpas).filter(([, v]) => v !== undefined)) as Respostas;
}

export function modificadores(r: Respostas) {
  return {
    primeiraGestacao: !r.jaMae,
    cesareaAnterior: r.partoAnterior === "cesarea" || r.partoAnterior === "ambos",
    perdaAnterior: r.perdaAnterior === "sim" || r.momento === "perda",
    altoRisco: r.altoRisco === "sim",
    multipla: r.multipla === true,
  };
}

export const PERFIS: Record<Perfil, { titulo: string; descricao: string; preparado: string[] }> = {
  tentante: {
    titulo: "Tentante",
    descricao: "Você está planejando engravidar. Vamos ajudar a se preparar com saúde.",
    preparado: [
      "Calendário do ciclo com período fértil estimado",
      "Trilha pré-concepcional: ácido fólico, vacinas e exames",
      "Lembretes da consulta pré-concepcional",
    ],
  },
  suspeita: {
    titulo: "Suspeita de gravidez",
    descricao: "Ainda não há confirmação. Vamos te guiar com calma até a resposta.",
    preparado: [
      "Quando fazer o teste para um resultado confiável",
      "Onde fazer o teste de graça (UBS)",
      "O que fazer se der positivo ou negativo",
    ],
  },
  gestante: {
    titulo: "Gestante",
    descricao: "Parabéns! Vamos acompanhar sua gestação semana a semana.",
    preparado: [
      "O que acontece com você e o bebê a cada semana",
      "Agenda do pré-natal com lembretes",
      "Sinais de alerta sempre à mão",
    ],
  },
  puerpera: {
    titulo: "Pós-parto",
    descricao: "Seu bebê chegou. Agora o cuidado é com vocês dois.",
    preparado: [
      "Recuperação do parto e amamentação",
      "Saúde mental no pós-parto",
      "Consultas e vacinas do bebê",
    ],
  },
  acolhimento: {
    titulo: "Acolhimento",
    descricao: "Sentimos muito pela sua perda. Aqui você encontra apoio, no seu tempo.",
    preparado: [
      "Conteúdo sobre o luto gestacional",
      "Cuidados com o corpo após a perda",
      "Onde buscar apoio emocional",
    ],
  },
};
