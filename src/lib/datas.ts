// O Ninna atende o Brasil: datas e horários são sempre mostrados no fuso de São Paulo.
// O Brasil não tem horário de verão desde 2019, então o fuso é fixo em -03:00.
export const FUSO = "America/Sao_Paulo";
const DESLOCAMENTO_MS = 3 * 60 * 60 * 1000;

export function hojeEmSaoPaulo() {
  return new Date().toLocaleDateString("en-CA", { timeZone: FUSO });
}

// "terça-feira, 27 de outubro"
export function formatarHoje(agora: Date) {
  return agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: FUSO });
}

export function formatarDataLonga(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function formatarDataHora(instante: string | Date) {
  const data = new Date(instante);
  const dia = data.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: FUSO });
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: FUSO });
  return `${dia.replace(".", "")} · ${hora}`;
}

// Data ("2026-11-09") e horário ("09:00") digitados em São Paulo → instante ISO.
export function localParaIso(data: string, hora: string) {
  return new Date(`${data}T${hora}:00-03:00`).toISOString();
}

// Caminho inverso, para preencher o formulário de edição.
export function isoParaLocal(instante: string) {
  const local = new Date(new Date(instante).getTime() - DESLOCAMENTO_MS).toISOString();
  return { data: local.slice(0, 10), hora: local.slice(11, 16) };
}

// "hoje", "amanhã", "em 5 dias", contando dias de calendário em São Paulo.
export function quantoFalta(instante: string, agora: Date) {
  const diaSP = (d: Date) => Date.parse(d.toLocaleDateString("en-CA", { timeZone: FUSO }) + "T00:00:00Z");
  const dias = Math.round((diaSP(new Date(instante)) - diaSP(agora)) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "amanhã";
  return `em ${dias} dias`;
}

// Pedaços da data para o bloco de calendário dos cartões da agenda.
export function partesDaData(instante: string) {
  const d = new Date(instante);
  const parte = (opcoes: Intl.DateTimeFormatOptions) => d.toLocaleDateString("pt-BR", { ...opcoes, timeZone: FUSO }).replace(".", "");
  return {
    diaSemana: parte({ weekday: "short" }),
    dia: parte({ day: "numeric" }),
    mes: parte({ month: "short" }),
    mesAno: parte({ month: "long", year: "numeric" }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: FUSO }),
  };
}
