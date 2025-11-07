import { Router } from "express";
import { getProducts } from "../controllers/product.controller";

const router = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get list of all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", getProducts);

export default router;
