// Marca que esta sessão acabou de vir de um link de recuperação de senha: só com ela
// a tela /nova-senha aceita trocar a senha sem pedir a atual. O valor é o id da conta,
// para a marca não servir a outra conta aberta depois no mesmo navegador.
export const COOKIE_RECUPERACAO = "ninna-recuperacao";

export const OPCOES_COOKIE_RECUPERACAO = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 30 * 60, // 30 minutos para concluir a troca
} as const;
