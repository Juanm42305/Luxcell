-- Funciones y disparadores. Las de SECURITY DEFINER fijan search_path vacío para evitar
-- que un objeto con el mismo nombre en otro esquema suplante lo que invocan.

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger brands_set_updated_at before update on public.brands
  for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger inquiries_set_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();
create trigger pqr_requests_set_updated_at before update on public.pqr_requests
  for each row execute function public.set_updated_at();
create trigger business_settings_set_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();

-- Administrador = tiene perfil Y entró con segundo factor. Sin MFA no hay permisos,
-- aunque se robe la contraseña.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1 from public.admin_profiles where auth_user_id = (select auth.uid())
    );
$$;

create function public.touch_stock_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.stock_quantity is distinct from old.stock_quantity then
    new.stock_updated_at = now();
  end if;
  return new;
end;
$$;

create trigger products_touch_stock before update on public.products
  for each row execute function public.touch_stock_updated_at();

-- Todo cambio de existencias queda en el historial, venga de donde venga.
create function public.log_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_quantity integer := 0;
begin
  if tg_op = 'UPDATE' then
    if new.stock_quantity = old.stock_quantity then
      return new;
    end if;
    previous_quantity := old.stock_quantity;
  end if;

  insert into public.inventory_movements
    (product_id, product_name_snapshot, quantity_delta, resulting_quantity, reason, actor_id)
  values (
    new.id,
    new.name,
    new.stock_quantity - previous_quantity,
    new.stock_quantity,
    nullif(current_setting('app.stock_reason', true), ''),
    auth.uid()
  );
  return new;
end;
$$;

create trigger products_log_inventory after insert or update of stock_quantity on public.products
  for each row execute function public.log_inventory_movement();

-- Única vía para cambiar existencias de un producto creado (sin permiso directo sobre la columna).
create function public.set_stock_quantity(
  p_product_id uuid,
  p_quantity integer,
  p_reason text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_quantity integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  perform set_config('app.stock_reason', coalesce(left(p_reason, 200), ''), true);

  update public.products
    set stock_quantity = p_quantity
    where id = p_product_id
    returning stock_quantity into updated_quantity;

  if updated_quantity is null then
    raise exception 'Producto no encontrado' using errcode = 'P0002';
  end if;

  return updated_quantity;
end;
$$;
