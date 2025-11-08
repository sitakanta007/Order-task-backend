import prisma from "../config/database";

export default {
  getAllProducts: async () => {
    return prisma.product.findMany({
      orderBy: { created_at: "desc" }
    });
  }
};
