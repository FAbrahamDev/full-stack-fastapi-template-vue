<template>
  <div v-if="isLoading" class="flex justify-center items-center h-full">
    <ProgressSpinner />
  </div>
  <template v-else>
    <h1 class="text-4xl font-bold pb-12 text-center md:text-left">
      User Settings
    </h1>

    <div class="card">
      <Tabs :value="activeTab">
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
import { ref, type Component } from "vue";
import { useAuth } from "@/composables/useAuth";
import ProgressSpinner from "primevue/progressspinner";

import Appearance from "@/components/usersettings/AppearanceSetting.vue";
import ChangePassword from "@/components/usersettings/ChangePassword.vue";
import DeleteAccount from "@/components/usersettings/DeleteAccount.vue";
import UserInformation from "@/components/usersettings/UserInformation.vue";

interface TabItem {
  id: number;
  title: string;
  component: Component;
  icon: string;
}

const activeTab = ref(0);

const tabsConfig: TabItem[] = [
  {
    id: 0,
    title: "My profile",
    component: UserInformation,
    icon: "pi pi-user",
  },
  {
    id: 1,
    title: "Password",
    component: ChangePassword,
    icon: "pi pi-lock",
  },
  {
    id: 2,
    title: "Appearance",
    component: Appearance,
    icon: "pi pi-palette",
  },
  {
    id: 3,
    title: "Danger zone",
    component: DeleteAccount,
    icon: "pi pi-exclamation-triangle",
  },
];

const { user, isLoading } = useAuth();
</script>
