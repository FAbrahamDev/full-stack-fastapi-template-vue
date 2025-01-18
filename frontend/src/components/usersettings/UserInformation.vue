<template>
  <h2 class="text-lg font-semibold py-4">User Information</h2>

  <div class="w-full md:w-1/2">
    <Form
      v-slot="$form"
      :initial-values="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="flex flex-col gap-4"
    >
      <div class="flex flex-col gap-1">
        <label for="full_name" class="block mb-2">Full name</label>
        <template v-if="editMode">
          <InputText
            name="full_name"
            placeholder="Full name"
            :disabled="updateUserMutation.isPending.value"
          />
          <Message
            v-if="$form.full_name?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.full_name.error?.message }}
          </Message>
        </template>
        <p v-else class="py-2 truncate max-w-[250px]">
          {{ user?.full_name || "N/A" }}
        </p>
      </div>

      <div class="flex flex-col gap-1">
        <label for="email" class="block mb-2">Email</label>
        <template v-if="editMode">
          <InputText
            name="email"
            type="email"
            placeholder="Email"
            :disabled="updateUserMutation.isPending.value"
          />
          <Message
            v-if="$form.email?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email.error?.message }}
          </Message>
        </template>
        <p v-else class="py-2 truncate max-w-[250px]">
          {{ user?.email }}
        </p>
      </div>

      <Message v-if="error" severity="error" size="small" variant="simple">
        {{ error }}
      </Message>

      <div class="flex gap-3">
        <Button
          :type="editMode ? 'submit' : 'button'"
          :label="editMode ? 'Save' : 'Edit'"
          severity="secondary"
          :loading="updateUserMutation.isPending.value"
          :disabled="
            editMode
              ? !$form.isDirty || updateUserMutation.isPending.value
              : false
          "
          @click="toggleEditMode"
        />
        <Button
          v-if="editMode"
          type="button"
          label="Cancel"
          outlined
          :disabled="updateUserMutation.isPending.value"
          @click="onCancel"
        />
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";

import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useToast } from "primevue/usetoast";
import { useAuth } from "@/composables/useAuth";

import type { UserPublic, UserUpdateMe } from "@/client";

const { user } = useAuth();
const queryClient = useQueryClient();
const toast = useToast();
const editMode = ref(false);
const error = ref("");

const initialValues = reactive<UserPublic>({
  full_name: user.value?.full_name || "",
  email: user.value?.email || "",
});

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const resolver = zodResolver(
  z.object({
    full_name: z
      .string()
      .max(30, { message: "Name must be 30 characters or less." })
      .optional(),
    email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." })
      .regex(EMAIL_PATTERN, { message: "Invalid email format." }),
  }),
);

const updateUserMutation = useMutation({
  mutationFn: (data: UserUpdateMe) =>
    UsersService.updateUserMe({ requestBody: data }),
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "User updated successfully.",
      life: 3000,
    });
    editMode.value = false;
    error.value = "";
    queryClient.invalidateQueries({ queryKey: ["user"] });
  },
  onError: (err: ApiError) => {
    error.value = err.message || "Failed to update user information";
  },
});

const toggleEditMode = () => {
  console.log("toggleEditMode");
  editMode.value = !editMode.value;
  error.value = "";
};

interface SubmitEvent {
  valid: boolean;
  values: UserUpdateMe;
}

const onFormSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid) return;
  if (updateUserMutation.isPending.value) return;

  error.value = "";

  try {
    await updateUserMutation.mutateAsync(values);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to update user information";
  }
};

const onCancel = () => {
  editMode.value = false;
  error.value = "";
  // Reset form to initial values
  initialValues.full_name = user.value?.full_name || "";
  initialValues.email = user.value?.email || "";
};
</script>
