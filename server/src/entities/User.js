import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      nullable: false,
    },
    role: {
      type: "enum",
      enum: ["Requester", "Validator"],
      nullable: false,
    },
  },
  relations: {
    vacationRequests: {
      type: "one-to-many",
      target: "VacationRequest",
      inverseSide: "user",
    },
  },
});
