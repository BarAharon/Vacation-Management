import { EntitySchema } from "typeorm";

export const VacationRequest = new EntitySchema({
  name: "VacationRequest",
  tableName: "vacation_requests",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    start_date: {
      type: "date",
      nullable: false,
    },
    end_date: {
      type: "date",
      nullable: false,
    },
    reason: {
      type: "text",
      nullable: true,
    },
    status: {
      type: "enum",
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      nullable: false,
    },
    comments: {
      type: "text",
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});
