const mockPrisma = {
  cart: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },

  cartitem: {                   // ✅ FIXED NAME
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },

  product: {
    findUnique: jest.fn(),
  },

  coupon: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },

  userCoupon: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },

  orders: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },

  order_items: {
    create: jest.fn(),
  },
};

export default mockPrisma;
