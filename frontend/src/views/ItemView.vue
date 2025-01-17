<!-- Items.vue -->
<template>
  <div class="container">
    <h1 class="text-4xl font-bold my-8">Items Management</h1>

    <Navbar type="Item" :add-modal-as="AddItem" />

    <DataTable
      :value="items?.data"
      :loading="isPending"
      stripedRows
      tableStyle="min-width: 50rem"
      v-model:filters="filters"
    >
      <Column field="id" header="ID" style="width: 20%">
        <template #body="slotProps">
          {{ slotProps.data.id }}
        </template>
      </Column>

      <Column field="title" header="Title" style="width: 30%">
        <template #body="slotProps">
          <span class="truncate block">{{ slotProps.data.title }}</span>
        </template>
      </Column>

      <Column field="description" header="Description" style="width: 40%">
        <template #body="slotProps">
          <span
            class="truncate block"
            :class="{ 'text-gray-400': !slotProps.data.description }"
          >
            {{ slotProps.data.description || "N/A" }}
          </span>
        </template>
      </Column>

      <Column header="Actions" style="width: 10%">
        <template #body="slotProps">
          <ActionsMenu type="Item" :value="slotProps.data" />
        </template>
      </Column>

      <template #loading>
        <tr v-for="n in 3" :key="n">
          <td v-for="i in 4" :key="i">
            <Skeleton height="1.5rem" />
          </td>
        </tr>
      </template>
    </DataTable>

    <Paginator
      :rows="PER_PAGE"
      :total-records="items?.total || 0"
      :first="(page - 1) * PER_PAGE"
      @page="onPageChange"
      template="PrevPageLink PageLinks NextPageLink"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { z } from "zod";
import AddItem from "@/components/items/AddItem.vue";
import ActionsMenu from "@/components/Common/ActionsMenu.vue";
import Navbar from "@/components/Common/Navbar.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Paginator from "primevue/paginator";
import Skeleton from "primevue/skeleton";
import { ItemsService } from "@/client";

const PER_PAGE = 5;
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const filters = ref({});

const page = computed(() => Number(route.query.page) || 1);

const getItemsQueryOptions = (pageNum: number) => ({
  queryFn: () =>
    ItemsService.readItems({
      skip: (pageNum - 1) * PER_PAGE,
      limit: PER_PAGE,
    }),
  queryKey: ["items", { page: pageNum }],
});

const {
  data: items,
  isPending,
  isPlaceholderData,
} = useQuery({
  ...getItemsQueryOptions(page.value),
  placeholderData: (prevData) => prevData,
});

const hasNextPage = computed(
  () => !isPlaceholderData.value && items.value?.data.length === PER_PAGE,
);

const onPageChange = (event) => {
  router.push({
    query: { ...route.query, page: event.page + 1 },
  });
};

onMounted(() => {
  if (hasNextPage.value) {
    queryClient.prefetchQuery(getItemsQueryOptions(page.value + 1));
  }
});

// Schema validation for route
const itemsSearchSchema = z.object({
  page: z.number().catch(1),
});
</script>
