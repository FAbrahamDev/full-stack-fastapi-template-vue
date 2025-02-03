<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    @submit="onFormSubmit"
    class="flex flex-col gap-4"
  >
    <div>
      <h1 class="text-2xl font-bold text-start mb-2">Password Recovery</h1>

      <p>A password recovery email will be sent to the registered account.</p>
    </div>

    <div class="flex flex-col gap-1">
      <InputText name="email" type="email" placeholder="Email" fluid />
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

    <Button
      type="submit"
      severity="secondary"
      label="Continue"
      :loading="isPending"
    />

    <div>
      Remember your password?
      <Button
        label="Log in"
        severity="secondary"
        @click="router.push({ name: 'login' })"
        variant="link"
      />
    </div>
  </Form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/auth";
import type { FormSubmitEvent } from "@primevue/forms";
import { useMutation } from "@tanstack/vue-query";
import { loginRecoverPasswordMutation } from "@/client/@tanstack/vue-query.gen.ts";

const { isLoggedIn } = useAuthStore();
const router = useRouter();
const toast = useToast();

interface FormValues {
  email: string;
}

const initialValues = reactive<FormValues>({
  email: (router.currentRoute.value.query.email as string) || "",
});

const resolver = zodResolver(
  z.object({
    email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Must be a valid email address." }),
  }),
);

const error = ref("");

const { mutateAsync, isPending } = useMutation({
  ...loginRecoverPasswordMutation(),
  onError: (err) => {
    error.value = err.response?.data.detail
      ? (err.response?.data.detail as string)
      : "Password recovery failed";
  },
});

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isPending.value) return;

  error.value = "";

  await mutateAsync({
    path: { email: values.email },
  });

  toast.add({
    severity: "success",
    summary: "Email sent.",
    detail: "We sent an email with a link to get back into your account.",
    life: 3000,
  });

  initialValues.email = "";
};

// Route guard
if (isLoggedIn()) {
  router.push("/");
}
</script>
