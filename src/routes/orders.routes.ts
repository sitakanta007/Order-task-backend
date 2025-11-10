import { Router } from "express";
import { getUserOrders } from "../controllers/orders.controller";

const router = Router();

router.get("/:userId", getUserOrders);

export default router;
