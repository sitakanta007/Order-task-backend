import { Router } from "express";
import {
  addToCart,
  getUserCart,
  updateCart,
  checkoutCart,
} from "../controllers/cart.controller";

const router = Router();

router.post("/add", addToCart);
router.get("/:userId", getUserCart);
router.post("/update", updateCart);
router.post("/checkout", checkoutCart);

export default router;
