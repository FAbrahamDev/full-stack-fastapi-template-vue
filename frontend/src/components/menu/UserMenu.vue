<template>
  <button @click="toggle" aria-haspopup="true" aria-controls="overlay_menu">
    <Avatar shape="circle" label="F" />
  </button>
  <Menu ref="menu" :model="items" class="w-full md:w-60" :popup="true">
    <template #start>
      <span class="flex items-center gap-1 px-2 py-3">
        <img
          src="@/assets/images/fastapi-logo-text.svg"
          alt="Logo"
          class="h-8 w-auto mx-auto"
        />
      </span>
    </template>
    <template #submenulabel="{ item }">
      <span class="text-primary font-bold">{{ item.label }}</span>
    </template>
    <template #item="{ item, props }">
      <a class="flex items-center" v-bind="props.action" @click="item.onClick">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
        <span
          v-if="item.shortcut"
          class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"
        >
          {{ item.shortcut }}
        </span>
      </a>
    </template>
    <template #end>
      <button
        class="relative overflow-hidden w-full border-0 bg-transparent flex items-start p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-none cursor-pointer transition-colors duration-200"
      >
        <Avatar
          image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
          class="mr-2"
          shape="circle"
        />
        <span class="inline-flex flex-col items-start">
          <span class="font-bold">Amy Elsner</span>
          <span class="text-sm">Admin</span>
        </span>
      </button>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";

const { logout } = useAuthStore();

const menu = ref();

const items = ref([
  {
    separator: true,
  },
  {
    label: "Documents",
    items: [
      {
        label: "New",
        icon: "pi pi-plus",
        shortcut: "⌘+N",
      },
      {
        label: "Search",
        icon: "pi pi-search",
        shortcut: "⌘+S",
      },
    ],
  },
  {
    label: "Profile",
    items: [
      {
        label: "Settings",
        icon: "pi pi-cog",
        shortcut: "⌘+O",
      },
      {
        label: "Messages",
        icon: "pi pi-inbox",
        badge: 2,
      },
      {
        label: "Logout",
        icon: "pi pi-sign-out",
        shortcut: "⌘+Q",
        onClick: () => logout(),
      },
    ],
  },
  {
    separator: true,
  },
]);

const toggle = (event) => {
  menu.value.toggle(event);
};
</script>
