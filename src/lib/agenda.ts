import { z } from "zod";

// Plano gratuito: até 3 consultas futuras ao mesmo tempo (o Premium chega na etapa de assinatura).
export const LIMITE_GRATUITO = 3;

export const consultaSchema = z.object({
  titulo: z.string().trim().min(1, { error: "Dê um nome à consulta ou exame." }).max(80),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Escolha a data." }),
  hora: z.string().regex(/^\d{2}:\d{2}$/, { error: "Escolha o horário." }),
  local: z.string().trim().max(80).optional(),
  observacoes: z.string().trim().max(300).optional(),
});

export type NovaConsulta = z.infer<typeof consultaSchema>;

type ConsultaBasica = { data_hora: string; concluida_em: string | null };

// Uma consulta só vira "concluída" quando a usuária marca. Se a data passou e
// ela não marcou, fica em "para confirmar" (perguntamos se ela foi).
export function separarConsultas<T extends ConsultaBasica>(consultas: T[], agora: Date) {
  const futura = (c: T) => new Date(c.data_hora) >= agora;
  return {
    proximas: consultas.filter((c) => !c.concluida_em && futura(c)),
    paraConfirmar: consultas.filter((c) => !c.concluida_em && !futura(c)).reverse(),
    concluidas: consultas.filter((c) => c.concluida_em).reverse(),
  };
}
