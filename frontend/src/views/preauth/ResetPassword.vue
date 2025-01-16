<template>
  <Form v-slot="$form" :initial-values="initialValues" :resolver="resolver" @submit="onFormSubmit" class="flex flex-col gap-4">
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

    <Button type="submit" severity="secondary" label="Reset Password" />
  </Form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn } = useAuth()
const router = useRouter()
const toast = useToast()

interface FormValues {
  new_password: string
  confirm_password: string
}

const initialValues = reactive<FormValues>({
  new_password: '',
  confirm_password: ''
})

const resolver = zodResolver(
  z.object({
    new_password: z.string()
      .min(3, { message: 'Minimum 3 characters.' })
      .refine((value) => /[a-z]/.test(value), {
        message: 'Must have a lowercase letter.'
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: 'Must have an uppercase letter.'
      })
      .refine((value) => /\d/.test(value), {
        message: 'Must have a number.'
      }),
    confirm_password: z.string()
  }).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })
)

const error = ref<string>('')

interface SubmitEvent {
  valid: boolean
  values: FormValues
}

const onFormSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid) return

  const token = new URLSearchParams(window.location.search).get('token')
  if (!token) {
    error.value = 'Reset token is missing'
    return
  }

  try {
    await LoginService.resetPassword({
      requestBody: {
        new_password: values.new_password,
        token
      }
    })

    toast.add({
      severity: 'success',
      summary: 'Success!',
      detail: 'Password updated successfully.',
      life: 3000
    })

    initialValues.new_password = ''
    initialValues.confirm_password = ''

    router.push('/login')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Password reset failed'
  }
}

// Route guard
if (isLoggedIn()) {
  router.push('/')
}
</script>
