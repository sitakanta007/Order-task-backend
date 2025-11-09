import prisma from "../config/database";

const couponService = {
  getAvailableCoupons: async (userId: string) => {
    // Count existing orders to determine next order number
    const orderCount = await prisma.orders.count({
      where: { user_id: userId },
    });
    const nextOrderNumber = orderCount + 1;

    // Fetch up to 5 coupons whose nth_value >= nextOrderNumber
    const coupons = await prisma.coupon.findMany({
      where: { nth_value: { gte: nextOrderNumber }, is_active: true },
      orderBy: { nth_value: "asc" },
      take: 5,
    });

    if (coupons.length === 0) {
      return { nextOrderNumber, coupons: [] };
    }

    // Filter out coupons already used by user
    const available = [];
    for (const c of coupons) {
      const used = await prisma.userCoupon.findFirst({
        where: { user_id: userId, coupon_id: c.id },
      });
      if (!used) available.push(c);
    }

    return { nextOrderNumber, coupons: available };
  },
};

export default couponService;
