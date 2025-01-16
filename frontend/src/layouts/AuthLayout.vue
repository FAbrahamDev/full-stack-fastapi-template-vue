<!-- layouts/AuthLayout.vue -->
<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo section -->
      <Card>
        <template #title>
          <img
            src="../assets/images/fastapi-logo-text.svg"
            alt="Logo"
            class="h-12 w-auto mx-auto mb-5"
          >
        </template>
        <template #content>
          <RouterView />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional setup needed
</script>
