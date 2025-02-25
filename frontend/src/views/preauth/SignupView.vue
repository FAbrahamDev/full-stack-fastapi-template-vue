<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    @submit="onFormSubmit"
    class="flex flex-col gap-4"
    novalidate
  >
    <div class="flex flex-col gap-1">
      <InputText name="full_name" type="text" placeholder="Full Name" fluid />
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

    <div class="flex flex-col gap-1">
      <Password
        name="password"
        placeholder="Password"
        fluid
        toggle-mask
        :feedback="false"
      />
      <template v-if="$form.password?.invalid">
        <Message
          v-for="(error, index) of $form.password.errors"
          :key="index"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ error.message }}
        </Message>
      </template>
    </div>

    <div class="flex flex-col gap-1">
      <Password
        name="confirm_password"
        placeholder="Confirm Password"
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
      severity="secondary"
      label="Sign Up"
      :loading="isPending"
    />

    <div>
      Already have an account?
      <Button
        label="Log in"
        severity="secondary"
        @click="router.push('/login')"
        variant="link"
      />
    </div>
  </Form>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import type { UserRegister } from "@/client";
import type { FormSubmitEvent } from "@primevue/forms";

const router = useRouter();
const { signUpMutation, resetError, error, isLoggedIn } = useAuthStore();
const { mutateAsync: signUp, isPending } = signUpMutation;

interface FormValues extends UserRegister {
  confirm_password: string;
}

const initialValues = reactive<FormValues>({
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
});

const resolver = zodResolver(
  z
    .object({
      full_name: z
        .string()
        .min(3, { message: "Full name must be at least 3 characters." }),
      email: z
        .string()
        .min(1, { message: "Email is required." })
        .email({ message: "Must be a valid email address." }),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
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
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    }),
);

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isPending) return;

  console.log(values);

  resetError();
  await signUp({ body: values as FormValues });
};

if (isLoggedIn()) {
  router.push("/");
}
</script>
