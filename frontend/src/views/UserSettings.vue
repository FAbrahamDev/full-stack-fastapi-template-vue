<template>
  <div class="container">
    <h1 class="text-4xl font-bold py-12 text-center md:text-left">
      User Settings
    </h1>

    <div class="card">
      <Tabs v-model:activeIndex="activeTab">
        <TabList>
          <Tab v-for="tab in finalTabs" :key="tab.title">
            <div class="flex items-center gap-2">
              <i :class="tab.icon" />
              <span>{{ tab.title }}</span>
            </div>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel v-for="tab in finalTabs" :key="tab.title">
            <component :is="tab.component" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import type { UserPublic } from "@/client";

import Appearance from "@/components/usersettings/AppearanceSetting.vue";
import ChangePassword from "@/components/usersettings/ChangePassword.vue";
import DeleteAccount from "@/components/usersettings/DeleteAccount.vue";
import UserInformation from "@/components/usersettings/UserInformation.vue";

interface TabItem {
  title: string;
  component: Component;
  icon: string;
}

const activeTab = ref(0);

const tabsConfig: TabItem[] = [
  {
    title: "My profile",
    component: UserInformation,
    icon: "pi pi-user",
  },
  {
    title: "Password",
    component: ChangePassword,
    icon: "pi pi-lock",
  },
  {
    title: "Appearance",
    component: Appearance,
    icon: "pi pi-palette",
  },
  {
    title: "Danger zone",
    component: DeleteAccount,
    icon: "pi pi-exclamation-triangle",
  },
];

const queryClient = useQueryClient();
const currentUser = computed(() =>
  queryClient.getQueryData<UserPublic>(["currentUser"]),
);

const finalTabs = computed(() =>
  currentUser.value?.is_superuser ? tabsConfig.slice(0, 3) : tabsConfig,
);
</script>
