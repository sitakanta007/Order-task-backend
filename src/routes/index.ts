import { Router } from "express";
import productRoutes from "./product.routes";
//import customerRoutes from "./customer.routes";
//import orderRoutes from "./order.routes";
//import couponRoutes from "./coupon.routes";

// initialize main router 
const router = Router();

router.use("/products", productRoutes);
//router.use("/customers", customerRoutes);
//router.use("/orders", orderRoutes);
//router.use("/coupons", couponRoutes);

export default router;