<template>
  <Form v-slot="$form" :initial-values="initialValues" :resolver="resolver" @submit="onFormSubmit" class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <InputText name="username" type="text" placeholder="Username" />
      <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">
        {{ $form.username.error?.message }}
      </Message>
    </div>
    <div class="flex flex-col gap-1">
      <Password name="password" placeholder="Password" toggleMask fluid :feedback="false" />
      <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
        {{ $form.password.error?.message }}
      </Message>
    </div>
    <div class="flex justify-center">
      <RouterLink
        to="/recover-password"
        class="text-sm"
      >
        Forgot password?
      </RouterLink>
    </div>

    <Message v-if="error" severity="error" size="small" variant="simple">
      {{ error }}
    </Message>

    <Button type="submit" severity="secondary" label="Log In" />

    <div>
      Don't have an account?
      <RouterLink
        to="/signup"
      >
        Sign up
      </RouterLink>
    </div>
  </Form>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
const { loginMutation, resetError, isLoggedIn } = useAuth()


const router = useRouter()

interface FormValues {
  username: string;
  password: string;
}

interface FormErrors {
  username?: Array<{ message: string }>;
  password?: Array<{ message: string }>;
}

const initialValues = reactive<FormValues>({
  username: '',
  password: ''
});

const resolver = zodResolver(
  z.object({
    username: z.string().min(1, { message: 'Username is required.' }),
    password: z
      .string()
      .min(3, { message: 'Minimum 3 characters.' })
      .refine((value) => /[a-z]/.test(value), {
        message: 'Must have a lowercase letter.'
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: 'Must have an uppercase letter.'
      })
      .refine((value) => /d/.test(value), {
        message: 'Must have a number.'
      })
  })
);

const error = ref<string>('');

interface SubmitEvent {
  valid: boolean;
  values: FormValues;
}

const onFormSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid) return;
  if (loginMutation.isPending) return;

  resetError()

  try {
    await loginMutation.mutateAsync(values)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  }
};

if (isLoggedIn()) {
  router.push('/')
}
</script>
