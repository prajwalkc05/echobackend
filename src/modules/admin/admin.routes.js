import express from "express";
import { dashboard, getCharts, getUsers, getUserById, updatePlan, deleteUser, getAdminSettings, updateAdminSettings } from "./admin.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { adminAuth } from "../../middleware/admin.middleware.js";

const router = express.Router();

router.use(authMiddleware, adminAuth);

router.get("/dashboard", dashboard);
router.get("/charts", getCharts);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/update-plan", updatePlan);
router.delete("/users/:id", deleteUser);
router.get("/settings", getAdminSettings);
router.put("/settings", updateAdminSettings);

export default router;
