-- Almacenamiento: de texto libre a una lista fija (64 GB, 128 GB, 256 GB, 512 GB, 1 TB).

-- Se unifica lo que ya estaba escrito ("256gb", "256", "1T", "1 tb", "1024 GB"…).
-- Un valor que no corresponde a ninguna opción queda vacío.
update public.products
set storage_capacity = case
  when lower(regexp_replace(storage_capacity, '\s', '', 'g')) in ('1t', '1tb', '1024', '1024gb')
    then '1 TB'
  when lower(regexp_replace(storage_capacity, '\s', '', 'g'))
    in ('64', '64gb', '128', '128gb', '256', '256gb', '512', '512gb')
    then substring(storage_capacity from '\d+') || ' GB'
end
where storage_capacity is not null;

alter table public.products
  add constraint products_storage_capacity_option
  check (storage_capacity in ('64 GB', '128 GB', '256 GB', '512 GB', '1 TB'));
