<!-- Navbar.vue -->
<template>
  <div class="flex py-8 gap-4">
    <FloatLabel variant="in">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText
          id="in_label"
          :value="search"
          autocomplete="off"
          variant="filled"
          @update:modelValue="$emit('update:search', $event)"
        />
      </IconField>
      <label for="in_label">Search</label>
    </FloatLabel>

    <div class="flex-1" />

    <Button
      severity="primary"
      @click="showModal = true"
      class="text-sm md:text-base"
    >
      <i class="pi pi-plus mr-2"></i>
      Add {{ type }}
    </Button>

    <component
      :is="addModalComponent"
      v-model="showModal"
      @added="$emit('added', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, type Component } from "vue";
import Button from "primevue/button";

interface Props {
  type: string;
  addModalAs: Component;
  search: string;
}

const props = defineProps<Props>();

// define emits added element and search string
defineEmits(["added", "update:search"]);

const showModal = ref(false);

// Compute the modal component
const addModalComponent = computed(() => props.addModalAs);
</script>
