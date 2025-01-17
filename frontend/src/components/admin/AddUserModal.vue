<!-- AddUser.vue -->
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
        <InputText name="full_name" type="text" placeholder="Full name" fluid />
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
        <div class="field-checkbox">
          <Checkbox name="is_superuser" :binary="true" id="isSuperuser" />
          <label for="isSuperuser" class="ml-2">Is superuser?</label>
        </div>
        <div class="field-checkbox">
          <Checkbox name="is_active" :binary="true" id="isActive" />
          <label for="isActive" class="ml-2">Is active?</label>
        </div>
      </div>

      <Message v-if="error" severity="error" size="small" variant="simple">
        {{ error }}
      </Message>

      <div class="flex gap-2 justify-end">
        <Button
          type="submit"
          label="Save"
          :loading="mutation.isPending.value"
        />
        <Button label="Cancel" severity="secondary" @click="onClose" />
      </div>
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useToast } from "primevue/usetoast";
import { Form } from "@primevue/forms";
import { usersCreateUserMutation } from "@/client/@tanstack/vue-query.gen.ts";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const toast = useToast();
const queryClient = useQueryClient();
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

interface FormValues {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
  is_superuser: boolean;
  is_active: boolean;
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
        .min(8, { message: "Password must be at least 8 characters." })
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

const mutation = useMutation({
  ...usersCreateUserMutation(),
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "User created successfully.",
      life: 3000,
    });
    resetForm();
    onClose();
  },
  onError: (err: Error) => {
    error.value = err.message;
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});

interface SubmitEvent {
  valid: boolean;
  values: FormValues;
}

const onSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid || mutation.isPending.value) return;

  error.value = "";
  const { confirm_password, ...submitData } = values;

  try {
    await mutation.mutateAsync(submitData);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to create user";
  }
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
