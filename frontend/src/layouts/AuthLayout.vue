<script setup lang="ts">
// No additional setup needed
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <Card>
        <template #title>
          <img
            src="../assets/images/fastapi-logo-text.svg"
            alt="Logo"
            class="h-12 w-auto mx-auto mb-5"
          />
        </template>
        <template #content>
          <router-view v-slot="{ Component }">
            <transition>
              <Transition
                mode="out-in"
                enter-active-class="transition-opacity duration-200 ease-in"
                leave-active-class="transition-opacity duration-200 ease-out"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
              >
                <component :is="Component" />
              </Transition>
            </transition>
          </router-view>
        </template>
      </Card>
    </div>
  </div>
</template>
