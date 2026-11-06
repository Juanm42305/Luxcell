import type { ProductCondition } from "@/types/catalog";

export const conditionLabels: Record<ProductCondition, string> = {
  new: "Nuevo",
  display: "Exhibición",
  like_new: "Seminuevo",
  refurbished: "Reacondicionado",
};

export const conditionOptions = (Object.keys(conditionLabels) as ProductCondition[]).map(
  (value) => ({ value, label: conditionLabels[value] }),
);

/** Mismas opciones que permite la base de datos. */
export const storageCapacities = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] as const;

export const storageOptions = storageCapacities.map((value) => ({ value, label: value }));

/** Sugerencias del panel; el negocio puede escribir cualquier otro color. */
export const suggestedColors = [
  "Negro",
  "Blanco",
  "Gris",
  "Plateado",
  "Dorado",
  "Azul",
  "Verde",
  "Rosado",
  "Morado",
  "Rojo",
  "Titanio natural",
  "Titanio negro",
  "Titanio blanco",
  "Titanio desierto",
];

export const MAX_COLORS = 12;
export const MAX_COLOR_LENGTH = 40;
