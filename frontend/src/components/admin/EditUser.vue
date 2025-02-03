<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    modal
    header="Edit User"
    :close-on-escape="true"
    @hide="onClose"
  >
    <Form
      v-slot="$form"
      ref="formRef"
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
          placeholder="Password (leave empty to keep current)"
          fluid
          toggle-mask
          :inputProps="{ autocomplete: 'new-password' }"
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
          :inputProps="{ autocomplete: 'new-password' }"
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
        <div class="flex items-center gap-2">
          <Checkbox name="is_superuser" :binary="true" inputId="isSuperuser" />
          <label for="is_superuser">Is superuser?</label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox name="is_active" :binary="true" inputId="isActive" />
          <label for="is_active">Is active?</label>
        </div>
      </div>

      <Message v-if="error" severity="error" size="small" variant="simple">
        {{ error }}
      </Message>

      <div class="flex gap-2 justify-end">
        <Button
          type="submit"
          label="Save"
          :loading="isPending"
          :disabled="!$form.valid || isPending || !someThingChanged"
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

import { useMutation } from "@tanstack/vue-query";
import { type UserPublic, type UserUpdate } from "@/client";
import { useToast } from "primevue/usetoast";

import { Form, type FormSubmitEvent } from "@primevue/forms";
import { usersUpdateUserMutation } from "@/client/@tanstack/vue-query.gen.ts";

interface Props {
  modelValue: boolean;
  item: UserPublic;
}

const props = defineProps<Props>();
const formRef = ref();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "edited", item: UserPublic): void;
}>();

const toast = useToast();
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

interface FormValues extends UserUpdate {
  confirm_password: string;
}

const initialValues = reactive<FormValues>({
  email: props.item.email,
  full_name: props.item.full_name || "",
  password: "",
  confirm_password: "",
  is_superuser: props.item.is_superuser,
  is_active: props.item.is_active,
});

const resolver = zodResolver(
  z
    .object({
      email: z
        .string()
        .min(1, { message: "Email is required." })
        .email({ message: "Must be a valid email address." }),
      full_name: z.string(),
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
        })
        .optional()
        .or(z.literal("")),
      confirm_password: z.string(),
      is_superuser: z.boolean(),
      is_active: z.boolean(),
    })
    .refine(
      (data) => !data.password || data.password === data.confirm_password,
      {
        message: "Passwords don't match",
        path: ["confirm_password"],
      },
    ),
);

const error = ref<string>("");

const { mutateAsync: updateUser, isPending } = useMutation({
  ...usersUpdateUserMutation(),
  onSuccess: (data, variables) => {
    emit("edited", data);
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "User updated successfully.",
      life: 3000,
    });
    onClose();
  },
  onError: (err) => {
    error.value =
      (err.response?.data?.detail as string) ||
      err.message ||
      "Failed to update user";
  },
});

const onSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isPending.value) return;

  error.value = "";
  const { confirm_password, ...submitData } = values;

  // Remove password if empty
  if (submitData.password === "") {
    delete submitData.password;
  }

  await updateUser({
    path: { user_id: props.item.id },
    body: submitData,
  });
};

const someThingChanged = computed(() => {
  const states = formRef.value?.states;
  if (!states) return false;

  const fields = {
    email: states.email.value !== props.item.email,
    full_name: states.full_name.value !== props.item.full_name,
    password: states.password.value !== "",
    confirm_password: states.confirm_password.value !== "",
    is_superuser: states.is_superuser.value !== props.item.is_superuser,
    is_active: states.is_active.value !== props.item.is_active,
  };

  return Object.values(fields).some(Boolean);
});

const resetForm = () => {
  Object.assign(initialValues, {
    email: props.item.email,
    full_name: props.item.full_name || "",
    password: "",
    confirm_password: "",
    is_superuser: props.item.is_superuser,
    is_active: props.item.is_active,
  });
};

const onClose = () => {
  resetForm();
  error.value = "";
  visible.value = false;
};
</script>
