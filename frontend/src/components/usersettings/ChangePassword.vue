<template>
  <h2 class="text-lg font-semibold py-4">Change Password</h2>

  <div class="w-full md:w-1/2">
    <Form
      v-slot="$form"
      :initial-values="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="flex flex-col gap-4"
    >
      <div class="flex flex-col gap-1">
        <label for="current_password" class="block mb-2"
          >Current Password*</label
        >
        <Password
          name="current_password"
          placeholder="Current Password"
          toggleMask
          fluid
          :feedback="false"
        />
        <Message
          v-if="$form.current_password?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.current_password.error?.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-1">
        <label for="new_password" class="block mb-2">New Password*</label>
        <Password
          name="new_password"
          placeholder="New Password"
          toggleMask
          fluid
          :feedback="true"
        />
        <Message
          v-if="$form.new_password?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.new_password.error?.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-1">
        <label for="confirm_password" class="block mb-2"
          >Confirm Password*</label
        >
        <Password
          name="confirm_password"
          placeholder="Confirm Password"
          toggleMask
          fluid
          :feedback="false"
        />
        <Message
          v-if="$form.confirm_password?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.confirm_password.error?.message }}
        </Message>
      </div>

      <Message v-if="error" severity="error" size="small" variant="simple">
        {{ error }}
      </Message>

      <Button
        type="submit"
        label="Save"
        :loading="updatePasswordMutation.isPending.value"
      />
    </Form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";

import { useMutation } from "@tanstack/vue-query";
import { useToast } from "primevue/usetoast";

interface UpdatePasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const initialValues = reactive<UpdatePasswordForm>({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const resolver = zodResolver(
  z
    .object({
      current_password: z
        .string()
        .min(1, { message: "Current password is required." }),
      new_password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters." })
        .regex(/[A-Z]/, {
          message: "Password must contain at least one uppercase letter.",
        })
        .regex(/[a-z]/, {
          message: "Password must contain at least one lowercase letter.",
        })
        .regex(/[0-9]/, {
          message: "Password must contain at least one number.",
        }),
      confirm_password: z
        .string()
        .min(1, { message: "Please confirm your password." }),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    }),
);

const error = ref<string>("");
const toast = useToast();

const updatePasswordMutation = useMutation({
  mutationFn: (data: Omit<UpdatePasswordForm, "confirm_password">) =>
    UsersService.updatePasswordMe({ requestBody: data }),
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "Password updated successfully.",
      life: 3000,
    });
  },
  onError: (err: ApiError) => {
    error.value = err.message || "Failed to update password";
  },
});

interface SubmitEvent {
  valid: boolean;
  values: UpdatePasswordForm;
}

const onFormSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid) return;
  if (updatePasswordMutation.isPending.value) return;

  error.value = "";

  try {
    const { confirm_password, ...updateData } = values;
    await updatePasswordMutation.mutateAsync(updateData);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to update password";
  }
};
</script>
