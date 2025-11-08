import prisma from "../config/database";

const cartService = {
  // Add a product to user's cart OR update quantity if already exists
  addToCart: async (payload: { user_id: string, product_id: string, quantity: number }) => {
    const { user_id, product_id, quantity } = payload;

    if (!user_id || !product_id || !quantity) {
      throw new Error("Missing required fields");
    }

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { user_id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id }
      });
    }

    // Check if product already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id
      }
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    }

    return prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        product_id,
        quantity
      }
    });
  },

  // Get full cart with product data
  getUserCart: async (userId: string) => {
    const cart = await prisma.cart.findFirst({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      return { items: [] };
    }

    return cart;
  },

  // Replace entire cart (from cart page)
  updateCart: async (payload: { user_id: string, items: any[] }) => {
    const { user_id, items } = payload;

    if (!user_id || !items) throw new Error("Missing required fields");

    let cart = await prisma.cart.findFirst({ where: { user_id } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { user_id } });
    }

    await prisma.cartItem.deleteMany({
      where: { cart_id: cart.id }
    });

    const newItems = items.map(i => ({
      cart_id: cart.id,
      product_id: i.product_id,
      quantity: i.quantity
    }));

    await prisma.cartItem.createMany({ data: newItems });

    return { message: "Cart updated successfully" };
  },

  // Checkout API
  checkoutCart: async (payload: any) => {
    const { user_id } = payload;

    if (!user_id) throw new Error("User ID required");

    const cart = await prisma.cart.findFirst({
      where: { user_id },
      include: { items: true }
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Here you would create an order, apply coupons, manage stock etc.
    // For now just returning success.

    return { message: "Proceeding to checkout", cart_id: cart.id };
  }
};

export default cartService;
