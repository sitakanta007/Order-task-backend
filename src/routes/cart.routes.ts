import { Router } from "express";
import {
  getUserCart,
  updateCart,
  checkoutCart
} from "../controllers/cart.controller";

const router = Router();

// GET full cart for a user
router.get("/:userId", getUserCart);

// Replace entire cart (frontend sends full list)
router.post("/update", updateCart);

// Checkout (sync then clear)
router.post("/checkout", checkoutCart);

export default router;
