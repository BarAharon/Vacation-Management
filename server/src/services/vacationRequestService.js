import { vacationRequestModel } from "../models/vacationRequestModel.js";
import { userModel } from "../models/userModel.js";

/**
 * Service layer for vacation request business logic.
 * Handles validation, role enforcement, and state transitions.
 */
export const vacationRequestService = {
  /**
   * Submits a new vacation request on behalf of a Requester.
   *
   * Validates that:
   * - The user exists.
   * - The user has the "Requester" role.
   * - end_date is not before start_date.
   *
   * @param {object} params
   * @param {number} params.userId - ID of the user submitting the request.
   * @param {string} params.start_date - Start date in YYYY-MM-DD format.
   * @param {string} params.end_date - End date in YYYY-MM-DD format.
   * @param {string} [params.reason] - Optional reason for the vacation.
   * @returns {Promise<VacationRequest>} The newly created request.
   * @throws {{ status: 404 }} If the user is not found.
   * @throws {{ status: 403 }} If the user is not a Requester.
   * @throws {{ status: 400 }} If end_date is before start_date.
   */
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

  /**
   * Retrieves all vacation requests submitted by a specific user.
   *
   * @param {number} userId - The requester's user ID.
   * @returns {Promise<VacationRequest[]>}
   * @throws {{ status: 404 }} If the user is not found.
   */
  async getRequestsByUser(userId) {
    const user = await userModel.findById(userId);
    if (!user) throw { status: 404, message: "User not found" };
    return vacationRequestModel.findByUserId(userId);
  },

  /**
   * Retrieves all vacation requests, with an optional status filter.
   *
   * @param {string|undefined} status - Optional filter: "Pending" | "Approved" | "Rejected".
   * @returns {Promise<VacationRequest[]>}
   * @throws {{ status: 400 }} If the provided status value is not valid.
   */
  async getAllRequests(status) {
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (status && !validStatuses.includes(status)) {
      throw { status: 400, message: `status must be one of: ${validStatuses.join(", ")}` };
    }
    return vacationRequestModel.findAll(status);
  },

  /**
   * Approves a Pending vacation request.
   *
   * @param {number} id - The request ID.
   * @returns {Promise<VacationRequest>} The updated request.
   * @throws {{ status: 404 }} If the request is not found.
   * @throws {{ status: 400 }} If the request is not in Pending status.
   */
  async approveRequest(id) {
    const request = await vacationRequestModel.findById(id);
    if (!request) throw { status: 404, message: "Request not found" };
    if (request.status !== "Pending") {
      throw { status: 400, message: "Only Pending requests can be approved" };
    }
    await vacationRequestModel.updateStatus(id, "Approved", null);
    return vacationRequestModel.findById(id);
  },

  /**
   * Rejects a Pending vacation request. A comment is mandatory.
   *
   * @param {number} id - The request ID.
   * @param {string} comments - The rejection reason (required, non-empty).
   * @returns {Promise<VacationRequest>} The updated request.
   * @throws {{ status: 400 }} If comments are missing or empty.
   * @throws {{ status: 404 }} If the request is not found.
   * @throws {{ status: 400 }} If the request is not in Pending status.
   */
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
