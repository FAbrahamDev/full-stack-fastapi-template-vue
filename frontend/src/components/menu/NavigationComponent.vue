<script setup lang="ts">
import { ref } from 'vue';
import Menu from 'primevue/menu';
import { Home, MessageCircle, Users, Grid, Video, Settings } from 'lucide-vue-next';

const navigationItems = ref([
  {
    label: 'Logo',
    icon: 'logo',
    class: 'mb-4'
  },
  {
    label: 'Home',
    icon: Home,
    class: 'mb-2'
  },
  {
    label: 'Messages',
    icon: MessageCircle,
    class: 'mb-2'
  },
  {
    label: 'Users',
    icon: Users,
    class: 'mb-2'
  },
  {
    label: 'Grid',
    icon: Grid,
    class: 'mb-2'
  },
  {
    label: 'Video',
    icon: Video,
    class: 'mb-2'
  }
]);

const bottomItems = ref([
  {
    label: 'Settings',
    icon: Settings,
    class: 'mb-2'
  },
  {
    label: 'Profile',
    icon: 'profile',
    class: ''
  }
]);
</script>

<template>
  <div class="flex h-screen">
    <nav class="w-16 bg-gray-900 flex flex-col items-center py-4">
      <!-- Top Navigation Items -->
      <div class="flex flex-col items-center mb-auto">
        <template v-for="item in navigationItems" :key="item.label">
          <!-- Logo Item -->
          <div v-if="item.icon === 'logo'" :class="['flex items-center justify-center w-12 h-12', item.class]">
            <img src="/logo.svg" alt="Logo" class="w-8 h-8" />
          </div>
          <!-- Navigation Icons -->
          <div
            v-else
            :class="[
              'flex items-center justify-center w-12 h-12 text-gray-400',
              'hover:text-white hover:bg-gray-800 rounded-lg',
              item.class
            ]"
          >
            <component :is="item.icon" class="w-6 h-6" />
          </div>
        </template>
      </div>

      <!-- Bottom Items -->
      <div class="flex flex-col items-center">
        <template v-for="item in bottomItems" :key="item.label">
          <!-- Settings Icon -->
          <div
            v-if="item.icon === Settings"
            :class="[
              'flex items-center justify-center w-12 h-12 text-gray-400',
              'hover:text-white hover:bg-gray-800 rounded-lg',
              item.class
            ]"
          >
            <component :is="item.icon" class="w-6 h-6" />
          </div>
          <!-- Profile Image -->
          <div
            v-else
            :class="['flex items-center justify-center w-12 h-12', item.class]"
          >
            <img
              src="/profile-placeholder.jpg"
              alt="Profile"
              class="w-8 h-8 rounded-full border-2 border-gray-700"
            />
          </div>
        </template>
      </div>
    </nav>

    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Add any additional custom styles here */
</style>
