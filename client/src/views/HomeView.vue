<template>
  <div class="home-wrapper d-flex align-items-center justify-content-center">
    <div class="card shadow-lg border-0 p-4" style="width: 420px;">
      <div class="text-center mb-4">
        <div class="brand-icon mb-3">
          <i class="bi bi-calendar-check"></i>
        </div>
        <h3 class="fw-bold text-dark">Vacation Manager</h3>
        <p class="text-muted">Select your account to continue</p>
      </div>

      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else>
        <label class="form-label fw-semibold">Who are you?</label>
        <select v-model="selectedUser" class="form-select form-select-lg mb-4">
          <option value="" disabled>-- Select your name --</option>
          <option v-for="user in users" :key="user.id" :value="user">
            {{ user.name }} ({{ user.role }})
          </option>
        </select>

        <button
          class="btn btn-primary w-100 btn-lg fw-semibold"
          :disabled="!selectedUser"
          @click="proceed"
        >
          Continue <i class="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getUsers } from "../api/index.js";
import { store } from "../store/index.js";

const router = useRouter();
const users = ref([]);
const selectedUser = ref("");
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await getUsers();
    users.value = res.data;
  } catch {
    error.value = "Failed to load users. Is the server running?";
  } finally {
    loading.value = false;
  }
});

function proceed() {
  if (!selectedUser.value) return;
  store.setUser(selectedUser.value);
  const route = selectedUser.value.role === "Requester" ? "/requester" : "/validator";
  router.push(route);
}
</script>

<style scoped>
.home-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2035 0%, #2c3e6b 100%);
}

.brand-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}
</style>
