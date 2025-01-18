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

    <component
      v-if="showEditModal"
      :is="editModalComponent"
      v-model="showEditModal"
      :item="value"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from "vue";
import { useConfirm } from "primevue";
import { useToast } from "primevue/usetoast";
import type { MenuItem } from "primevue/menuitem";

interface Props<T> {
  value: T;
  entityName: string;
  disabled?: boolean;
  onDelete?: (item: T) => Promise<void>;
  editModelAs: Component;
}

const props = withDefaults(defineProps<Props<any>>(), {
  disabled: false,
});

const confirm = useConfirm();
const toast = useToast();
const menu = ref();
const showEditModal = ref(false);

// Compute the edit modal component
const editModalComponent = computed(() => props.editModelAs);

const menuItems = computed<MenuItem[]>(() => [
  {
    label: `Edit ${props.entityName}`,
    icon: "pi pi-pencil",
    command: () => {
      showEditModal.value = true;
    },
  },
  {
    label: `Delete ${props.entityName}`,
    icon: "pi pi-trash",
    class: "text-red-600",
    command: () => {
      confirm.require({
        message: "Do you want to delete this record?",
        header: "Danger Zone",
        icon: "pi pi-info-circle",
        rejectLabel: "Cancel",
        rejectProps: {
          label: "Cancel",
          severity: "secondary",
          outlined: true,
        },
        acceptProps: {
          label: "Delete",
          severity: "danger",
        },
        accept: async () => {
          try {
            if (props.onDelete) {
              await props.onDelete(props.value);
              toast.add({
                severity: "success",
                summary: "Success",
                detail: "Record deleted",
                life: 3000,
              });
            }
          } catch (error) {
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete record",
              life: 3000,
            });
          }
        },
        reject: () => {
          toast.add({
            severity: "info",
            summary: "Cancelled",
            detail: "Operation cancelled",
            life: 3000,
          });
        },
      });
    },
  },
]);
</script>
