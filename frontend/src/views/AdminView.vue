<!-- Admin.vue -->
<template>
  <h1 class="text-4xl font-bold my-8">Users Management</h1>

  <Navbar type="User" :add-modal-as="AddUser" />

  <DataTable
    :value="users?.data"
    :loading="isPending"
    stripedRows
    tableStyle="min-width: 50rem"
  >
    <Column field="full_name" header="Full name" style="width: 20%">
      <template #body="slotProps">
        <div class="flex align-items-center gap-2">
          <span :class="{ 'text-gray-400': !slotProps.data.full_name }">
            {{ slotProps.data.full_name || "N/A" }}
          </span>
          <Tag
            v-if="currentUser?.id === slotProps.data.id"
            severity="info"
            value="You"
          />
        </div>
      </template>
    </Column>

    <Column field="email" header="Email" style="width: 50%">
      <template #body="slotProps">
        <span class="truncate block">{{ slotProps.data.email }}</span>
      </template>
    </Column>

    <Column field="is_superuser" header="Role" style="width: 10%">
      <template #body="slotProps">
        {{ slotProps.data.is_superuser ? "Superuser" : "User" }}
      </template>
    </Column>

    <Column field="is_active" header="Status" style="width: 10%">
      <template #body="slotProps">
        <div class="flex align-items-center gap-2">
          <span
            class="w-2 h-2 rounded-full"
            :class="slotProps.data.is_active ? 'bg-green-500' : 'bg-red-500'"
          />
          {{ slotProps.data.is_active ? "Active" : "Inactive" }}
        </div>
      </template>
    </Column>

    <Column header="Actions" style="width: 10%">
      <template #body="slotProps">
        <ActionsMenu
          type="User"
          :value="slotProps.data"
          :disabled="currentUser?.id === slotProps.data.id"
        />
      </template>
    </Column>

    <template #loading>
      <tr v-for="n in 3" :key="n">
        <td v-for="i in 5" :key="i">
          <Skeleton height="1.5rem" />
        </td>
      </tr>
    </template>
  </DataTable>

  <Paginator
    :rows="PER_PAGE"
    :total-records="users?.total || 0"
    :first="(page - 1) * PER_PAGE"
    @page="onPageChange"
    template="PrevPageLink PageLinks NextPageLink"
  />
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery, useQueryClient } from "@tanstack/vue-query";

import AddUser from "@/components/admin/AddUserModal.vue";
import ActionsMenu from "@/components/common/ActionsMenu.vue";

const PER_PAGE = 5;

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const page = computed(() => Number(route.query.page) || 1);
const currentUser = computed(() => queryClient.getQueryData(["currentUser"]));

const getUsersQueryOptions = (pageNum) => ({
  queryFn: () =>
    UsersService.readUsers({
      skip: (pageNum - 1) * PER_PAGE,
      limit: PER_PAGE,
    }),
  queryKey: ["users", { page: pageNum }],
});

const {
  data: users,
  isPending,
  isPlaceholderData,
} = useQuery(getUsersQueryOptions(page.value));

const hasNextPage = computed(
  () => !isPlaceholderData.value && users.value?.data.length === PER_PAGE,
);

const onPageChange = (event) => {
  router.push({
    query: { ...route.query, page: event.page + 1 },
  });
};

onMounted(() => {
  if (hasNextPage.value) {
    queryClient.prefetchQuery(getUsersQueryOptions(page.value + 1));
  }
});
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

:deep(.p-datatable-wrapper) {
  overflow-x: auto;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
