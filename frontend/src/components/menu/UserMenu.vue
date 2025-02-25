<template>
  <button @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" data-testid="user-menu">
    <Avatar shape="circle" :label="initials" />
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
    <!-- PrimeVue type definition mismatch, submenulabel slot exists in docs and works but is not typed -->
    <template #submenuheader="{ item }">
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
        class="overflow-hidden w-full border-0 flex items-center justify-start gap-2 p-2 pl-4 cursor-pointer"
      >
        <Avatar label="F" class="mr-2" shape="circle" />
        <span class="inline-flex flex-col items-start">
          <span class="font-bold">{{ user?.full_name || user?.email }}</span>
          <span class="text-sm" v-if="user?.full_name">{{ user?.email }}</span>
        </span>
      </button>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const { logout } = useAuthStore();
const { user } = storeToRefs(useAuthStore());

const menu = ref();

const items = ref([
  // {
  //   separator: true,
  // },
  // {
  //   label: "Documents",
  //   items: [
  //     {
  //       label: "New",
  //       icon: "pi pi-plus",
  //       shortcut: "⌘+N",
  //     },
  //     {
  //       label: "Search",
  //       icon: "pi pi-search",
  //       shortcut: "⌘+S",
  //     },
  //   ],
  // },
  // {
  //   label: "Profile",
  //   items: [
  //     {
  //       label: "Settings",
  //       icon: "pi pi-cog",
  //       shortcut: "⌘+O",
  //     },
  //     {
  //       label: "Messages",
  //       icon: "pi pi-inbox",
  //       badge: 2,
  //     },
  //   ],
  // },
  {
    label: "Log Out",
    icon: "pi pi-sign-out",
    shortcut: "⌘+Q",
    onClick: () => logout(),
  },
  {
    separator: true,
  },
]);

const toggle = (event: MouseEvent) => {
  menu.value.toggle(event);
};

const initials = computed(() => {
  const fullNameInitials = user.value?.full_name
    ?.split(" ")
    .map((name) => name[0])
    .join("");

  if (fullNameInitials) {
    return fullNameInitials;
  }

  return user.value?.email
    ?.split("@")[0]
    .split(".")
    .map((name) => name[0])
    .join("");
});
</script>
