import { z } from "zod";

// Regras da ficha pessoal e de saúde (tela e servidor usam as mesmas).

export const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type TipoSanguineo = (typeof TIPOS_SANGUINEOS)[number];

// Campo vazio no formulário = não informado.
function vazioComoAusente<T extends z.ZodType>(esquema: T) {
  return z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), esquema.optional());
}

const textoOpcional = (max: number, mensagem: string) => vazioComoAusente(z.string().trim().max(max, { error: mensagem }));

export function soDigitos(texto: string) {
  return texto.replace(/\D/g, "");
}

// (11) 98765-4321 / (11) 3456-7890
export function formatarTelefone(digitos: string) {
  const d = soDigitos(digitos);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}

export function idade(dataNascimento: string, hoje: string) {
  const [an, mn, dn] = dataNascimento.split("-").map(Number);
  const [ah, mh, dh] = hoje.split("-").map(Number);
  return ah - an - (mh < mn || (mh === mn && dh < dn) ? 1 : 0);
}

export function criarFichaSchema(hoje: string) {
  return z
    .object({
      nome: z.string().trim().min(1, { error: "Como podemos te chamar?" }).max(60, { error: "Use até 60 caracteres." }),
      dataNascimento: vazioComoAusente(
        z.iso
          .date({ error: "Data inválida." })
          .refine((d) => d.slice(0, 4) >= "1940" && idade(d, hoje) >= 10, { error: "Confira a data de nascimento." }),
      ),
      tipoSanguineo: vazioComoAusente(z.enum(TIPOS_SANGUINEOS, { error: "Escolha um tipo sanguíneo da lista." })),
      peso: vazioComoAusente(
        z
          .string()
          .transform((v) => Number(v.replace(",", ".")))
          .pipe(
            z
              .number({ error: "Informe o peso em kg, ex.: 68,5." })
              .min(30, { error: "Peso entre 30 e 250 kg." })
              .max(250, { error: "Peso entre 30 e 250 kg." })
              .transform((n) => Math.round(n * 10) / 10),
          ),
      ),
      altura: vazioComoAusente(
        z
          .string()
          .transform((v) => Number(v.replace(",", ".")))
          .pipe(
            z
              .number({ error: "Informe a altura em cm, ex.: 165." })
              .int({ error: "Informe a altura em centímetros, sem vírgula." })
              .min(100, { error: "Altura entre 100 e 230 cm." })
              .max(230, { error: "Altura entre 100 e 230 cm." }),
          ),
      ),
      alergias: textoOpcional(300, "Use até 300 caracteres."),
      medicamentos: textoOpcional(300, "Use até 300 caracteres."),
      emergenciaNome: textoOpcional(80, "Use até 80 caracteres."),
      emergenciaParentesco: textoOpcional(40, "Use até 40 caracteres."),
      emergenciaTelefone: vazioComoAusente(
        z
          .string()
          .transform(soDigitos)
          .pipe(z.string().regex(/^\d{10,11}$/, { error: "Telefone com DDD, ex.: (11) 98765-4321." })),
      ),
    })
    .superRefine((f, ctx) => {
      if (f.emergenciaTelefone && !f.emergenciaNome) {
        ctx.addIssue({ code: "custom", path: ["emergenciaNome"], message: "Quem é o contato de emergência?" });
      }
      if (f.emergenciaNome && !f.emergenciaTelefone) {
        ctx.addIssue({ code: "custom", path: ["emergenciaTelefone"], message: "Informe o telefone do contato." });
      }
    });
}

export type Ficha = z.infer<ReturnType<typeof criarFichaSchema>>;

export const TAMANHO_MAXIMO_FOTO = 900 * 1024; // depois de reduzida no navegador fica bem abaixo disso
