// tests/checkout.test.ts
import request from "supertest";
import app from "../src/app";

// ---- IMPORTANT: define the mocks BEFORE jest.mock() ----
const mockPrisma = {
  cart: {
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  cartItem: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },

  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },

  orders: {
    count: jest.fn(),
    create: jest.fn(),
  },

  order_items: {
    createMany: jest.fn(),
  },

  coupon: {
    findUnique: jest.fn(),
  },

  userCoupon: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

// Mock prisma AFTER mockPrisma exists
jest.mock("../src/config/database", () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock uuid32
jest.mock("../src/utils/uuid32", () => ({
  uuid32: () => "TESTUUID32",
}));

describe("POST /api/cart/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fails when coupon is invalid", async () => {
    mockPrisma.cart.findFirst.mockResolvedValue({ id: "CART1" });

    mockPrisma.cartItem.findMany.mockResolvedValue([
      { product_id: "PROD1", quantity: 2, product: { price: 500 } },
    ]);

    mockPrisma.orders.count.mockResolvedValue(0);
    mockPrisma.coupon.findUnique.mockResolvedValue(null);

    // prevent undefined.createMany errors
    mockPrisma.order_items.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.orders.create.mockResolvedValue({ id: "ORDER1" });
    mockPrisma.userCoupon.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/cart/checkout")
      .send({
        user_id: "abc12345abcd1234abcd1234abcd1234",
        items: [{ product_id: "PROD1", quantity: 2, price: 500 }],
        subtotal: 1000,
        discount: 0,
        tax: 0,
        total_payable: 1000,
        coupon: "INVALID",
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toMatch(/invalid|coupon/);
  });

  test("successfully places order", async () => {
    mockPrisma.cart.findFirst.mockResolvedValue({ id: "CART1" });

    mockPrisma.cartItem.findMany.mockResolvedValue([
      { product_id: "PROD1", quantity: 2, product: { price: 500 } },
    ]);

    mockPrisma.orders.count.mockResolvedValue(0);

    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "CID",
      code: "SAVE10",
      type: "percentage",
      discount_percent: 10,
      max_discount_amount: null,
      nth_value: 1,
      is_active: true,
    });

    mockPrisma.userCoupon.findFirst.mockResolvedValue(null);

    mockPrisma.orders.create.mockResolvedValue({
      id: "ORDER1",
    });

    mockPrisma.order_items.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.userCoupon.create.mockResolvedValue({ id: 1 });
    mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.cart.delete.mockResolvedValue({ id: "CART1" });

    const res = await request(app)
      .post("/api/cart/checkout")
      .send({
        user_id: "abc12345abcd1234abcd1234abcd1234",
        items: [{ product_id: "PROD1", quantity: 2, price: 500 }],
        subtotal: 1000,
        discount: 100,
        tax: 45,
        total_payable: 945,
        coupon: "SAVE10",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Order placed successfully");
    expect(res.body.order_id).toBe("ORDER1");
  });
});
