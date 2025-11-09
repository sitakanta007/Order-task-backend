import prisma from "../config/database";

const couponService = {
  getAvailableCoupons: async (userId: string) => {
    // Count how many orders the user has already placed
    const orderCount = await prisma.order.count({
      where: { user_id: userId }
    });

    const nextOrderNumber = orderCount + 1;

    // Fetch up to 5 coupons where nth_value >= nextOrderNumber
    const coupons = await prisma.coupon.findMany({
      where: { nth_value: { gte: nextOrderNumber } },
      orderBy: { nth_value: "asc" },
      take: 5
    });

    if (coupons.length === 0) {
      return { nextOrderNumber, coupons: [] };
    }

    // Filter out coupons already used by user
    const available = [];

    for (const c of coupons) {
      const used = await prisma.userCoupon.findFirst({
        where: { user_id: userId, coupon_id: c.id }
      });

      if (!used) available.push(c);
    }

    return {
      nextOrderNumber,
      coupons: available
    };
  }
};

export default couponService;
