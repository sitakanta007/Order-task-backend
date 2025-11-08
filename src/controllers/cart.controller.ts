import { Request, Response } from "express";
import cartService from "../services/cart.service";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const result = await cartService.addToCart(req.body);
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getUserCart = async (req: Request, res: Response) => {
  try {
    const result = await cartService.getUserCart(req.params.userId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const result = await cartService.updateCart(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const checkoutCart = async (req: Request, res: Response) => {
  try {
    const result = await cartService.checkoutCart(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
