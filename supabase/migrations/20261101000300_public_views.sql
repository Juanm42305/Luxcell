-- Vistas del catálogo público. Se ejecutan con permisos de su dueño a propósito: el visitante no
-- tiene acceso a las tablas base y solo ve estas columnas. stock_quantity y low_stock_threshold
-- nunca salen de aquí; security_barrier impide que un filtro las observe antes del WHERE.

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
  case
    when p.stock_quantity = 0 then 'out_of_stock'
    when p.stock_quantity <= p.low_stock_threshold then 'low_stock'
    else 'available'
  end as stock_status,
  p.condition,
  p.storage_capacity,
  p.color,
  p.specs,
  p.warranty_terms,
  p.offer_valid_until,
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
where p.is_active;

create view public.catalog_product_images
with (security_barrier = true, security_invoker = false)
as
select i.id, i.product_id, i.storage_path, i.alt_text, i.is_primary, i.display_order
from public.product_images i
join public.products p on p.id = i.product_id
where p.is_active;
