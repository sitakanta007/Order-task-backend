import { Router } from "express";
import productRoutes from "./product.routes";
import authRoutes from "./auth.routes";
import cartRoutes from "./cart.routes";
//import orderRoutes from "./order.routes";
//import couponRoutes from "./coupon.routes";

// initialize main router 
const router = Router();

router.use("/products", productRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
//router.use("/orders", orderRoutes);
//router.use("/coupons", couponRoutes);

export default router;