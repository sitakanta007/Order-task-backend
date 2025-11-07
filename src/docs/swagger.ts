import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API",
      version: "1.0.0",
      description: "Ecommerce backend with customers, products, orders, coupons",
    }
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"]
};

const swaggerSpecs = swaggerJsdoc(options);

export default swaggerSpecs;
