<!-- Admin.vue -->
<template>
  <h1 class="text-4xl font-bold mb-12">Users Management</h1>

  <NavBar
    type="User"
    :add-modal-as="AddUserModal"
    :query-key="readUsersQuery.queryKey"
    v-model:search="filters['global'].value"
  />

  <DataTable
    v-model:filters="filters"
    :value="users?.data"
    :loading="usersLoading"
    paginator
    :rows="10"
    :rowsPerPageOptions="[5, 10, 20, 50]"
    stripedRows
  >
    <Column field="full_name" header="Full name">
      <template #body="slotProps">
        <div class="flex items-center gap-3">
          <div :class="{ 'text-gray-400': !slotProps.data.full_name }">
            {{ slotProps.data.full_name || "N/A" }}
          </div>
          <Tag
            v-if="currentUser?.id === slotProps.data.id"
            severity="info"
            value="You"
          />
        </div>
      </template>
    </Column>

    <Column field="email" header="Email">
      <template #body="slotProps">
        <span class="truncate block">{{ slotProps.data.email }}</span>
      </template>
    </Column>

    <Column field="is_superuser" header="Role">
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

    <Column header="Actions">
      <template #body="slotProps">
        <ActionsMenu
          entityName="User"
          :query-key="readUsersQuery.queryKey"
          :value="slotProps.data"
          :edit-model-as="EditUser"
          :on-delete="deleteUser"
        />
      </template>
    </Column>

    <template #empty> No users found. </template>
    <template #loading>
      <div class="p-4 text-center">Loading user data. Pleas wait...</div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { FilterMatchMode } from "@primevue/core/api";

import AddUserModal from "@/components/admin/AddUserModal.vue";
import ActionsMenu from "@/components/common/ActionsMenu.vue";
import EditUser from "@/components/admin/EditUser.vue";
import NavBar from "@/components/common/NavBar.vue";

import {
  usersDeleteUserMutation,
  usersReadUsersOptions,
} from "@/client/@tanstack/vue-query.gen.ts";
import type { UserPublic } from "@/client";

import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
const { user: currentUser } = storeToRefs(useAuthStore());

const queryClient = useQueryClient();

const filters = ref({
  global: { value: "", matchMode: FilterMatchMode.CONTAINS },
});

const PER_PAGE = 5;
const route = useRoute();

const page = computed(() => Number(route.query.page) || 1);

const readUsersQuery = usersReadUsersOptions({
  query: {
    skip: (page.value - 1) * PER_PAGE,
    limit: PER_PAGE,
  },
});

const { data: users, isPending: usersLoading } = useQuery({
  ...readUsersQuery,
  placeholderData: (prevData) => prevData,
});

const { mutateAsync: deleteUserMutation } = useMutation({
  ...usersDeleteUserMutation(),
  onSuccess: (data, variables) => {
    queryClient.setQueryData(readUsersQuery.queryKey, (old) =>
      old
        ? {
            ...old,
            data: old.data.filter((user) => user.id !== variables.path.user_id),
          }
        : undefined,
    );
  },
});

const deleteUser = async (user: UserPublic) => {
  if (currentUser.value?.id !== user.id) {
    await deleteUserMutation({ path: { user_id: user.id } });
  }
};
</script>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
