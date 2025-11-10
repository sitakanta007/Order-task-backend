jest.mock("../src/config/database", () => {
  return {
    __esModule: true,
    default: {
      cart: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() },
      cartItem: { findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() },
      coupon: { findUnique: jest.fn(), findMany: jest.fn() },
      userCoupon: { findFirst: jest.fn(), create: jest.fn() },
      orders: { count: jest.fn(), create: jest.fn(), findMany: jest.fn() }
    }
  };
});
