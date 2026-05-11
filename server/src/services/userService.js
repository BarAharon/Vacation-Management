import { userModel } from "../models/userModel.js";

/**
 * Service layer for user-related business logic.
 */
export const userService = {
  /**
   * Returns all users in the system.
   * @returns {Promise<User[]>}
   */
  async getAllUsers() {
    return userModel.findAll();
  },

  /**
   * Returns a single user by ID.
   * @param {number} id - The user ID.
   * @returns {Promise<User>}
   * @throws {{ status: 404, message: string }} If the user does not exist.
   */
  async getUserById(id) {
    const user = await userModel.findById(id);
    if (!user) throw { status: 404, message: "User not found" };
    return user;
  },
};
