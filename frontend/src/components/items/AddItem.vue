<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    modal
    header="Add Item"
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
        <InputText name="title" type="text" placeholder="Title" fluid />
        <Message
          v-if="$form.title?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.title.error?.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-1">
        <InputText
          name="description"
          type="text"
          placeholder="Description"
          fluid
        />
        <Message
          v-if="$form.description?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.description.error?.message }}
        </Message>
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

import { useToast } from "primevue/usetoast";

import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { itemsCreateItemMutation } from "@/client/@tanstack/vue-query.gen.ts";
import type { FormSubmitEvent } from "@primevue/forms";

import { type ItemCreate } from "@/client";

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  // add the added event
  added: [item: ItemCreate];
}>();

const toast = useToast();
const queryClient = useQueryClient();
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const initialValues = reactive<ItemCreate>({
  title: "",
  description: "",
});

const resolver = zodResolver(
  z.object({
    title: z.string().min(1, { message: "Title is required." }),
    description: z.string().optional(),
  }),
);

const error = ref<string>("");

const mutation = useMutation({
  ...itemsCreateItemMutation(),
  onSuccess: (_data, variables) => {
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "Item created successfully.",
      life: 3000,
    });
    emit("added", _data);
    resetForm();
    onClose();
  },
  onError: (err) => {
    // For validation errors, try to extract just the error message
    const errorDetail = err.response?.data?.detail;
    if (Array.isArray(errorDetail) && errorDetail.length > 0 && errorDetail[0]?.msg) {
      // If it's a validation error array with messages, use the first message
      error.value = errorDetail[0].msg;
    } else {
      // For other errors, use the existing approach
      error.value =
        (typeof errorDetail === 'string' ? errorDetail : '') ||
        err.message ||
        "Failed to create item";
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});

const onSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid || mutation.isPending.value) return;

  error.value = "";

  await mutation.mutateAsync({ body: values as ItemCreate });
};

const resetForm = () => {
  Object.assign(initialValues, {
    title: "",
    description: "",
  });
};

const onClose = () => {
  console.log("onClose");
  resetForm();
  error.value = "";
  visible.value = false;
};
</script>
