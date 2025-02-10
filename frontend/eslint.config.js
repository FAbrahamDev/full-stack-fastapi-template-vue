import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import pluginPlaywright from "eslint-plugin-playwright";
import oxlint from "eslint-plugin-oxlint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },
  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
  },
  ...defineConfigWithVueTs(
    pluginVue.configs["flat/essential"],
    vueTsConfigs.recommended,
  ),
  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },
  {
    ...pluginPlaywright.configs["flat/recommended"],
    files: ["e2e/**/*.{test,spec}.{js,ts,jsx,tsx}"],
  },
  oxlint.configs["flat/recommended"],
  eslintPluginPrettierRecommended,
];
