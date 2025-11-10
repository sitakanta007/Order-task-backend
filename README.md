# Ecommerce Backend API (Node.js + Express + Prisma + MySQL)

This is the backend API for the Ecommerce application.
It powers user authentication, cart management, coupons, checkout, and order history.

Django owns the database structure.
Prisma is used purely as a type-safe query client (no migrations).

The API exposes REST endpoints and Swagger documentation.

## Tech Stack
- Node.js (Express)
- Prisma (MySQL client only)
- JWT Authentication
- Swagger (OpenAPI docs)
- PM2 (optional for EC2 deployment)
- MySQL (managed by Django - another repo)

## Requirements

- Node.js 18+
- MySQL database already created and structured by Django
- Prisma generated from schema
- .env configured

## Environment Variables

Create .env at project root:
```
DATABASE_URL=mysql://username:password@host:3306/dbname
JWT_SECRET=your_super_secret_key_here
APP_BACKEND=self_url_for_swagger
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=db_name
PORT=3000
```
## Installation
```npm install```

## Generate prisma client:
```
npx prisma db pull 
npx prisma generate
```

## Development

Start dev server: ```npm run dev```
App runs at: ```http://localhost:3000/api```

## Swagger docs:
```http://localhost:3000/api-docs```

## Build for Production
```npm run build```

## Folder Structure
```
src/
 ├─ config/
 │   ├─ database.ts        // Prisma client
 │   └─ db.ts              // Raw MySQL connection (deprecated)
 │
 ├─ controllers/
 │   ├─ auth.controller.ts
 │   ├─ cart.controller.ts
 │   ├─ coupon.controller.ts
 │   └─ orders.controller.ts
 │
 ├─ services/
 │   ├─ auth.service.ts
 │   ├─ cart.service.ts
 │   ├─ coupon.service.ts
 │   └─ orders.service.ts
 │
 ├─ routes/
 │   ├─ auth.routes.ts
 │   ├─ cart.routes.ts
 │   ├─ coupon.routes.ts
 │   ├─ orders.routes.ts
 │   └─ index.ts
 │
 ├─ middleware/
 │   └─ authMiddleware.ts
 │
 ├─ docs/
 │   └─ swagger.ts
 │
 ├─ utils/
 │   └─ uuid32.ts
 │
 ├─ app.ts
 └─ server.ts
```
##Authentication Overview

The API uses JWT.

Login returns:
```
{
  "token": "...",
  "user": {
    "id": "abc123...",
    "name": "John",
    "email": "john@example.com"
  }
}
```

Frontend must send:

```Authorization: Bearer <token>```

## Key API Endpoints
AUTH
POST /api/auth/login
POST /api/auth/signup

CART
GET    /api/cart/:userId
POST   /api/cart/update
POST   /api/cart/checkout

COUPONS
GET /api/coupons/:userId

ORDERS
GET /api/orders/:userId

## Checkout Flow Summary

When /cart/checkout is called, backend performs:

- Validate user & token
- Validate coupon if provided
- Sync cart with DB
- Calculate: subtotal, discount, gst, total_amount
- Create orders row
- Insert order_items
- Track coupon usage in UserCoupon
- Clear cart + cart items

Return:
```
{
  "message": "Order placed successfully",
  "order_id": "UUID",
  "subtotal": 1000,
  "discountAmount": 100,
  "tax": 45,
  "totalAmount": 945
}
```

## Production Deployment
1. Build app (use correct DB credentials in .env file before proceeding)
```
npm install
npx prisma db pull
npx prisma generate
npm run build
```

2. Start with PM2
```pm2 start dist/server.js --name ecommerce-api ```

3. Persist PM2
```
pm2 save
pm2 startup
```
## Prisma Notes

- Do NOT run migrations
- Django owns schema
- Use: ```npx prisma db pull``` Whenever Django tables change.

## Logging

Basic console logs enabled.

To debug prisma:

```DEBUG="prisma:*" npm run dev```

## Common Troubleshooting
Prisma: “table does not exist”

Run:
```
npx prisma db pull
npx prisma generate
```
Swagger not updating
- Clear cache + restart server.

JWT keeps failing
- Ensure Authorization header is: `Bearer <token>`

EC2 refuses request
- Check security group + server port binding.
