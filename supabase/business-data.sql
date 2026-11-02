-- Datos públicos del negocio. Se ejecutan a mano en el SQL Editor de Supabase (producción) y en
-- local. No es una migración: son datos que el negocio cambiará desde el panel en la Fase 4.
-- Los campos ausentes quedan en null y la web no los muestra.
update public.business_settings
set
  business_name = 'LUX CELL',
  description = 'TODO LO QUE NECESITAS CON LAS TRES B',
  phone = '+57 320 3164287',
  social_media = '[{"label": "Instagram", "href": "https://www.instagram.com/luxcellmtr/"}]'::jsonb,
  brand_colors = '{"primary": "#FFDC08"}'::jsonb
where id;
