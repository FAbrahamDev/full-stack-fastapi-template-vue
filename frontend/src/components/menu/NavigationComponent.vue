<template>
  <Menubar :model="items">
    <template #start>
      <img
        src="@/assets/images/fastapi-logo.svg"
        alt="Logo"
        class="h-8 w-auto mx-auto"
      />
    </template>
    <template #item="{ item, props, hasSubmenu }">
      <router-link
        v-if="item.route"
        v-slot="{ href, navigate }"
        :to="item.route"
        custom
      >
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
          <Badge v-if="item.badge" :value="item.badge" class="ml-2" />
        </a>
      </router-link>
      <a
        v-else
        v-ripple
        :href="item.url"
        :target="item.target"
        v-bind="props.action"
        @click="
          item.command
            ? ($event) => handleCommand($event, item.command)
            : undefined
        "
      >
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <Badge v-if="item.badge" :value="item.badge" class="ml-2" />
        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
      </a>
    </template>
    <template #end>
      <div class="flex items-center gap-2">
        <Button
          icon="pi pi-sun"
          @click="toggleDarkMode"
          variant="text"
          size="small"
        />
        <UserMenu />
      </div>
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import UserMenu from "@/components/menu/UserMenu.vue";

const router = useRouter();
const { user } = useAuth();

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  url?: string;
  target?: string;
  command?: () => void;
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

  console.log(user.value);
  if (user.value?.is_superuser) {
    menuItems.push(adminMenuItem);
  }
  return menuItems;
});

function handleCommand(event: Event, command: () => void) {
  event.preventDefault();
  command();
}

function toggleDarkMode() {
  // also set localStorage.setItem("colorMode", value);

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
