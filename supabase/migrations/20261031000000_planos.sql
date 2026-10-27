-- Ninna: plano da usuária (gratuito ou premium) e limite de documentos.
--
-- O plano NÃO fica em profiles: a usuária pode editar o próprio perfil e poderia
-- se marcar como premium. Aqui ela só lê; quem altera é o servidor (com a chave
-- secreta), a partir do pagamento confirmado na etapa de assinatura.

create table public.assinaturas (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plano text not null default 'gratuito' check (plano in ('gratuito', 'premium')),
  -- Fim do período pago; vazio = sem prazo.
  valido_ate timestamptz,
  atualizado_em timestamptz not null default now()
);

alter table public.assinaturas enable row level security;

create policy "assinatura: ler a própria" on public.assinaturas
  for select to authenticated using ((select auth.uid()) = user_id);
-- Sem regras de insert/update/delete para usuárias: só o servidor altera.

-- Plano em vigor: premium só enquanto válido; sem registro = gratuito.
create function public.plano_atual(uid uuid)
returns text
language sql
stable
security definer set search_path = ''
as $$
  select coalesce(
    (select a.plano from public.assinaturas a
      where a.user_id = uid and (a.valido_ate is null or a.valido_ate > now())),
    'gratuito'
  );
$$;

-- Limite de 10 documentos no plano gratuito, garantido pelo próprio banco
-- (vale mesmo para quem tentar gravar direto pela API, sem passar pelo app).
create function public.limitar_documentos()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if public.plano_atual(new.user_id) = 'gratuito'
     and (select count(*) from public.health_documents where user_id = new.user_id) >= 10 then
    raise exception 'limite_documentos' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger limitar_documentos
  before insert on public.health_documents
  for each row execute function public.limitar_documentos();
