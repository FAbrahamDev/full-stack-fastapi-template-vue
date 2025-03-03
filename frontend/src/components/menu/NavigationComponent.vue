<!-- Template -->
<template>
  <!-- Large screens - horizontal navbar with text -->
  <Card
    v-if="!mobile"
    :pt="{
      body: 'h-full !px-3',
      content: 'h-full flex flex-col justify-between',
    }"
  >
    <template #content>
      <div class="flex flex-col gap-4 h-full">
        <img
          v-if="!lgAndUp"
          src="@/assets/images/fastapi-logo.svg"
          alt="Logo"
          class="h-8 w-auto mx-auto mb-5"
        />
        <img
          v-else
          src="@/assets/images/fastapi-logo-text.svg"
          alt="Logo"
          class="h-7 w-auto mx-2 mb-5"
        />

        <router-link
          v-for="item in items"
          :key="item.label"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <Button
            :class="lgAndUp ? '!justify-start' : ''"
            :href="href"
            @click="navigate"
            severity="contrast"
            :icon="item.icon"
            :label="lgAndUp ? item.label : undefined"
            variant="text"
            v-tooltip="!lgAndUp ? item.label : undefined"
          />
        </router-link>

        <div class="flex-grow" />

        <Button
          :class="lgAndUp ? '!justify-start' : ''"
          icon="pi pi-sun"
          :label="lgAndUp ? 'Theme' : undefined"
          @click="toggleDarkMode"
          variant="text"
          v-tooltip="!lgAndUp ? 'Theme' : undefined"
        />
        <UserMenu />
      </div>
    </template>
  </Card>

  <!-- Mobile view - burger menu -->
  <template v-else>
    <Button
      class="!fixed top-2 left-2"
      icon="pi pi-bars"
      @click="toggleMobileMenu"
      variant="text"
      aria-label="Menu"
    />

    <!-- Mobile menu dropdown -->
    <Sidebar v-model:visible="mobileMenuVisible" position="left" class="w-64">
      <div class="flex flex-col gap-4 h-full items-start">
        <img
          src="@/assets/images/fastapi-logo-text.svg"
          alt="Logo"
          class="h-7 w-auto mx-2 mb-5"
        />
        <router-link
          v-for="item in items"
          :key="item.label"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <Button
            class="!justify-start"
            :href="href"
            @click="
              () => {
                navigate();
                mobileMenuVisible = false;
              }
            "
            severity="contrast"
            :icon="item.icon"
            :label="item.label"
            variant="text"
          />
        </router-link>

        <div class="flex-grow" />

        <Divider />

        <Button
          icon="pi pi-sun"
          label="Theme"
          @click="toggleDarkMode"
          variant="text"
        />

        <div class="ps-3">
          <UserMenu />
        </div>
      </div>
    </Sidebar>
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { useDisplay } from "@/composables/useDisplay";
import UserMenu from "@/components/menu/UserMenu.vue";

const { user } = storeToRefs(useAuthStore());
const themeStore = useThemeStore();
const { colorMode } = storeToRefs(themeStore);

// Responsive handling using useDisplay
const { mobile, lgAndUp } = useDisplay();

const mobileMenuVisible = ref(false);

const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value;
};

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  url?: string;
  target?: string;
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
  const newMode = colorMode.value === "dark-mode" ? "light-mode" : "dark-mode";
  themeStore.setColorMode(newMode);
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
