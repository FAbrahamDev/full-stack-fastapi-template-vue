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

  <!-- Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="isDialogVisible"
    modal
    header="Delete Account"
    :style="{ width: '450px' }"
    :closable="false"
  >
    <div class="flex flex-column gap-3">
      <p class="m-0">
        Are you sure you want to delete your account? This action cannot be
        undone.
      </p>

      <div class="flex flex-column gap-2">
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
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { useToast } from "primevue/usetoast";

const isDialogVisible = ref(false);
const confirmText = ref("");
const showError = ref(false);
const isDeleting = ref(false);
const toast = useToast();

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

const handleDelete = async () => {
  if (confirmText.value !== "DELETE") {
    showError.value = true;
    return;
  }

  isDeleting.value = true;
  try {
    // Add your delete account API call here
    // await UserService.deleteAccount()

    toast.add({
      severity: "success",
      summary: "Account Deleted",
      detail: "Your account has been successfully deleted.",
      life: 3000,
    });
    closeDialog();
    // Add any post-deletion logic (e.g., logout, redirect)
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to delete account. Please try again.",
      life: 3000,
    });
  } finally {
    isDeleting.value = false;
  }
};
</script>
