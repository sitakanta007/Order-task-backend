import { Request, Response } from "express";
import couponService from "../services/coupon.service";

export const getAvailableCoupon = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const result = await couponService.getAvailableCoupons(userId);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
