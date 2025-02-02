<!-- Dashboard.vue -->
<template>
  <div class="mb-12">
    <h1 class="text-2xl font-medium">
      Hi, {{ user?.full_name || user?.email }} 👋🏼
    </h1>
    <p class="text-gray-600 mt-2">Welcome back, nice to see you again!</p>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";

const { user } = storeToRefs(useAuthStore());
</script>
