import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";

const getRepo = () => AppDataSource.getRepository(User);

export const userModel = {
  findAll() {
    return getRepo().find();
  },

  findById(id) {
    return getRepo().findOneBy({ id });
  },
};
