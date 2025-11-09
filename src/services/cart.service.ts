import db from "../config/db";
import { uuid32 } from "../utils/uuid32";

const cartService = {
  // Get user's cart with product details
  getUserCart: async (userId: string) => {
    const [cartRows]: any = await db.query(
      "SELECT id FROM carts_cart WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (cartRows.length === 0) {
      return { items: [] };
    }

    const cartId = cartRows[0].id;

    const [items]: any = await db.query(
      `SELECT 
        cci.id,
        cci.product_id,
        cci.quantity,
        p.title,
        p.price,
        p.image_url
      FROM carts_cartitem cci
      JOIN products_product p ON p.id = cci.product_id
      WHERE cci.cart_id = ?`,
      [cartId]
    );

    return {
      cart_id: cartId,
      items
    };
  },

  // Replace entire cart (from frontend)
  updateCart: async (payload: { user_id: string; items: any[] }) => {
    const { user_id, items } = payload;

    // 1. find/create cart
    const [rows]: any = await db.query(
      "SELECT id FROM carts_cart WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    let cartId: string;

    if (rows.length === 0) {
      cartId = uuid32();
      await db.query(
        "INSERT INTO carts_cart (id, user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
        [cartId, user_id]
      );
    } else {
      cartId = rows[0].id;
    }

    // 2. Delete existing items
    await db.query("DELETE FROM carts_cartitem WHERE cart_id = ?", [cartId]);

    // 3. Insert new items
    if (items.length > 0) {
      const values = items.map(i => [
        uuid32(),
        cartId,
        i.product_id,
        i.quantity
      ]);

      await db.query(
        "INSERT INTO carts_cartitem (id, cart_id, product_id, quantity, created_at, updated_at) VALUES ?",
        [values.map(v => [...v, new Date(), new Date()])]
      );
    }

    const [newItems]: any = await db.query(
        `SELECT 
            cci.id,
            cci.product_id,
            cci.quantity,
            p.title,
            p.price,
            p.image_url
        FROM carts_cartitem cci
        JOIN products_product p ON p.id = cci.product_id
        WHERE cci.cart_id = ?`,
        [cartId]
        );

        // convert DECIMAL (string) to number
        const formatted = newItems.map(i => ({
        ...i,
        price: Number(i.price)
        }));

        return {
        cart_id: cartId,
        items: formatted
        };
  },

  // Checkout (sync cart first, then clear)
  checkoutCart: async (payload: { user_id: string; items: any[] }) => {
    const { user_id, items } = payload;

    // Sync cart once
    await cartService.updateCart({ user_id, items });

    // Get user's cart
    const [cartRows]: any = await db.query(
      "SELECT id FROM carts_cart WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (cartRows.length === 0) throw new Error("Cart not found");

    const cartId = cartRows[0].id;

    // Clear items
    await db.query("DELETE FROM carts_cartitem WHERE cart_id = ?", [cartId]);

    return { message: "Checkout successful", cart_id: cartId };
  }
};

export default cartService;
