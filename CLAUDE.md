@AGENTS.md

# Ninna — orientações para quem for trabalhar no projeto

Assistente de gestação. O README descreve o que existe (rotas, migrações, planos, segurança). Aqui ficam os cuidados que não são óbvios no código.

## Antes de mexer
- Next.js 16 com `cacheComponents`: toda leitura de sessão/cookies fica dentro de `<Suspense>`. Leia o guia em `node_modules/next/dist/docs/` antes de usar uma API do Next.
- Toda página logada usa `exigirUsuariaPronta()` de `src/lib/dal.ts`, o único ponto que lê sessão, consentimento e perfil.
- Migrações em `supabase/migrations/` são rodadas **à mão** pela dona do projeto no SQL Editor do Supabase. Ao criar uma, avise e espere ela rodar; o app deve tolerar a migração ainda não aplicada.
- Funções novas no Postgres ficam executáveis por qualquer um por padrão: use `revoke execute ... from public, anon, authenticated` em funções que não são para a API.
- O plano (gratuito/premium) fica na tabela `assinaturas`, que a usuária só lê. Nunca no `profiles`, que ela pode editar. Limites e preços em `src/lib/planos.ts`.
- Premium só é creditado por `processarPagamento` (`src/lib/mercadopago.ts`), a partir do pagamento lido da API do Mercado Pago, e pelas funções `creditar_pagamento`/`estornar_pagamento`, que só a chave secreta executa. Nunca confie em status ou valor vindos da URL ou do corpo do webhook. `createAdminClient` (chave secreta) é só para isso.

## Design system
Toda tela segue o mesmo padrão visual (o da página inicial, triagem e login). Antes de criar uma tela, reaproveite as peças abaixo em vez de inventar estilos.
- **Tokens** em `src/app/globals.css` (`@theme`): cores `rosa-*`, `azul-*`, `tinta`, `suave`, `linha`, `alerta`/`alerta-50`/`alerta-900`, pastéis dos cards `lilas`, `pessego`, `menta`, `baunilha`; sombras `shadow-suave` (cartões), `shadow-rosa` (botão principal), `shadow-flutuante` (destaques). Não use cores em hexadecimal soltas no código.
- **Fundo**: `FundoSuave` (`src/components/acolhida.tsx`), degradê rosa→azul com formas desfocadas. A área logada já tem ele no layout; telas públicas avulsas usam `TelaAvulsa`.
- **Cartão**: `rounded-3xl bg-white/90 shadow-suave` (itens menores: `rounded-2xl`). Destaque: `rounded-[2rem]` em degradê ou num pastel de `FUNDOS`, com ilustração no canto.
- **Título de página**: `TituloPagina` (`src/components/ui.tsx`), com ilustração numa bolha colorida, título de 28px e subtítulo.
- **Botões**: `BotaoPrimario` (rosa com `shadow-rosa`) e `BotaoSecundario` (branco com `shadow-suave`); botões e links de ação rápida também usam `rounded-2xl`.
- **Ilustrações e ícones**: só os SVG próprios de `src/components/ilustracoes.tsx` (`Ilustracao`, `Bolha`, `VISUAL_DO_PERFIL`) e os ícones de traço de `Icone`. Nada de imagens externas.
- **Logo**: `public/ninna-logo.svg` (vetor, use sempre ele). O favicon é `src/app/icon.svg` (a mesma cegonha, maior, para caber em 16px), com `favicon.ico` e `apple-icon.png` gerados a partir dele; ao mudar a logo, atualize os três.
- **Texto branco** só sobre `rosa-600` ou `alerta`. Pastéis sempre com texto escuro.
- Mobile primeiro: conferir em 375px e no computador (grades `sm:`/`lg:`).

## No ar (teste com convidados)
- Produção na Vercel: **https://ninna-six.vercel.app** (cada `git push` na `main` publica). Endereços com `matheuscamp` no nome são internos e pedem login da Vercel; o link para compartilhar é o acima.
- Variáveis na Vercel: as do `.env.local` + `NEXT_PUBLIC_SITE_URL`. Mercado Pago em **modo de teste** (vendedor = conta de teste; para pagar: cartão de teste do painel e e-mail terminado em `@testuser.com`, senão dá "uma das partes é de teste").
- A volta automática do checkout (`auto_return`) só funciona em https: no `localhost` o Mercado Pago recusa; lá use o botão "Verificar pagamento".
- `CODIGO_CONVITE` existe no código (`src/proxy.ts` manda para `/convite`; caminhos liberados em `src/lib/convite.ts`), mas a dona optou por **não** usá-lo: o site está aberto a quem tiver o link, e fora dos buscadores (`noindex` no layout e `robots.ts`).
- Login só por e-mail e senha (o Google foi removido; falta desligar o provedor no painel do Supabase).
- Passo a passo de publicação no README, "Colocar no ar".

## Armadilhas já encontradas
- O `fetch` do Next duplica respostas para cache: leitura parcial + cancelamento trava. Para buscas diretas use `fetchSupabase` (`src/lib/supabase/fetch.ts`), que também refaz conexões que travam (a rede local às vezes oscila).
- O servidor de desenvolvimento (Turbopack) às vezes mantém módulos antigos: se a tela não refletir o código, confira com `npx next build && npx next start -p 3001` e reinicie o `npm run dev`.
- Confirmação de e-mail está desligada no Supabase durante o desenvolvimento (o SMTP embutido tem limite por hora). Antes de lançar: SMTP próprio (Resend) e religar.

## Como testar
- `npm test` (vitest), `npm run typecheck`, `npm run lint`, `npm run build`.
- Fluxos com login são testados com o Supabase simulado em `src/test/supabase-falso.ts` (não criar contas reais nem digitar senhas).
- Pagamentos: nunca pagar de verdade nem digitar cartão; a API do Mercado Pago é simulada nos testes (`src/lib/mercadopago.test.ts`).
- Para conferir uma tela logada sem conta: página temporária de prévia que renderiza o componente visual com dados de exemplo; apague-a depois.

## Conteúdo de saúde e textos jurídicos
Textos em `src/content/` são uma primeira versão e precisam de revisão de obstetra ou enfermeira obstétrica antes do lançamento.
Termos de Uso (`/termos`) e Política de Privacidade (`/privacidade`) também são primeira versão, para revisão de advogado; os dados do responsável ficam em `src/content/juridico.ts`. Ao coletar um dado novo, usar um fornecedor novo ou mudar preço/regra do Premium, atualize esses textos e suba `VERSAO_CONSENTIMENTO`.

## Próximas etapas
- Coletar feedback dos convidados do teste.
- Ideias já conversadas e ainda não feitas: contador de movimentos do bebê (regra do protocolo: 6 movimentos em até 1 hora), diário de saúde (peso e pressão com gráfico), lembretes de consulta e de vencimento do Premium (dependem de e-mail próprio), PWA com modo offline.
- O que falta para lançar de verdade está na seção "Antes de lançar" do README (revisão profissional dos textos, dados do responsável, CNPJ e nota fiscal, SMTP próprio, Mercado Pago em produção, plano pago da Vercel).
