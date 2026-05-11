import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database.js";
import { User } from "./entities/User.js";

dotenv.config();

const users = [
  { name: "Alice Johnson", role: "Requester" },
  { name: "Bob Smith", role: "Requester" },
  { name: "Carol White", role: "Requester" },
  { name: "David Manager", role: "Validator" },
  { name: "Eve Supervisor", role: "Validator" },
];

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  for (const data of users) {
    const exists = await repo.findOneBy({ name: data.name });
    if (!exists) {
      await repo.save(repo.create(data));
      console.log(`Created: ${data.name} (${data.role})`);
    } else {
      console.log(`Skipped (already exists): ${data.name}`);
    }
  }

  console.log("Seeding complete.");
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
