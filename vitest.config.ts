import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["app/**/*.test.ts", "app/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["app/lib/**/*.ts"],
      exclude: [
        // Les tests eux-mêmes ne sont pas du code couvert.
        "app/lib/**/*.test.ts",
        // Fichiers purement déclaratifs : rien à exécuter, donc rien à couvrir.
        "app/lib/**/index.ts",
        "app/lib/djomy/types.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
