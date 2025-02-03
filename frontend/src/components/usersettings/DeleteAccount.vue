<template>
  <h2 class="text-lg font-semibold py-4">Delete Account</h2>
  <p class="text-gray-600">
    Permanently delete your data and everything associated with your account.
  </p>
  <Button
    severity="danger"
    label="Delete"
    class="mt-4"
    @click="showDeleteDialog"
  />

  <Dialog
    v-model:visible="isDialogVisible"
    modal
    header="Delete Account"
    :style="{ width: '450px' }"
    :closable="false"
  >
    <div class="flex flex-col gap-3">
      <p class="m-0">
        Are you sure you want to delete your account? This action cannot be
        undone.
      </p>

      <div class="flex flex-col gap-2">
        <InputText
          v-model="confirmText"
          placeholder="Type 'DELETE' to confirm"
          class="w-full"
          :class="{ 'p-invalid': showError }"
        />
        <small class="p-error" v-if="showError">
          Please type 'DELETE' to confirm account deletion
        </small>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <Button
          label="Cancel"
          severity="secondary"
          @click="closeDialog"
          :outlined="true"
        />
        <Button
          label="Delete Account"
          severity="danger"
          @click="handleDelete"
          :loading="isDeleting"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { useToast } from "primevue/usetoast";
import { useMutation } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores/auth";
import { usersDeleteUserMeMutation } from "@/client/@tanstack/vue-query.gen";

const toast = useToast();
const { logout } = useAuthStore();

const isDialogVisible = ref(false);
const confirmText = ref("");
const showError = ref(false);
const isDeleting = ref(false);

const showDeleteDialog = () => {
  isDialogVisible.value = true;
  confirmText.value = "";
  showError.value = false;
};

const closeDialog = () => {
  isDialogVisible.value = false;
  confirmText.value = "";
  showError.value = false;
};

const { mutateAsync: deleteAccount } = useMutation({
  ...usersDeleteUserMeMutation(),
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Account Deleted",
      detail: "Your account has been successfully deleted.",
      life: 3000,
    });
    closeDialog();
    logout();
  },
  onError: (error) => {
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        error.response?.data?.detail ||
        error.message ||
        "Failed to delete account. Please try again.",
      life: 3000,
    });
  },
});

const handleDelete = async () => {
  if (confirmText.value !== "DELETE") {
    showError.value = true;
    return;
  }

  isDeleting.value = true;
  try {
    await deleteAccount({});
  } finally {
    isDeleting.value = false;
  }
};
</script>
