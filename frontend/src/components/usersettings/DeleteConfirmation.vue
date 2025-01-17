<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :style="{ width: '450px' }"
    :closable="!isSubmitting"
    position="center"
    class="p-dialog-delete"
  >
    <template #header>
      <h3 class="text-xl font-semibold m-0">Confirmation Required</h3>
    </template>

    <form @submit.prevent="onSubmit">
      <div class="flex flex-column gap-4">
        <p class="m-0">
          All your account data will be <strong>permanently deleted.</strong> If
          you are sure, please click <strong>"Confirm"</strong> to proceed. This
          action cannot be undone.
        </p>

        <div class="flex gap-3 justify-end">
          <Button
            type="submit"
            severity="danger"
            label="Confirm"
            :loading="isSubmitting"
          />
          <Button
            type="button"
            severity="secondary"
            label="Cancel"
            :disabled="isSubmitting"
            @click="handleClose"
            :outlined="true"
          />
        </div>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { useAuth } from "@/composables/useAuth";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = ref(props.modelValue);
const isSubmitting = ref(false);
const toast = useToast();
const queryClient = useQueryClient();
const { logout } = useAuth();

// Sync dialog visibility with v-model
watch(
  () => props.modelValue,
  (newValue) => {
    dialogVisible.value = newValue;
  },
);

watch(dialogVisible, (newValue) => {
  emit("update:modelValue", newValue);
});

// Delete account mutation
const { mutate } = useMutation({
  mutationFn: () => UsersService.deleteUserMe(),
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Your account has been successfully deleted.",
      life: 3000,
    });
    logout();
    handleClose();
  },
  onError: (error: ApiError) => {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message || "Failed to delete account",
      life: 3000,
    });
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  },
});

const handleClose = () => {
  if (!isSubmitting.value) {
    dialogVisible.value = false;
    emit("update:modelValue", false);
  }
};

const onSubmit = async () => {
  isSubmitting.value = true;
  try {
    await mutate();
  } finally {
    isSubmitting.value = false;
  }
};
</script>
