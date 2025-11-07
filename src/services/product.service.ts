import prisma from "../config/database";

export default {
  getAllProducts: async () => {
    return prisma.products_product.findMany({
      orderBy: { created_at: "desc" }
    });
  }
};
