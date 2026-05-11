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
          <div class="user-role">Validator</div>
        </div>
      </div>
      <ul class="sidebar-nav">
        <li class="active">
          <i class="bi bi-grid me-2"></i>Dashboard
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
        <h4 class="mb-0">Requests Dashboard</h4>
        <span class="text-muted">{{ today }}</span>
      </div>

      <!-- Stats Row -->
      <div class="row g-3 mb-4">
        <div class="col-sm-4">
          <div class="stat-card stat-pending">
            <div class="stat-value">{{ counts.Pending }}</div>
            <div class="stat-label">Pending</div>
            <i class="bi bi-hourglass-split stat-icon"></i>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="stat-card stat-approved">
            <div class="stat-value">{{ counts.Approved }}</div>
            <div class="stat-label">Approved</div>
            <i class="bi bi-check-circle stat-icon"></i>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="stat-card stat-rejected">
            <div class="stat-value">{{ counts.Rejected }}</div>
            <div class="stat-label">Rejected</div>
            <i class="bi bi-x-circle stat-icon"></i>
          </div>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="panel">
        <div class="panel-header d-flex justify-content-between align-items-center">
          <span><i class="bi bi-table me-2"></i>All Vacation Requests</span>
          <div class="d-flex gap-2">
            <!-- Filter buttons -->
            <button
              v-for="f in filters"
              :key="f.value"
              class="btn btn-sm"
              :class="activeFilter === f.value ? 'btn-primary' : 'btn-outline-secondary'"
              @click="setFilter(f.value)"
            >
              {{ f.label }}
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="loadRequests">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        <div class="panel-body p-0">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else-if="requests.length === 0" class="empty-state">
            <i class="bi bi-inbox"></i>
            <p>No requests found{{ activeFilter ? ` with status "${activeFilter}"` : "" }}.</p>
          </div>
          <table v-else class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Comments</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in requests" :key="req.id">
                <td>
                  <div class="fw-semibold">{{ req.user?.name }}</div>
                </td>
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
                <td>
                  <div v-if="req.status === 'Pending'" class="d-flex gap-1">
                    <button
                      class="btn btn-sm btn-success"
                      :disabled="actionLoading === req.id"
                      @click="handleApprove(req.id)"
                    >
                      <i class="bi bi-check"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      :disabled="actionLoading === req.id"
                      @click="openReject(req.id)"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                  <span v-else class="text-muted small">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  <!-- Reject Modal -->
  <RejectModal
    v-if="rejectTarget !== null"
    @confirm="handleReject"
    @close="rejectTarget = null"
  />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { store } from "../store/index.js";
import { getAllRequests, approveRequest, rejectRequest } from "../api/index.js";
import StatusBadge from "../components/StatusBadge.vue";
import RejectModal from "../components/RejectModal.vue";

const router = useRouter();
const requests = ref([]);
const loading = ref(false);
const actionLoading = ref(null);
const activeFilter = ref("");
const rejectTarget = ref(null);

const filters = [
  { label: "All", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const initials = computed(() =>
  store.currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
);

const counts = computed(() => ({
  Pending: requests.value.filter((r) => r.status === "Pending").length,
  Approved: requests.value.filter((r) => r.status === "Approved").length,
  Rejected: requests.value.filter((r) => r.status === "Rejected").length,
}));

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function daysBetween(start, end) {
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

async function loadRequests() {
  loading.value = true;
  try {
    const res = await getAllRequests(activeFilter.value || undefined);
    requests.value = res.data;
  } finally {
    loading.value = false;
  }
}

function setFilter(status) {
  activeFilter.value = status;
  loadRequests();
}

async function handleApprove(id) {
  actionLoading.value = id;
  try {
    await approveRequest(id);
    await loadRequests();
  } finally {
    actionLoading.value = null;
  }
}

function openReject(id) {
  rejectTarget.value = id;
}

async function handleReject(comments) {
  const id = rejectTarget.value;
  rejectTarget.value = null;
  actionLoading.value = id;
  try {
    await rejectRequest(id, comments);
    await loadRequests();
  } finally {
    actionLoading.value = null;
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
  background: #2ecc71;
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

/* Stat cards */
.stat-card {
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.stat-pending { background: linear-gradient(135deg, #f39c12, #e67e22); }
.stat-approved { background: linear-gradient(135deg, #27ae60, #2ecc71); }
.stat-rejected { background: linear-gradient(135deg, #c0392b, #e74c3c); }

.stat-value { font-size: 2.2rem; font-weight: 700; line-height: 1; }
.stat-label { font-size: 0.85rem; opacity: 0.9; margin-top: 0.25rem; }

.stat-icon {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2.5rem;
  opacity: 0.25;
}

.panel { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
.panel-header { padding: 1rem 1.5rem; font-weight: 600; border-bottom: 1px solid #eee; background: #fafafa; }

.table th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888; border-bottom: 2px solid #f0f0f0; }
.table td { vertical-align: middle; border-color: #f5f6fa; }

.empty-state { text-align: center; padding: 4rem 2rem; color: #aaa; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 1rem; }
</style>
