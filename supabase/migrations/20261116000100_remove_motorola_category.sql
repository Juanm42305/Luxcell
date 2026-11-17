-- La tienda ya no vende Motorola: se retira la categoría (no tiene productos).
delete from public.categories where slug = 'motorola';
