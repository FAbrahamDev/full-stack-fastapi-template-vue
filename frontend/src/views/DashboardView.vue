<!-- Dashboard.vue -->
<template>
  <div class="container w-full px-4">
    <div class="pt-12">
      <h1 class="text-2xl font-medium">
        Hi, {{ currentUser?.full_name || currentUser?.email }} 👋🏼
      </h1>
      <p class="text-gray-600 mt-2">Welcome back, nice to see you again!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "@/composables/useAuth";

const { currentUser } = useAuth();
</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 1200px;
}
</style>
