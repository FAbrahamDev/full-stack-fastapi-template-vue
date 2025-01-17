<script setup lang="ts">
import { RouterView } from "vue-router";

// check colorMode from local storage
const colorMode = localStorage.getItem("colorMode") || "light-mode";

document.documentElement.classList.add(colorMode);
</script>

<template>
  <Toast />
  <RouterView />
</template>

<style scoped></style>
