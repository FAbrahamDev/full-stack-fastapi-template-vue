<!-- Template -->
<template>
  <Card
    :pt="{
      body: 'h-full !px-3',
      content: 'h-full flex flex-col justify-between',
    }"
  >
    <template #content>
      <div class="flex flex-col items-center gap-4">
        <img
          src="@/assets/images/fastapi-logo.svg"
          alt="Logo"
          class="h-8 w-auto mx-auto mb-5"
        />

        <router-link
          v-for="item in items"
          :key="item.label"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
          :v-tooltip="item.label"
        >
          <Button
            :href="href"
            @click="navigate"
            severity="contrast"
            :aria-label="item.label"
            variant="text"
            v-tooltip="item.label"
            placeholder="Right"
          >
            <span :class="item.icon" />
            <Badge v-if="item.badge" :value="item.badge" class="ml-2" />
          </Button>
        </router-link>
      </div>

      <div class="flex-1" />

      <div class="flex flex-col items-center gap-2">
        <Button
          icon="pi pi-sun"
          @click="toggleDarkMode"
          variant="text"
          size="small"
        />
        <UserMenu />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import UserMenu from "@/components/menu/UserMenu.vue";

const router = useRouter();
const { user } = storeToRefs(useAuthStore());

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  url?: string;
  target?: string;
  badge?: string;
  items?: MenuItem[];
}

const baseItems = ref<MenuItem[]>([
  {
    label: "Home",
    icon: "pi pi-home",
    route: "/",
  },
  {
    label: "Items",
    icon: "pi pi-shopping-bag",
    route: "/items",
  },
  {
    label: "User Settings",
    icon: "pi pi-cog",
    route: "/settings",
  },
]);

const adminMenuItem: MenuItem = {
  label: "Admin",
  icon: "pi pi-users",
  route: "/admin",
};

const items = computed(() => {
  const menuItems = [...baseItems.value];

  if (user.value?.is_superuser) {
    menuItems.push(adminMenuItem);
  }
  return menuItems;
});

function toggleDarkMode() {
  localStorage.setItem(
    "colorMode",
    document.documentElement.classList.contains("dark-mode")
      ? "light-mode"
      : "dark-mode",
  );

  document.documentElement.classList.toggle("dark-mode");
}
</script>

<style scoped>
:deep(.p-menubar) {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
}

:deep(.p-menuitem-link) {
  padding: 0.75rem 1rem;
}

:deep(.p-menuitem-icon) {
  margin-right: 0.5rem;
}
</style>
