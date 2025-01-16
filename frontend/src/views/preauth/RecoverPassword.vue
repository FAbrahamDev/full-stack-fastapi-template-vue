<template>
  <Form v-slot="$form" :initial-values="initialValues" :resolver="resolver" @submit="onFormSubmit" class="flex flex-col gap-4">
    <h1 class="text-2xl font-bold text-center mb-2">Password Recovery</h1>

    <p>
      A password recovery email will be sent to the registered account.
    </p>

    <div class="flex flex-col gap-1">
      <InputText
        name="email"
        type="email"
        placeholder="Email"
        fluid
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

    <Button
      type="submit"
      severity="secondary"
      label="Continue"
      :loading="isLoading"
    />

    <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="router.push('/login')" variant="text" />
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
  email: string
}

const initialValues = reactive<FormValues>({
  email: ''
})

const resolver = zodResolver(
  z.object({
    email: z.string()
      .min(1, { message: 'Email is required.' })
      .email({ message: 'Must be a valid email address.' })
  })
)

const error = ref<string>('')
const isLoading = ref(false)

interface SubmitEvent {
  valid: boolean
  values: FormValues
}

const onFormSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid) return
  if (isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    await LoginService.recoverPassword({
      email: values.email
    })

    toast.add({
      severity: 'success',
      summary: 'Email sent.',
      detail: 'We sent an email with a link to get back into your account.',
      life: 3000
    })

    initialValues.email = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Password recovery failed'
  } finally {
    isLoading.value = false
  }
}

// Route guard
if (isLoggedIn()) {
  router.push('/')
}
</script>
