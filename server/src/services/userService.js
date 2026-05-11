import { userModel } from "../models/userModel.js";

export const userService = {
  async getAllUsers() {
    return userModel.findAll();
  },

  async getUserById(id) {
    const user = await userModel.findById(id);
    if (!user) throw { status: 404, message: "User not found" };
    return user;
  },
};
