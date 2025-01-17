<!-- ActionsMenu.vue -->
<template>
  <div class="relative">
    <Button
      :disabled="disabled"
      icon="pi pi-ellipsis-v"
      text
      @click="menu.toggle($event)"
      aria-haspopup="true"
      aria-controls="actions_menu"
    />

    <Menu ref="menu" id="actions_menu" :model="menuItems" :popup="true" />

    <!-- Edit Modal -->
    <EditUser v-if="type === 'User'" v-model="showEditModal" :user="value" />
    <EditItem v-else v-model="showEditModal" :item="value" />

    <!-- Delete Modal -->
    <Delete v-model="showDeleteModal" :type="type" :id="value.id" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { MenuItem } from "primevue/menuitem";
import type { ItemPublic, UserPublic } from "@/client";
import Menu from "primevue/menu";
import Button from "primevue/button";
import EditUser from "@/components/admin/EditUser.vue";
import EditItem from "@/components/items/EditItem.vue";
import Delete from "@/components/common/DeleteAlert.vue";

interface Props {
  type: string;
  value: ItemPublic | UserPublic;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const menu = ref();
const showEditModal = ref(false);
const showDeleteModal = ref(false);

const menuItems = computed<MenuItem[]>(() => [
  {
    label: `Edit ${props.type}`,
    icon: "pi pi-pencil",
    command: () => {
      showEditModal.value = true;
    },
  },
  {
    label: `Delete ${props.type}`,
    icon: "pi pi-trash",
    class: "text-red-600",
    command: () => {
      showDeleteModal.value = true;
    },
  },
]);
</script>
