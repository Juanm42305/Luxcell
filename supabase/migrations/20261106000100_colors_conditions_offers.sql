-- Varios colores por producto, nuevos estados y precio en oferta.

-- La vista depende de las columnas que cambian: se elimina y se vuelve a crear al final.
drop view public.catalog_products;

-- Estados: Nuevo, Exhibición, Seminuevo y Reacondicionado. Los productos que estaban como
-- «Usado» pasan a «Seminuevo», el estado más cercano de la nueva lista.
alter type public.product_condition rename to product_condition_old;
create type public.product_condition as enum ('new', 'display', 'like_new', 'refurbished');

alter table public.products alter column condition drop default;
alter table public.products
  alter column condition type public.product_condition
  using (
    case condition::text when 'used' then 'like_new' else condition::text end
  )::public.product_condition;
alter table public.products alter column condition set default 'new';
drop type public.product_condition_old;

-- Colores: de un texto único a una lista. El color que ya tenía cada producto se conserva.
alter table public.products
  add column colors text[] not null default '{}'
  check (
    cardinality(colors) <= 12
    and array_position(colors, null) is null
    and char_length(array_to_string(colors, '')) <= 12 * 40
  );
update public.products set colors = array[btrim(color)] where nullif(btrim(color), '') is not null;
alter table public.products drop column color;

-- Precio en oferta: siempre menor que el precio normal. offer_valid_until es su último día.
alter table public.products
  add column sale_price bigint check (sale_price >= 0),
  add constraint products_sale_price_below_price check (sale_price < price);

grant insert (colors, sale_price), update (colors, sale_price) on public.products to authenticated;

-- La oferta deja de mostrarse sola al terminar su último día en hora de Colombia.
create view public.catalog_products
with (security_barrier = true, security_invoker = false)
as
select
  p.id,
  p.name,
  p.slug,
  p.model,
  p.short_description,
  p.description,
  p.price,
  o.sale_price,
  coalesce(o.sale_price, p.price) as effective_price,
  case
    when p.stock_quantity = 0 then 'out_of_stock'
    when p.stock_quantity <= p.low_stock_threshold then 'low_stock'
    else 'available'
  end as stock_status,
  p.condition,
  p.storage_capacity,
  p.colors,
  p.specs,
  p.warranty_terms,
  case when o.sale_price is not null then p.offer_valid_until end as offer_valid_until,
  p.is_featured,
  p.created_at,
  p.updated_at,
  p.stock_updated_at,
  b.id as brand_id,
  b.name as brand_name,
  b.slug as brand_slug,
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug,
  lower(extensions.unaccent(p.name || ' ' || p.model)) as search_text
from public.products p
join public.brands b on b.id = p.brand_id and b.is_active
join public.categories c on c.id = p.category_id and c.is_active
cross join lateral (
  select
    case
      when p.offer_valid_until is null
        or p.offer_valid_until >= (now() at time zone 'America/Bogota')::date
      then p.sale_price
    end as sale_price
) o
where p.is_active;

grant select on public.catalog_products to anon, authenticated;
