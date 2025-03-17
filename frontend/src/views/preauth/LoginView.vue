<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    @submit="onFormSubmit"
    class="flex flex-col gap-4"
  >
    <div class="flex flex-col gap-1">
      <IconField>
        <InputIcon class="pi pi-user" />
        <InputText name="username" type="text" placeholder="Email" fluid />
      </IconField>
      <Message
        v-if="$form.username?.invalid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ $form.username.error?.message }}
      </Message>
    </div>
    <div class="flex flex-col gap-1">
      <IconField>
        <InputIcon class="pi pi-lock" />
        <Password
          name="password"
          placeholder="Password"
          toggleMask
          fluid
          :feedback="false"
        />
      </IconField>
      <Message
        v-if="$form.password?.invalid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ $form.password.error?.message }}
      </Message>
    </div>

    <div class="flex justify-between gap-2 items-start">
      <Message v-if="error" severity="error" size="small" variant="simple">
        {{ error }}
      </Message>

      <div class="flex-grow"></div>

      <Button
        class="!text-sm flex-shrink-0"
        label="Forgot password?"
        variant="link"
        @click="
          resetError();
          router.push({
            name: 'recover-password',
            query: { email: $form.username?.value },
          });
        "
      />
    </div>

    <Button
      type="submit"
      severity="secondary"
      label="Log In"
      :loading="isPending"
    />

    <div>
      Don't have an account?
      <Button
        label="Sign up"
        variant="link"
        @click="
          resetError();
          router.push('/signup');
        "
      />
    </div>
  </Form>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { storeToRefs } from "pinia";

import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";

import { useAuthStore } from "@/stores/auth";
import type { BodyLoginAccessToken } from "@/client";

import { useRouter } from "vue-router";
const router = useRouter();

const { loginMutation, resetError, isLoggedIn } = useAuthStore();
const { error } = storeToRefs(useAuthStore());
const { mutateAsync: login, isPending } = loginMutation;

const initialValues = reactive<BodyLoginAccessToken>({
  username: "",
  password: "",
});

const resolver = zodResolver(
  z.object({
    username: z.string().min(1, { message: "Username is required." }),
    password: z.string(),
  }),
);

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isPending) return;

  resetError();
  await login({ body: values as BodyLoginAccessToken });
};

if (isLoggedIn()) {
  router.push("/");
}
</script>
