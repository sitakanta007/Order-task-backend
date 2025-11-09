import prisma from "../config/database";
import { uuid32 } from "../utils/uuid32";

/** Frontend payloads */
type CartItemPayload = {
  product_id: string;
  quantity: number;
  price?: number; // ignored for server calculations; server uses DB price
};

type UpdatePayload = {
  user_id: string;
  items: CartItemPayload[];
};

type CheckoutPayload = {
  user_id: string;
  items: CartItemPayload[];
  subtotal?: number;        // optional from FE; server recomputes
  discount?: number;        // optional from FE; server recomputes
  tax?: number;             // optional from FE; server recomputes
  total_amount?: number;    // you said FE will send this; server still recomputes
  coupon?: string | null;   // optional code
};

const cartService = {
  /** Get user's cart with product details */
  getUserCart: async (userId: string) => {
    const cart = await prisma.cart.findFirst({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!cart) return { items: [] };

    const items = await prisma.cartItem.findMany({
      where: { cart_id: cart.id },
      include: {
        product: {
          select: { title: true, price: true, image_url: true },
        },
      },
    });

    const mapped = items.map((i) => ({
      id: i.id,
      product_id: i.product_id,
      quantity: i.quantity,
      title: i.product.title,
      price: Number(i.product.price),
      image_url: i.product.image_url ?? "",
    }));

    return { cart_id: cart.id, items: mapped };
  },

  /** Replace entire cart (from frontend) */
  updateCart: async (payload: UpdatePayload) => {
    const { user_id, items } = payload;

    // 1) find or create cart (created_at has no default, updated_at is handled by @updatedAt)
    let cart = await prisma.cart.findFirst({
      where: { user_id },
      select: { id: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          id: uuid32(),
          user_id,
          created_at: new Date(),
          // updated_at is @updatedAt – Prisma fills it
        },
        select: { id: true },
      });
    }

    // 2) clear existing items
    await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });

    // 3) insert new items (CartItem needs id, created_at, updated_at)
    if (items && items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map((i) => ({
          id: uuid32(),
          cart_id: cart!.id,
          product_id: i.product_id,
          quantity: i.quantity,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        skipDuplicates: true,
      });
    }

    // 4) return new items with details
    const newItems = await prisma.cartItem.findMany({
      where: { cart_id: cart.id },
      include: {
        product: { select: { title: true, price: true, image_url: true } },
      },
    });

    const formatted = newItems.map((i) => ({
      id: i.id,
      product_id: i.product_id,
      quantity: i.quantity,
      title: i.product.title,
      price: Number(i.product.price),
      image_url: i.product.image_url ?? "",
    }));

    return { cart_id: cart.id, items: formatted };
  },

  /** Checkout:
   * - Sync cart from FE list
   * - Validate coupon (exist/active/nth-order/not-used/percentage-only)
   * - Compute totals: discount on subtotal, GST 5% after discount
   * - Create order, items, user-coupon
   * - Clear cart
   */
  checkoutCart: async (payload: CheckoutPayload) => {
    const { user_id, items, coupon: rawCouponCode } = payload;

    // 1) Sync server cart with FE snapshot
    await cartService.updateCart({ user_id, items });

    // 2) Load cart items with authoritative prices
    const cart = await prisma.cart.findFirst({
      where: { user_id },
      select: { id: true },
    });
    if (!cart) throw new Error("Cart not found");

    const cartItems = await prisma.cartItem.findMany({
      where: { cart_id: cart.id },
      include: {
        product: { select: { id: true, price: true } },
      },
    });

    if (cartItems.length === 0) throw new Error("Cart is empty");

    const subtotal = cartItems.reduce((acc, row) => {
      return acc + Number(row.product.price) * row.quantity;
    }, 0);

    // 3) Coupon validation (percentage-only; no fixed amount)
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    let couponId: string | null = null;

    const couponCode = (rawCouponCode ?? "").trim();
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (!coupon) throw new Error("Invalid coupon code");
      if (!coupon.is_active) throw new Error("Coupon is inactive");

      // percentage-only
      if (coupon.type !== "percentage") {
        throw new Error("Only percentage coupons are supported");
      }

      // next-order (nth_value must equal next order number)
      const priorOrders = await prisma.orders.count({
        where: { user_id },
      });
      const nextOrderNumber = priorOrders + 1;
      if (coupon.nth_value !== nextOrderNumber) {
        throw new Error("Coupon not applicable for this order number");
      }

      // not used by this user yet
      const alreadyUsed = await prisma.userCoupon.findFirst({
        where: { user_id, coupon_id: coupon.id },
      });
      if (alreadyUsed) {
        throw new Error("Coupon already used by this user");
      }

      // compute discount
      const percent = Number(coupon.discount_percent ?? 0);
      discountAmount = (subtotal * percent) / 100;

      // optional cap (kept in schema; safe to apply if present)
      if (coupon.max_discount_amount) {
        const cap = Number(coupon.max_discount_amount);
        if (discountAmount > cap) discountAmount = cap;
      }

      appliedCouponCode = coupon.code;
      couponId = coupon.id;
    }

    // 4) GST (5%) after discount
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = Number((discountedSubtotal * 0.05).toFixed(2));
    const total_amount = Number((discountedSubtotal + tax).toFixed(2));

    // 5) Create order header (model is `orders`)
    const orderId = uuid32();
    const order = await prisma.orders.create({
      data: {
        id: orderId,
        user_id,
        subtotal: subtotal.toFixed(2),
        coupon_code: appliedCouponCode ?? null,
        discount_amount: discountAmount.toFixed(2),
        tax: tax.toFixed(2),
        total_amount: total_amount.toFixed(2),
        created_at: new Date(),
        updated_at: new Date(),
      },
      select: { id: true },
    });

    // 6) Create order items (model is `order_items`, id autoincrements; no need to pass id)
    await prisma.order_items.createMany({
      data: cartItems.map((ci) => ({
        order_id: order.id,
        product_id: ci.product_id,
        price_at_time: Number(ci.product.price).toFixed(2),
        quantity: ci.quantity,
        created_at: new Date(),
      })),
    });

    // 7) Mark coupon as used (model is `UserCoupon`)
    if (appliedCouponCode && couponId) {
      await prisma.userCoupon.create({
        data: {
          user_id,
          coupon_id: couponId,
          order_id: order.id,
          used_at: new Date(),
        },
      });
    }

    // 8) Clear cart items
    await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });

    await prisma.cart.delete({ where: { id: cart.id } });

    return {
      message: "Order placed successfully",
      order_id: order.id,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      tax,
      total_amount,
    };
  },
};

export default cartService;
