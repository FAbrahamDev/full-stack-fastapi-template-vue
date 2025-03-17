<template>
  <div v-if="isLoading" class="flex justify-center items-center h-full">
    <ProgressSpinner />
  </div>
  <template v-else>
    <h1 class="text-4xl font-bold pb-12 text-center md:text-left">
      User Settings
    </h1>

    <div class="card w-full max-w-[100vw] overflow-hidden">
      <Tabs :value="activeTab" @update:value="updateTab" scrollable>
        <TabList>
          <Tab v-for="tab in tabsConfig" :key="tab.title" :value="tab.id">
            <div class="flex items-center gap-2">
              <i :class="tab.icon" />
              <span>{{ tab.title }}</span>
            </div>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel v-for="tab in tabsConfig" :key="tab.title" :value="tab.id">
            <component :is="tab.component" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useRouter, useRoute } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";

import type { UserPublic } from "@/client";

import Appearance from "@/components/usersettings/AppearanceSetting.vue";
import ChangePassword from "@/components/usersettings/ChangePassword.vue";
import DeleteAccount from "@/components/usersettings/DeleteAccount.vue";
import UserInformation from "@/components/usersettings/UserInformation.vue";

interface TabItem {
  id: number;
  title: string;
  component: Component;
  icon: string;
  path: string;
}

const router = useRouter();
const route = useRoute();

const tabsConfig: TabItem[] = [
  {
    id: 0,
    title: "My profile",
    component: UserInformation,
    icon: "pi pi-user",
    path: "/settings",
  },
  {
    id: 1,
    title: "Password",
    component: ChangePassword,
    icon: "pi pi-lock",
    path: "/settings/password",
  },
  {
    id: 2,
    title: "Appearance",
    component: Appearance,
    icon: "pi pi-palette",
    path: "/settings/appearance",
  },
  {
    id: 3,
    title: "Danger zone",
    component: DeleteAccount,
    icon: "pi pi-exclamation-triangle",
    path: "/settings/danger",
  },
];

const activeTab = computed(() => {
  const path = route.path;
  const tab = tabsConfig.findIndex((tab) => tab.path === path);
  return tab >= 0 ? tab : 0;
});

const updateTab = (newTab: string | number) => {
  const tab = tabsConfig[Number(newTab)];
  if (tab) {
    router.push({ path: tab.path, replace: true });
  }
};

const { user, isLoading } = storeToRefs(useAuthStore());
</script>
