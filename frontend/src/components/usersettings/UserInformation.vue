<template>
  <h2 class="text-lg font-semibold py-4">User Information</h2>

  <div class="w-full md:w-1/2">
    <!-- Display Mode -->
    <div v-if="!editMode" class="flex flex-col gap-6">
      <div class="flex flex-col">
        <label class="text-sm text-gray-500 dark:text-gray-400"
          >Full name</label
        >
        <p class="mt-1 text-base font-medium">
          {{ user?.full_name || "N/A" }}
        </p>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-500 dark:text-gray-400">Email</label>
        <p class="mt-1 text-base font-medium">
          {{ user?.email }}
        </p>
      </div>

      <div class="flex gap-3 pt-2">
        <Button
          type="button"
          label="Edit Profile"
          severity="secondary"
          icon="pi pi-user-edit"
          @click="toggleEditMode"
        />
      </div>
    </div>

    <!-- Edit Mode -->
    <Form
      v-else
      v-slot="$form"
      ref="formRef"
      :initial-values="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="flex flex-col gap-4"
    >
      <div class="flex flex-col gap-1">
        <label
          for="full_name"
          class="block mb-2 text-sm text-gray-500 dark:text-gray-400"
          >Full name</label
        >
        <InputText
          id="full_name"
          name="full_name"
          placeholder="Full name"
          :disabled="isUpdatingUser"
        />
        <Message
          v-if="$form.full_name?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.full_name.error?.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-1">
        <label
          for="email"
          class="block mb-2 text-sm text-gray-500 dark:text-gray-400"
          >Email</label
        >
        <InputText
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          :disabled="isUpdatingUser"
        />
        <Message
          v-if="$form.email?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.email.error?.message }}
        </Message>
      </div>

      <Message v-if="error" severity="error" size="small" variant="simple">
        {{ error }}
      </Message>

      <div class="flex gap-3">
        <Button
          type="submit"
          label="Save"
          severity="secondary"
          :loading="isUpdatingUser"
          :disabled="!$form.valid || isUpdatingUser || !someThingChanged"
        />
        <Button
          type="button"
          label="Cancel"
          outlined
          :disabled="isUpdatingUser"
          @click="onCancel"
        />
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Form } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";

import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useToast } from "primevue/usetoast";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import type { UserUpdateMe } from "@/client";

import {
  usersUpdateUserMeMutation,
  usersReadUserMeQueryKey,
} from "@/client/@tanstack/vue-query.gen";

const { user } = storeToRefs(useAuthStore());
const queryClient = useQueryClient();
const toast = useToast();
const editMode = ref(false);
const error = ref("");
const formRef = ref();

const initialValues = reactive({
  full_name: user.value?.full_name || "",
  email: user.value?.email || "",
});

const resolver = zodResolver(
  z.object({
    full_name: z
      .string()
      .max(30, { message: "Name must be 30 characters or less." })
      .optional(),
    email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." }),
  }),
);

const { mutateAsync: updateUserInfo, isPending: isUpdatingUser } = useMutation({
  ...usersUpdateUserMeMutation(),
  onSuccess: (data) => {
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "User updated successfully.",
      life: 3000,
    });
    editMode.value = false;
    error.value = "";
    queryClient.setQueryData(usersReadUserMeQueryKey(), data);
  },
  onError: (err) => {
    // For validation errors, try to extract just the error message
    const errorDetail = err.response?.data?.detail;
    if (Array.isArray(errorDetail) && errorDetail.length > 0 && errorDetail[0]?.msg) {
      // If it's a validation error array with messages, use the first message
      error.value = errorDetail[0].msg;
    } else {
      // For other errors, use the existing approach
      error.value =
        (typeof errorDetail === 'string' ? errorDetail : '') ||
        err.message ||
        "Failed to update user information";
    }
  },
});

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  error.value = "";
};

interface SubmitEvent {
  valid: boolean;
  values: UserUpdateMe;
}

const onFormSubmit = async ({ valid, values }: SubmitEvent) => {
  console.log("Test");

  console.log(someThingChanged.value, valid, isUpdatingUser.value);
  if (!valid || isUpdatingUser.value || !someThingChanged.value) return;

  error.value = "";

  await updateUserInfo({ body: values });
};

const onCancel = () => {
  editMode.value = false;
  error.value = "";
};

const someThingChanged = computed(() => {
  const formStates = formRef.value?.states;
  if (!formStates || !user.value) return false;

  return (
    formStates.full_name?.value !== user.value.full_name ||
    formStates.email?.value !== user.value.email
  );
});
</script>
