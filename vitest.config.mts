import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // lcov lo lee SonarQube Cloud; el resumen de texto sirve en la terminal.
      reporter: ["lcov", "text-summary"],
      include: ["lib/**/*.ts", "schemas/**/*.ts", "features/admin/action-state.ts"],
      exclude: ["lib/supabase/**"],
    },
  },
});
