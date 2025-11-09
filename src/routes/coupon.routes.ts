import { Router } from "express";
import { getAvailableCoupon } from "../controllers/coupon.controller";

const router = Router();

router.get("/:userId", getAvailableCoupon);

export default router;
