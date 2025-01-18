<script setup lang="ts">
import { RouterView } from "vue-router";

const colorMode = localStorage.getItem("colorMode") || "light-mode";
if (colorMode === "dark-mode")
  document.documentElement.classList.add(colorMode);
</script>

<template>
  <Toast />
  <RouterView />
</template>

<style scoped></style>
