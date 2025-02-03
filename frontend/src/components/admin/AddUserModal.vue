<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    modal
    header="Add User"
    :close-on-escape="true"
    @hide="onClose"
  >
    <Form
      v-slot="$form"
      :initial-values="initialValues"
      :resolver="resolver"
      @submit="onSubmit"
      class="flex flex-col gap-4"
    >
      <div class="flex flex-col gap-1">
        <InputText
          name="email"
          type="email"
          placeholder="Email"
          fluid
          autocomplete="email"
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

      <div class="flex flex-col gap-1">
        <InputText
          name="full_name"
          type="text"
          placeholder="Full name"
          fluid
          autocomplete="username"
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
        <Password
          name="password"
          placeholder="Password"
          fluid
          toggle-mask
          :feedback="false"
          :inputProps="{ autocomplete: 'new-password' }"
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
          toggle-mask
          :feedback="false"
          :inputProps="{ autocomplete: 'new-password' }"
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

      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <Checkbox name="is_superuser" :binary="true" inputId="is_superuser" />
          <label for="is_superuser">Is superuser?</label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox name="is_active" :binary="true" inputId="is_active" />
          <label for="is_active">Is active?</label>
        </div>
      </div>

      <Message v-if="error" severity="error" size="small" variant="simple">
        {{ error }}
      </Message>

      <div class="flex gap-2 justify-end">
        <Button type="submit" label="Save" :loading="isPending" />
        <Button label="Cancel" severity="secondary" @click="onClose" />
      </div>
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { computed, reactive, ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/vue-query";
import { useToast } from "primevue/usetoast";
import { usersCreateUserMutation } from "@/client/@tanstack/vue-query.gen.ts";
import type { UserCreate, UserPublic } from "@/client";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "added", user: UserPublic): void;
}>();

const toast = useToast();
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

interface FormValues extends UserCreate {
  confirm_password: string;
}

const initialValues = reactive<FormValues>({
  email: "",
  full_name: "",
  password: "",
  confirm_password: "",
  is_superuser: false,
  is_active: false,
});

const resolver = zodResolver(
  z
    .object({
      email: z
        .string()
        .min(1, { message: "Email is required." })
        .email({ message: "Must be a valid email address." }),
      full_name: z
        .string()
        .min(3, { message: "Full name must be at least 3 characters." }),
      password: z
        .string()
        .min(3, { message: "Password must be at least 3 characters." })
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
      is_superuser: z.boolean(),
      is_active: z.boolean(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    }),
);

const error = ref<string>("");

const { mutateAsync: createUser, isPending } = useMutation({
  ...usersCreateUserMutation(),
  onSuccess: (data) => {
    console.log(data);
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "User created successfully.",
      life: 3000,
    });
    emit("added", data);
    resetForm();
    onClose();
  },
  onError: (err) => {
    error.value = (err.response?.data?.detail as string) || err.message;
  },
});

const onSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isPending.value) return;

  console.log(values);

  error.value = "";
  const { confirm_password, ...submitData } = values;

  await createUser({
    body: submitData as UserCreate,
  });
};

const resetForm = () => {
  Object.assign(initialValues, {
    email: "",
    full_name: "",
    password: "",
    confirm_password: "",
    is_superuser: false,
    is_active: false,
  });
};

const onClose = () => {
  resetForm();
  error.value = "";
  visible.value = false;
};
</script>
