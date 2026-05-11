<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="$emit('close')">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <i class="bi bi-x-circle me-2"></i>Reject Request
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body p-4">
          <p class="text-muted mb-3">
            Please provide a reason for rejecting this request. This comment will be visible to the employee.
          </p>
          <label class="form-label fw-semibold">Comment <span class="text-danger">*</span></label>
          <textarea
            v-model="comment"
            class="form-control"
            rows="4"
            placeholder="Enter rejection reason..."
            :class="{ 'is-invalid': showError }"
          ></textarea>
          <div class="invalid-feedback">Comment is required to reject a request.</div>
        </div>
        <div class="modal-footer border-0 px-4 pb-4">
          <button class="btn btn-light px-4" @click="$emit('close')">Cancel</button>
          <button class="btn btn-danger px-4" @click="handleReject">
            <i class="bi bi-x-circle me-1"></i>Reject Request
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["confirm", "close"]);

const comment = ref("");
const showError = ref(false);

function handleReject() {
  if (!comment.value.trim()) {
    showError.value = true;
    return;
  }
  emit("confirm", comment.value.trim());
}
</script>
