<template>
  <button
    @click="toggle"
    aria-haspopup="true"
    aria-controls="overlay_menu"
    data-testid="user-menu"
    class="focus:outline-none focus:ring-2 focus:ring-primary"
    aria-label="User menu"
  >
    <div
      class="w-full flex items-center justify-center overflow-hidden"
      :class="{ 'max-w-[10em]': lgAndUp }"
    >
      <Avatar :label="initials" shape="circle" class="flex-shrink-0" />
      <div v-if="lgAndUp || mobile" class="flex flex-col overflow-hidden ms-2">
        <div class="truncate">
          {{ user?.full_name || user?.email }}
        </div>
        <div class="text-sm truncate" v-if="user?.full_name">
          {{ user?.email }}
        </div>
      </div>
    </div>
  </button>

  <Menu ref="menu" :model="items" :popup="true">
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
      </a>
    </template>
    <template #end>
      <div class="w-full flex items-center gap-2 p-2 overflow-hidden">
        <Avatar :label="initials" shape="circle" class="flex-shrink-0" />
        <div class="flex flex-col overflow-hidden">
          <div class="font-bold truncate">
            {{ user?.full_name || user?.email }}
          </div>
          <div class="text-sm truncate" v-if="user?.full_name">
            {{ user?.email }}
          </div>
        </div>
      </div>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { useDisplay } from "@/composables/useDisplay";

const { logout } = useAuthStore();
const { user } = storeToRefs(useAuthStore());
const { lgAndUp, mobile } = useDisplay();

const menu = ref();

const handleLogout = () => {
  logout();
  menu.value.hide();
};

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
  //     },
  //     {
  //       label: "Search",
  //       icon: "pi pi-search",
  //     },
  //   ],
  // },
  // {
  //   label: "Profile",
  //   items: [
  //     {
  //       label: "Settings",
  //       icon: "pi pi-cog",
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
    onClick: () => handleLogout(),
  },
  {
    separator: true,
  },
]);

const toggle = (event: MouseEvent) => {
  menu.value.toggle(event);
};

const initials = computed(() => {
  if (!user.value) return "";

  const fullName = user.value.full_name;
  if (fullName && fullName.trim()) {
    return fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  }

  const email = user.value.email;
  if (email && email.includes("@")) {
    return email
      .split("@")[0]
      .split(".")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  }

  return "U"; // Default fallback
});
</script>
