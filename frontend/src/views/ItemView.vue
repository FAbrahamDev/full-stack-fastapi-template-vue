<!-- Items.vue -->
<template>
  <h1 class="text-4xl font-bold mb-12">Items Management</h1>

  <NavBar
    type="Item"
    :add-modal-as="AddItem"
    :query-key="queryOptions.queryKey"
    v-model:search="filters['global'].value"
  />

  <DataTable
    v-model:filters="filters"
    :value="items?.data"
    :loading="isPending"
    paginator
    :rows="10"
    :rowsPerPageOptions="[5, 10, 20, 50]"
    stripedRows
  >
    <Column field="id" header="ID" style="width: 400px">
      <template #body="slotProps">
        {{ slotProps.data.id }}
      </template>
    </Column>

    <Column field="title" header="Title">
      <template #body="slotProps">
        <span class="truncate block">{{ slotProps.data.title }}</span>
      </template>
    </Column>

    <Column field="description" header="Description">
      <template #body="slotProps">
        <span
          class="truncate block"
          :class="{ 'text-gray-400': !slotProps.data.description }"
        >
          {{ slotProps.data.description || "N/A" }}
        </span>
      </template>
    </Column>

    <Column header="Actions" style="width: 100px">
      <template #body="slotProps">
        <ActionsMenu
          entityName="User"
          :query-key="queryOptions.queryKey"
          :value="slotProps.data"
          :edit-model-as="EditItem"
          :on-delete="deleteItem"
        />
      </template>
    </Column>

    <template #empty> No item found. </template>
    <template #loading>
      <div class="my-2" data-testid="loading-item-data">Loading item data. Please wait...</div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { FilterMatchMode } from "@primevue/core/api";

import AddItem from "@/components/items/AddItem.vue";
import ActionsMenu from "@/components/common/ActionsMenu.vue";
import EditItem from "@/components/items/EditItem.vue";
import NavBar from "@/components/common/NavBar.vue";

import {
  itemsDeleteItemMutation,
  itemsReadItemsOptions,
} from "@/client/@tanstack/vue-query.gen.ts";
import type { ItemPublic } from "@/client";

const queryClient = useQueryClient();

const filters = ref({
  global: { value: "", matchMode: FilterMatchMode.CONTAINS },
});

const PER_PAGE = 5;
const route = useRoute();

const page = computed(() => Number(route.query.page) || 1);

const queryOptions = itemsReadItemsOptions({
  query: {
    skip: (page.value - 1) * PER_PAGE,
    limit: PER_PAGE,
  },
});
const { data: items, isPending } = useQuery({
  ...queryOptions,
  placeholderData: (prevData) => prevData,
});

const { mutateAsync: deleteItemMutation } = useMutation({
  ...itemsDeleteItemMutation(),
  onSuccess: (data, variables) => {
    queryClient.setQueryData(queryOptions.queryKey, (old) =>
      old
        ? {
            ...old,
            data: old.data.filter((user) => user.id !== variables.path.id),
          }
        : undefined,
    );
  },
});

const deleteItem = async (item: ItemPublic) => {
  await deleteItemMutation({ path: { id: item.id } });
};
</script>
