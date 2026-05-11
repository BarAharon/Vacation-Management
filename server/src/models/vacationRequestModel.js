import { AppDataSource } from "../config/database.js";
import { VacationRequest } from "../entities/VacationRequest.js";

const getRepo = () => AppDataSource.getRepository(VacationRequest);

/**
 * Data access layer for the VacationRequest entity.
 * All database operations for vacation requests go through this model.
 */
export const vacationRequestModel = {
  /**
   * Creates and persists a new vacation request.
   * @param {object} data - The request data (user, start_date, end_date, reason, status).
   * @returns {Promise<VacationRequest>} The saved request.
   */
  create(data) {
    const request = getRepo().create(data);
    return getRepo().save(request);
  },

  /**
   * Retrieves all vacation requests belonging to a specific user, newest first.
   * @param {number} userId - The ID of the user (requester).
   * @returns {Promise<VacationRequest[]>}
   */
  findByUserId(userId) {
    return getRepo().find({
      where: { user: { id: userId } },
      relations: ["user"],
      order: { created_at: "DESC" },
    });
  },

  /**
   * Retrieves all vacation requests, optionally filtered by status, newest first.
   * @param {string|undefined} status - Optional status filter ("Pending" | "Approved" | "Rejected").
   * @returns {Promise<VacationRequest[]>}
   */
  findAll(status) {
    const where = status ? { status } : {};
    return getRepo().find({
      where,
      relations: ["user"],
      order: { created_at: "DESC" },
    });
  },

  /**
   * Finds a single vacation request by its primary key, including the related user.
   * @param {number} id - The request ID.
   * @returns {Promise<VacationRequest|null>}
   */
  findById(id) {
    return getRepo().findOne({
      where: { id },
      relations: ["user"],
    });
  },

  /**
   * Updates the status and optional comment of a vacation request.
   * @param {number} id - The request ID.
   * @param {string} status - The new status ("Approved" | "Rejected").
   * @param {string|null} comments - Rejection comment, or null when approving.
   * @returns {Promise<import("typeorm").UpdateResult>}
   */
  updateStatus(id, status, comments) {
    return getRepo().update(id, { status, comments: comments ?? null });
  },
};
