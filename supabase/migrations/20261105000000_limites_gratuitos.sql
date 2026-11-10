-- Ninna: limites do plano gratuito garantidos pelo próprio banco.
-- O app já confere os limites, mas quem grava direto pela API (a chave pública é
-- pública) passava por fora. Os números seguem LIMITES_GRATUITOS em src/lib/planos.ts:
-- ao mudar um, mude o outro.

-- 1. Até 3 consultas futuras e não concluídas no plano gratuito.
-- Vale para criar, mudar a data e desmarcar uma consulta concluída. Editar uma
-- consulta que já contava (ex.: só o título) não é barrado, para quem tinha
-- consultas a mais quando o Premium venceu continuar podendo editá-las.
create function public.limitar_consultas()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_total int;
begin
  if new.concluida_em is not null or new.data_hora <= now() then
    return new; -- não conta como consulta futura
  end if;
  if tg_op = 'UPDATE' and old.concluida_em is null and old.data_hora > now() then
    return new; -- já contava antes
  end if;
  if public.plano_atual(new.user_id) = 'premium' then
    return new;
  end if;

  -- A trava evita que gravações simultâneas passem do limite.
  perform pg_advisory_xact_lock(hashtextextended('consultas:' || new.user_id::text, 0));
  select count(*) into v_total
    from public.appointments a
   where a.user_id = new.user_id
     and a.id <> new.id
     and a.concluida_em is null
     and a.data_hora > now();
  if v_total >= 3 then
    raise exception 'limite_consultas' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger limitar_consultas
  before insert or update of data_hora, concluida_em on public.appointments
  for each row execute function public.limitar_consultas();

-- 2. Documentos: a mesma regra de antes (10 no gratuito), agora com trava, para
-- envios simultâneos não passarem do limite.
create or replace function public.limitar_documentos()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if public.plano_atual(new.user_id) = 'premium' then
    return new;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('documentos:' || new.user_id::text, 0));
  if (select count(*) from public.health_documents where user_id = new.user_id) >= 10 then
    raise exception 'limite_documentos' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- São só gatilhos: nada aqui é para a API.
revoke execute on function public.limitar_consultas() from public, anon, authenticated;
revoke execute on function public.limitar_documentos() from public, anon, authenticated;
