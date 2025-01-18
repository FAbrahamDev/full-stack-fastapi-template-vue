<script setup lang="ts">
import NavigationComponent from "@/components/menu/NavigationComponent.vue";
</script>

<template>
  <div class="min-h-screen flex container mx-auto py-5">
    <!-- Sidebar -->
    <NavigationComponent />

    <!-- Main Content -->
    <main class="flex-1">
      <div class="p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
