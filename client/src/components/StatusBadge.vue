<template>
  <span class="badge" :class="badgeClass">{{ status }}</span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: { type: String, required: true },
});

const badgeClass = computed(() => ({
  "bg-warning text-dark": props.status === "Pending",
  "bg-success": props.status === "Approved",
  "bg-danger": props.status === "Rejected",
}));
</script>
