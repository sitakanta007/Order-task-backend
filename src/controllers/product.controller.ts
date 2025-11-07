import { Request, Response } from "express";
import productService from "../services/product.service";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    return res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
