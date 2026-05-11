import { Router } from "express";
import { vacationRequestController } from "../controllers/vacationRequestController.js";

const router = Router();

router.post("/", vacationRequestController.submit);
router.get("/", vacationRequestController.getAll);
router.get("/user/:userId", vacationRequestController.getByUser);
router.patch("/:id/approve", vacationRequestController.approve);
router.patch("/:id/reject", vacationRequestController.reject);

export default router;
