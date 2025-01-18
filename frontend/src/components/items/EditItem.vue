<!-- EditItem.vue -->
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
          :disabled="!$form.isDirty"
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
import { ItemsService, type ItemPublic, type ItemUpdate } from "@/client";
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import { Form } from "@primevue/forms";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Message from "primevue/message";

interface Props {
  modelValue: boolean;
  item: ItemPublic;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const toast = useToast();
const queryClient = useQueryClient();
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

const mutation = useMutation({
  mutationFn: (data: ItemUpdate) =>
    ItemsService.updateItem({
      id: props.item.id,
      requestBody: data,
    }),
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Success!",
      detail: "Item updated successfully.",
      life: 3000,
    });
    onClose();
  },
  onError: (err: Error) => {
    error.value = err.message;
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});

interface SubmitEvent {
  valid: boolean;
  values: ItemUpdate;
}

const onSubmit = async ({ valid, values }: SubmitEvent) => {
  if (!valid || mutation.isPending.value) return;

  error.value = "";

  try {
    await mutation.mutateAsync(values);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to update item";
  }
};

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
  console.log(visible.value);
};
</script>
