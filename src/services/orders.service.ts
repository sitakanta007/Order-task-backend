import prisma from "../config/database";

const ordersService = {
  getUserOrders: async (userId: string) => {
    // Fetch all orders for user, recent first
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: {
        order_items: {
          include: {
            products_product: {
              select: {
                title: true,
                image_url: true,
              },
            },
          },
        },
      },
    });

    // Format into frontend-friendly structure
    const formatted = orders.map((o) => ({
      id: o.id,
      created_at: o.created_at,
      subtotal: Number(o.subtotal),
      discount_amount: Number(o.discount_amount),
      tax: Number(o.tax),
      total_amount: Number(o.total_amount),
      coupon_code: o.coupon_code,

      items: o.order_items.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        price_at_time: Number(it.price_at_time),
        title: it.products_product.title,
        image_url: it.products_product.image_url,
      })),
    }));

    return formatted;
  },
};

export default ordersService;
