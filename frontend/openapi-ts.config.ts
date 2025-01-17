import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-axios",
  input: "http://localhost:8000/api/v1/openapi.json",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "./src/client",
  },
  plugins: [
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    {
      enums: "javascript",
      name: "@hey-api/typescript",
    },
    {
      name: "@hey-api/sdk",
      // NOTE: this doesn't allow tree-shaking
      asClass: true,
      operationId: true,
      transformer: true,
    },
    "@tanstack/vue-query",
  ],
});
