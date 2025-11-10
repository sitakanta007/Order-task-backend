jest.mock("../src/config/database");

import prisma from "../src/config/database";
import request from "supertest";
import app from "../src/app";

describe("GET /api/coupons/:userId", () => {
  test("returns no coupons when none available", async () => {
    (prisma.orders.count as jest.Mock).mockResolvedValue(0);

    (prisma.coupon.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .get("/api/coupons/abcd1234abcd1234abcd1234abcd1234")
      .set("Authorization", "Bearer testtoken");

    expect(res.status).toBe(200);
    expect(res.body.coupons.length).toBe(0);
  });

  test("returns available coupons", async () => {
    (prisma.orders.count as jest.Mock).mockResolvedValue(1);

    (prisma.coupon.findMany as jest.Mock).mockResolvedValue([
      {
        id: "CPN1",
        code: "SAVE10",
        discount_percent: "10.00",
        nth_value: 2,
        is_active: true
      }
    ]);

    (prisma.userCoupon.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .get("/api/coupons/abcd1234abcd1234abcd1234abcd1234")
      .set("Authorization", "Bearer testtoken");

    expect(res.status).toBe(200);
    expect(res.body.coupons.length).toBe(1);
    expect(res.body.coupons[0].code).toBe("SAVE10");
  });
});
