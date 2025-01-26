<template>
  <div class="flex py-8 gap-4">
    <FloatLabel variant="on">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText
          id="searchInputField"
          :value="search"
          autocomplete="off"
          variant="filled"
          @update:modelValue="$emit('update:search', $event)"
        />
      </IconField>
      <label for="searchInputField">Search</label>
    </FloatLabel>

    <div class="flex-1" />

    <Button
      severity="primary"
      @click="showModal = true"
      class="text-sm md:text-base"
    >
      <i class="pi pi-plus mr-2"></i>
      Add {{ type }}
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
