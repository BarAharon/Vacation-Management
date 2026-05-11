import { vacationRequestModel } from "../models/vacationRequestModel.js";
import { userModel } from "../models/userModel.js";

export const vacationRequestService = {
  async submitRequest({ userId, start_date, end_date, reason }) {
    const user = await userModel.findById(userId);
    if (!user) throw { status: 404, message: "User not found" };
    if (user.role !== "Requester") {
      throw { status: 403, message: "Only Requesters can submit vacation requests" };
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end < start) {
      throw { status: 400, message: "end_date must be after start_date" };
    }

    return vacationRequestModel.create({
      user: { id: userId },
      start_date,
      end_date,
      reason: reason || null,
      status: "Pending",
    });
  },

  async getRequestsByUser(userId) {
    const user = await userModel.findById(userId);
    if (!user) throw { status: 404, message: "User not found" };
    return vacationRequestModel.findByUserId(userId);
  },

  async getAllRequests(status) {
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (status && !validStatuses.includes(status)) {
      throw { status: 400, message: `status must be one of: ${validStatuses.join(", ")}` };
    }
    return vacationRequestModel.findAll(status);
  },

  async approveRequest(id) {
    const request = await vacationRequestModel.findById(id);
    if (!request) throw { status: 404, message: "Request not found" };
    if (request.status !== "Pending") {
      throw { status: 400, message: "Only Pending requests can be approved" };
    }
    await vacationRequestModel.updateStatus(id, "Approved", null);
    return vacationRequestModel.findById(id);
  },

  async rejectRequest(id, comments) {
    if (!comments || !comments.trim()) {
      throw { status: 400, message: "comments are required when rejecting a request" };
    }
    const request = await vacationRequestModel.findById(id);
    if (!request) throw { status: 404, message: "Request not found" };
    if (request.status !== "Pending") {
      throw { status: 400, message: "Only Pending requests can be rejected" };
    }
    await vacationRequestModel.updateStatus(id, "Rejected", comments);
    return vacationRequestModel.findById(id);
  },
};
