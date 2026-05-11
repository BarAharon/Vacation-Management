import { AppDataSource } from "../config/database.js";
import { VacationRequest } from "../entities/VacationRequest.js";

const getRepo = () => AppDataSource.getRepository(VacationRequest);

export const vacationRequestModel = {
  create(data) {
    const request = getRepo().create(data);
    return getRepo().save(request);
  },

  findByUserId(userId) {
    return getRepo().find({
      where: { user: { id: userId } },
      relations: ["user"],
      order: { created_at: "DESC" },
    });
  },

  findAll(status) {
    const where = status ? { status } : {};
    return getRepo().find({
      where,
      relations: ["user"],
      order: { created_at: "DESC" },
    });
  },

  findById(id) {
    return getRepo().findOne({
      where: { id },
      relations: ["user"],
    });
  },

  updateStatus(id, status, comments) {
    return getRepo().update(id, { status, comments: comments ?? null });
  },
};
