<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    @submit="onFormSubmit"
    class="flex flex-col gap-4"
  >
    <h1 class="text-2xl font-bold text-center mb-2">Reset Password</h1>

    <p class="text-center">
      Please enter your new password and confirm it to reset your password.
    </p>

    <div class="flex flex-col gap-1">
      <label for="new_password">Set Password</label>
      <Password
        id="new_password"
        name="new_password"
        placeholder="Password"
        toggleMask
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
      <label for="confirm_password">Confirm Password</label>
      <Password
        id="confirm_password"
        name="confirm_password"
        placeholder="Confirm Password"
        toggleMask
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
      severity="secondary"
      label="Reset Password"
      :loading="isPending"
    />
  </Form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/auth";
import { useMutation } from "@tanstack/vue-query";
import { loginResetPasswordMutation } from "@/client/@tanstack/vue-query.gen.ts";

const { isLoggedIn } = useAuthStore();
const router = useRouter();
const toast = useToast();

interface FormValues {
  new_password: string;
  confirm_password: string;
}

const initialValues = reactive<FormValues>({
  new_password: "",
  confirm_password: "",
});

const resolver = zodResolver(
  z
    .object({
      new_password: z
        .string()
        .min(3, { message: "Minimum 3 characters." })
        .refine((value) => /[a-z]/.test(value), {
          message: "Must have a lowercase letter.",
        })
        .refine((value) => /[A-Z]/.test(value), {
          message: "Must have an uppercase letter.",
        })
        .refine((value) => /\d/.test(value), {
          message: "Must have a number.",
        }),
      confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    }),
);

const error = ref<string>("");

interface SubmitEvent {
  valid: boolean;
  values: FormValues;
}

const { mutateAsync, isPending } = useMutation({
  ...loginResetPasswordMutation(),
  onError: (err) => {
    error.value = err.response?.data.detail
      ? (err.response?.data.detail as string)
      : "Password recovery failed";
  },
});

const onFormSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid || isPending.value) return;

  const token = router.currentRoute.value.query.token as string;
  if (!token) {
    error.value = "Reset token is missing";
    return;
  }

  await mutateAsync({
    body: {
      new_password: values.new_password,
      token,
    },
  });

  toast.add({
    severity: "success",
    summary: "Success!",
    detail: "Password updated successfully.",
    life: 3000,
  });

  initialValues.new_password = "";
  initialValues.confirm_password = "";

  router.push("/login");
};

// Route guard
if (isLoggedIn()) {
  router.push("/");
}
</script>
