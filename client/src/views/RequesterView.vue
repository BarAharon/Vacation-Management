<template>
  <div class="page-wrapper">
    <!-- Sidebar -->
    <nav class="sidebar">
      <div class="sidebar-brand">
        <i class="bi bi-calendar-check me-2"></i>
        <span>Vacation Manager</span>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar">{{ initials }}</div>
        <div>
          <div class="user-name">{{ store.currentUser.name }}</div>
          <div class="user-role">Requester</div>
        </div>
      </div>
      <ul class="sidebar-nav">
        <li :class="{ active: activeTab === 'form' }" @click="activeTab = 'form'">
          <i class="bi bi-plus-circle me-2"></i>New Request
        </li>
        <li :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
          <i class="bi bi-list-ul me-2"></i>My Requests
        </li>
      </ul>
      <div class="sidebar-footer">
        <button class="btn-logout" @click="logout">
          <i class="bi bi-box-arrow-left me-2"></i>Logout
        </button>
      </div>
    </nav>

    <!-- Main content -->
    <main class="main-content">
      <div class="content-header">
        <h4 class="mb-0">{{ activeTab === "form" ? "New Vacation Request" : "My Requests" }}</h4>
        <span class="text-muted">{{ today }}</span>
      </div>

      <!-- Request Form -->
      <div v-if="activeTab === 'form'" class="panel">
        <div class="panel-header">
          <i class="bi bi-calendar-plus me-2"></i>Submit a Request
        </div>
        <div class="panel-body">
          <div v-if="formSuccess" class="alert alert-success d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill"></i>
            Request submitted successfully!
          </div>
          <div v-if="formError" class="alert alert-danger">{{ formError }}</div>

          <form @submit.prevent="submitRequest">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Start Date <span class="text-danger">*</span></label>
                <input
                  v-model="form.start_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v.start_date }"
                  :min="todayISO"
                />
                <div class="invalid-feedback">Start date is required.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">End Date <span class="text-danger">*</span></label>
                <input
                  v-model="form.end_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v.end_date }"
                  :min="form.start_date || todayISO"
                />
                <div class="invalid-feedback">End date is required and must be after start date.</div>
              </div>
              <div class="col-12">
                <label class="form-label">Reason <span class="text-muted">(optional)</span></label>
                <textarea
                  v-model="form.reason"
                  class="form-control"
                  rows="3"
                  placeholder="Describe the reason for your vacation..."
                ></textarea>
              </div>
              <div class="col-12">
                <button type="submit" class="btn btn-primary px-4" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-send me-2"></i>
                  Submit Request
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- My Requests List -->
      <div v-if="activeTab === 'list'" class="panel">
        <div class="panel-header d-flex justify-content-between align-items-center">
          <span><i class="bi bi-list-ul me-2"></i>My Vacation Requests</span>
          <button class="btn btn-sm btn-outline-primary" @click="loadRequests">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        <div class="panel-body p-0">
          <div v-if="loadingRequests" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else-if="requests.length === 0" class="empty-state">
            <i class="bi bi-inbox"></i>
            <p>No requests yet. Submit your first vacation request!</p>
            <button class="btn btn-primary btn-sm" @click="activeTab = 'form'">New Request</button>
          </div>
          <table v-else class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Period</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Comments</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in requests" :key="req.id">
                <td>
                  <div class="fw-semibold">{{ formatDate(req.start_date) }}</div>
                  <div class="text-muted small">to {{ formatDate(req.end_date) }}</div>
                </td>
                <td>{{ daysBetween(req.start_date, req.end_date) }} days</td>
                <td>{{ req.reason || "—" }}</td>
                <td><StatusBadge :status="req.status" /></td>
                <td>
                  <span v-if="req.comments" class="text-danger small">{{ req.comments }}</span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td class="text-muted small">{{ formatDate(req.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { store } from "../store/index.js";
import { submitRequest as apiSubmit, getRequestsByUser } from "../api/index.js";
import StatusBadge from "../components/StatusBadge.vue";

const router = useRouter();
const activeTab = ref("form");
const requests = ref([]);
const loadingRequests = ref(false);
const submitting = ref(false);
const formSuccess = ref(false);
const formError = ref(null);

const form = ref({ start_date: "", end_date: "", reason: "" });
const v = ref({ start_date: false, end_date: false });

const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const todayISO = new Date().toISOString().split("T")[0];

const initials = computed(() =>
  store.currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
);

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function daysBetween(start, end) {
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

async function loadRequests() {
  loadingRequests.value = true;
  try {
    const res = await getRequestsByUser(store.currentUser.id);
    requests.value = res.data;
  } finally {
    loadingRequests.value = false;
  }
}

async function submitRequest() {
  v.value.start_date = !form.value.start_date;
  v.value.end_date = !form.value.end_date || form.value.end_date < form.value.start_date;
  if (v.value.start_date || v.value.end_date) return;

  submitting.value = true;
  formSuccess.value = false;
  formError.value = null;

  try {
    await apiSubmit({
      userId: store.currentUser.id,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      reason: form.value.reason || undefined,
    });
    formSuccess.value = true;
    form.value = { start_date: "", end_date: "", reason: "" };
  } catch (err) {
    formError.value = err.response?.data?.message || "Failed to submit request.";
  } finally {
    submitting.value = false;
  }
}

function logout() {
  store.clearUser();
  router.push("/");
}

onMounted(loadRequests);
</script>

<style scoped>
.page-wrapper { display: flex; min-height: 100vh; }

.sidebar {
  width: 250px;
  min-height: 100vh;
  background: #1a2035;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-brand {
  padding: 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
}

.sidebar-user {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1a73e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.user-name { font-weight: 600; font-size: 0.9rem; }
.user-role { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

.sidebar-nav { list-style: none; padding: 1rem 0; margin: 0; flex: 1; }

.sidebar-nav li {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  transition: all 0.2s;
}

.sidebar-nav li:hover { background: rgba(255,255,255,0.07); color: #fff; }
.sidebar-nav li.active { background: rgba(26,115,232,0.25); color: #fff; border-left: 3px solid #1a73e8; }

.sidebar-footer { padding: 1.25rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }

.btn-logout {
  background: none;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.7);
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  width: 100%;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.btn-logout:hover { background: rgba(255,255,255,0.1); color: #fff; }

.main-content { flex: 1; background: #f5f6fa; padding: 2rem; }

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
.panel-header { padding: 1rem 1.5rem; font-weight: 600; border-bottom: 1px solid #eee; background: #fafafa; }
.panel-body { padding: 1.5rem; }

.table th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888; border-bottom: 2px solid #f0f0f0; }
.table td { vertical-align: middle; border-color: #f5f6fa; }

.empty-state { text-align: center; padding: 4rem 2rem; color: #aaa; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 1rem; }
</style>
