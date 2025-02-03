<template>
  <h2 class="text-lg font-semibold py-4">Appearance</h2>

  <div class="flex flex-col gap-3">
    <div class="flex align-items-center">
      <RadioButton
        v-model="colorMode"
        inputId="light"
        name="theme"
        value="light-mode"
      />
      <label for="light" class="ml-2">
        Light Mode
        <Badge value="Default" severity="info" class="ml-2" />
      </label>
    </div>

    <div class="flex align-items-center">
      <RadioButton
        v-model="colorMode"
        inputId="dark"
        name="theme"
        value="dark-mode"
      />
      <label for="dark" class="ml-2">Dark Mode</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { useThemeStore } from "@/stores/theme";

const themeStore = useThemeStore();
const { colorMode } = storeToRefs(themeStore);

watch(colorMode, (value: string) => {
  themeStore.setColorMode(value as "light-mode" | "dark-mode");
});
</script>
