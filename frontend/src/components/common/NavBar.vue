<!-- Navbar.vue -->
<template>
  <div class="flex py-8 gap-4">
    <!-- TODO: Complete search functionality -->
    <!-- <span class="relative w-full md:w-auto">
      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <i class="pi pi-search"></i>
      </span>
      <InputText
        type="text"
        placeholder="Search"
        class="pl-10 w-full md:w-auto text-sm md:text-base rounded-lg"
      />
    </span> -->

    <Button
      severity="primary"
      @click="showModal = true"
      class="text-sm md:text-base"
    >
      <i class="pi pi-plus mr-2"></i>
      Add {{ type }}
    </Button>

    <component :is="addModalComponent" v-model="showModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed } from "vue";
import Button from "primevue/button";
// import InputText from 'primevue/inputtext'

interface Props {
  type: string;
  addModalAs: any; // Component type
}

const props = defineProps<Props>();

const showModal = ref(false);

// Compute the modal component
const addModalComponent = computed(() => props.addModalAs);
</script>

<style scoped>
/* Any additional styles can go here */
</style>
