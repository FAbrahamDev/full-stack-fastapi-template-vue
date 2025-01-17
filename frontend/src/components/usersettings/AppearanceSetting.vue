<template>
  <h2 class="text-lg font-semibold py-4">Appearance</h2>

  <div class="flex flex-column gap-3">
    <div class="flex align-items-center">
      <RadioButton
        v-model="colorMode"
        inputId="light"
        name="theme"
        value="light"
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
        value="dark"
      />
      <label for="dark" class="ml-2">Dark Mode</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

// get the current color mode from local storage
const colorMode = ref(localStorage.getItem("colorMode") || "light-mode");

// watch for changes in color mode and update the local storage
watch(colorMode, (value) => {
  localStorage.setItem("colorMode", value);

  // change color mode by setting dark-mode or removing it
  document.documentElement.classList.toggle("dark-mode", value === "dark-mode");
});
</script>
