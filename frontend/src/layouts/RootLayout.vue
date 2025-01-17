<script setup lang="ts">
import NavigationComponent from "@/components/menu/NavigationComponent.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="container mx-auto px-4 pt-2">
      <NavigationComponent />
    </div>
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
