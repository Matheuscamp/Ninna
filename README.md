# Ninna

Assistente de gestação: triagem por perfil (tentante, suspeita, gestante, pós-parto, acolhimento), orientação por fase e agenda do pré-natal. Web app em Next.js 16 + Supabase, pensado para virar PWA.

Já entregue: **login**, **consentimento LGPD**, **triagem** e o **painel** (Início, Agenda, Conteúdo, Perfil e guias interativos).

## Como rodar

1. Crie um projeto em [supabase.com](https://supabase.com), de preferência na região São Paulo.
2. No SQL Editor do Supabase, rode **em ordem** os arquivos de `supabase/migrations/`:
   - `20261026000000_inicial.sql`: perfil, consentimentos e triagem.
   - `20261027000000_painel.sql`: agenda, progresso dos guias e exclusão da conta.
   - `20261028000000_agenda_editar.sql` e `20261029000000_agenda_concluir.sql`: editar e concluir consultas.
   - `20261030000000_documentos.sql`: Central de Documentos (bucket privado no Storage + tabela).

   Todas as tabelas têm RLS ligado.
3. Copie `.env.example` para `.env.local` e preencha a URL e a publishable key do projeto.
4. Em Authentication › URL Configuration, adicione `http://localhost:3000/auth/callback` às Redirect URLs.
5. Instale e rode:

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

**Login com Google (opcional):** em Authentication › Providers › Google, cole o Client ID e o Secret criados no Google Cloud Console. Sem isso, o botão "Continuar com Google" volta para a tela de login com erro.

**Confirmação de e-mail:** se estiver ligada no Supabase (padrão), o cadastro mostra "Confira seu e-mail" e o link leva direto ao consentimento.

## Fluxo

```
/            landing
/triagem     perguntas ramificadas → resultado (não precisa de conta)
/cadastro    cria a conta (ou /entrar)
/consentimento   aceite de dados de saúde + termos (obrigatório, versionado)
/triagem/concluir  grava a triagem respondida antes do login
/app                 início adaptado ao perfil (exige login, consentimento e triagem)
/app/agenda          consultas e exames (até 3 futuras no plano gratuito)
/app/conteudo        artigos por perfil
/app/perfil          dados, refazer triagem, exportar e excluir conta
/app/guias/semana    tarefas e exames da fase (gestante)
/app/guias/parto     tipos de parto, prós e contras
/app/guias/sintomas  checador de sintomas e como confirmar (suspeita)
/app/alertas         sinais de alerta, sempre gratuitos
/app/documentos      central de documentos de saúde (enviar, buscar, filtrar, abrir, baixar, editar, excluir)
```

Antes do login, as respostas da triagem ficam só no `localStorage` do navegador (por até 24 horas, para sobreviver à aba nova aberta pelo link de confirmação). Elas vão ao servidor depois do consentimento e são apagadas do navegador em seguida.

## Estrutura

| Caminho | O que tem |
| --- | --- |
| `src/lib/triagem.ts` | Regras da triagem: perfil, idade gestacional, DPP, validação (zod) |
| `src/lib/dal.ts` | Único ponto que lê sessão, consentimento e perfil |
| `src/lib/supabase/` | Clientes do Supabase para servidor e proxy |
| `src/proxy.ts` | Renova a sessão e manda quem não está logada para `/entrar` |
| `src/app/(auth)/` | Entrar, cadastro, Google, sair |
| `src/app/consentimento/` | Tela e registro do consentimento |
| `src/app/triagem/` | Assistente da triagem e gravação |
| `src/content/` | Conteúdo dos guias e artigos (a revisar por profissional; depois vai para o CMS) |
| `src/app/app/` | Painel: Início, Agenda, Conteúdo, Perfil, guias e alertas |
| `src/lib/documentos.ts` | Regras da Central de Documentos: categorias, tipos, tamanho, assinatura dos arquivos, filtros |
| `supabase/migrations/` | Esquema do banco e regras RLS |

## Central de Documentos: segurança

- Arquivos num bucket **privado** do Supabase Storage, em `documentos/{id da usuária}/`. Regras RLS no Storage e na tabela: cada usuária só acessa a própria pasta.
- O navegador envia o arquivo por um link de envio de uso único gerado pelo servidor (com barra de progresso). Depois, o servidor confere tamanho, tipo e os primeiros bytes do arquivo; se não for imagem ou PDF de verdade, o arquivo é apagado.
- Abrir e baixar passam por `/app/documentos/[id]/arquivo`, que confere a dona e gera um link que expira em 60 segundos. Não existem links públicos permanentes.
- Excluir a conta apaga também os arquivos do Storage.

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm test           # testes das regras da triagem (vitest)
npm run typecheck  # checagem de tipos
npm run lint
npm run build
```

## Próximas etapas (backlog do MVP)

Lembretes por notificação (S4), assinatura com Mercado Pago (S5), PWA offline e lançamento (S6).
