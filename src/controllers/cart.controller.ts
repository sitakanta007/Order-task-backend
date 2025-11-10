import { Request, Response } from "express";
import cartService from "../services/cart.service";
import { norm } from "../utils/norm";

export const getUserCart = async (req: Request, res: Response) => {
  try {
    const userId = norm(req.params.userId); 
    const result = await cartService.getUserCart(userId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const result = await cartService.updateCart({
      ...req.body,
      user_id: norm(req.body.user_id),
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const checkoutCart = async (req: Request, res: Response) => {
  try {
    const result = await cartService.checkoutCart({
      ...req.body,
      user_id: norm(req.body.user_id),
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
