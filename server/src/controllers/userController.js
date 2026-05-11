import { userService } from "../services/userService.js";

export const userController = {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(Number(req.params.id));
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
