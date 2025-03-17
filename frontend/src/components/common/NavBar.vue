<template>
  <div class="flex flex-col sm:flex-row py-4 sm:py-6 md:py-8 gap-3 sm:gap-4">
    <FloatLabel variant="on" class="w-full sm:w-auto">
      <IconField class="w-full">
        <InputIcon class="pi pi-search" />
        <InputText
          id="searchInputField"
          :value="search"
          autocomplete="off"
          variant="filled"
          class="w-full"
          @update:modelValue="$emit('update:search', $event)"
        />
      </IconField>
      <label for="searchInputField">Search</label>
    </FloatLabel>

    <div class="flex-1 hidden sm:block" />

    <Button
      severity="primary"
      @click="showModal = true"
      class="text-sm md:text-base w-full sm:w-auto mt-2 sm:mt-0"
    >
      <i class="pi pi-plus mr-2"></i>
      <span class="hidden xs:inline">Add {{ type }}</span>
      <span class="xs:hidden">Add</span>
    </Button>

    <component :is="addModalComponent" v-model="showModal" @added="addItem" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from "vue";
import Button from "primevue/button";
import type {
  DatabasePublic,
  EnumeratedData,
  OpenAPIQueryKey,
} from "@/assets/scripts/types.ts";

import { useQueryClient } from "@tanstack/vue-query";
const queryClient = useQueryClient();

interface Props {
  type: string;
  addModalAs: Component;
  search: string;
  queryKey?: OpenAPIQueryKey;
}

const props = defineProps<Props>();

// define emits added element and search string
const emit = defineEmits(["added", "update:search"]);

const showModal = ref(false);

// Compute the modal component
const addModalComponent = computed(() => props.addModalAs);

const addItem = (item: DatabasePublic) => {
  if (props.queryKey) {
    queryClient.setQueryData<EnumeratedData>(
      props.queryKey as readonly unknown[],
      (old) =>
        old
          ? {
              ...old,
              data: [item, ...old.data],
              count: (old.count ?? 0) + 1,
            }
          : {
              data: [item],
              count: 1,
            },
    );
  }
  emit("added", item);
};
</script>

<style scoped>
@media (max-width: 400px) {
  :deep(.p-inputtext) {
    font-size: 0.875rem;
    padding: 0.5rem;
  }

  :deep(.p-button) {
    padding: 0.5rem 0.75rem;
  }
}

/* Custom breakpoint for extra small devices */
@media (min-width: 400px) {
  .xs\:inline {
    display: inline;
  }

  .xs\:hidden {
    display: none;
  }
}
</style>
