<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    @submit="onFormSubmit"
    class="flex flex-col gap-4"
  >
    <div class="flex flex-col gap-1">
      <InputText name="username" type="text" placeholder="Username" />
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
      <Password
        name="password"
        placeholder="Password"
        toggleMask
        fluid
        :feedback="false"
      />
      <Message
        v-if="$form.password?.invalid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ $form.password.error?.message }}
      </Message>
    </div>
    <div class="flex justify-center">
      <RouterLink to="/recover-password" class="text-sm">
        Forgot password?
      </RouterLink>
    </div>

    <Message v-if="error" severity="error" size="small" variant="simple">
      {{ error }}
    </Message>

    <Button
      type="submit"
      severity="secondary"
      label="Log In"
      :loading="loginMutation.isPending.value"
    />

    <div>
      Don't have an account?
      <RouterLink to="/signup"> Sign up </RouterLink>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import type { BodyLoginAccessToken } from "@/client";
const { loginMutation, resetError, isLoggedIn } = useAuth();

const router = useRouter();

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

const error = ref<string>("");

interface SubmitEvent {
  valid: boolean;
  values: BodyLoginAccessToken;
}

const onFormSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid) return;
  if (loginMutation.isPending.value) return;

  resetError();

  try {
    await loginMutation.mutateAsync({ body: values });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Login failed";
  }
};

if (isLoggedIn()) {
  router.push("/");
}
</script>
