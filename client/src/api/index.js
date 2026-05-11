import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Users
export const getUsers = () => api.get("/users");

// Vacation Requests
export const submitRequest = (data) => api.post("/requests", data);
export const getRequestsByUser = (userId) => api.get(`/requests/user/${userId}`);
export const getAllRequests = (status) =>
  api.get("/requests", { params: status ? { status } : {} });
export const approveRequest = (id) => api.patch(`/requests/${id}/approve`);
export const rejectRequest = (id, comments) =>
  api.patch(`/requests/${id}/reject`, { comments });
