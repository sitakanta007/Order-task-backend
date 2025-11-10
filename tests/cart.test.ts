jest.mock("../src/config/database");

import prisma from "../src/config/database";
import request from "supertest";
import app from "../src/app";

describe("GET /api/cart/:userId", () => {

  test("returns empty items when cart does not exist", async () => {
    (prisma.cart.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .get("/api/cart/abc123")
      .set("Authorization", "Bearer testtoken");

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  test("returns full cart when cart exists", async () => {
    (prisma.cart.findFirst as jest.Mock).mockResolvedValue({
      id: "CART123",
    });

    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([
      {
        product_id: "P1",
        quantity: 2,
        product: {
          title: "Test Product",
          price: 499,
          image_url: "x.png",
        },
      },
    ]);

    const res = await request(app)
      .get("/api/cart/abc123")
      .set("Authorization", "Bearer testtoken");

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].title).toBe("Test Product");
  });

});
