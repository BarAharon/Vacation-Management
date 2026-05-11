import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";

const getRepo = () => AppDataSource.getRepository(User);

/**
 * Data access layer for the User entity.
 * All database operations for users go through this model.
 */
export const userModel = {
  /**
   * Retrieves all users from the database.
   * @returns {Promise<User[]>}
   */
  findAll() {
    return getRepo().find();
  },

  /**
   * Finds a single user by their primary key.
   * @param {number} id - The user ID.
   * @returns {Promise<User|null>} The user, or null if not found.
   */
  findById(id) {
    return getRepo().findOneBy({ id });
  },
};
