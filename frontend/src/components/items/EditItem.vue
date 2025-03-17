<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: '450px' }"
    modal
    header="Edit Item"
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
import { type ItemPublic, type ItemUpdate } from "@/client";
import { useToast } from "primevue/usetoast";

import { Form, type FormSubmitEvent } from "@primevue/forms";
import { itemsUpdateItemMutation } from "@/client/@tanstack/vue-query.gen.ts";

interface Props {
  modelValue: boolean;
  item: ItemPublic;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "edited", item: ItemPublic): void;
}>();

const toast = useToast();
const formRef = ref();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const initialValues = reactive<ItemUpdate>({
  title: props.item.title,
  description: props.item.description || "",
});

const resolver = zodResolver(
  z.object({
    title: z.string().min(1, { message: "Title is required." }),
    description: z.string().optional(),
  }),
);

const error = ref<string>("");

const { mutateAsync: updateItem, isPending } = useMutation({
  ...itemsUpdateItemMutation(),
  onSuccess: (data, variables) => {
    emit("edited", data);
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "Item updated successfully.",
      life: 3000,
    });
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
        "Failed to update item";
    }
  },
});

const onSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isPending.value) return;

  error.value = "";

  await updateItem({
    path: { id: props.item.id },
    body: values,
  });
};

const someThingChanged = computed(
  () =>
    formRef.value?.states.title.value !== props.item.title ||
    formRef.value?.states.description.value !== props.item.description,
);

const resetForm = () => {
  Object.assign(initialValues, {
    title: props.item.title,
    description: props.item.description || "",
  });
};

const onClose = () => {
  resetForm();
  error.value = "";
  visible.value = false;
};
</script>
