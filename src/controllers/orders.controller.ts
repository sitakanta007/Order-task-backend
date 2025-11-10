import { Request, Response } from "express";
import ordersService from "../services/orders.service";
import { norm } from "../utils/norm";

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = norm(req.params.userId);
    const result = await ordersService.getUserOrders(userId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
