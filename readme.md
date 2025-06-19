# 🛒E-Commerce Shoe Shop Backend (incl. admin panel)

A robust, scalable, and secure Node.js + Express backend powering a modern e-commerce platform.  
Designed for real-world use with modular architecture, advanced features, and production-ready security.

---

## 🚀 Features

- **User Authentication & Authorization**

  - JWT-based authentication for users and admins
  - Secure password hashing, OTP/email verification, and password reset
  - Role-based route protection

- **User Management**

  - Profile management and update
  - Soft delete (account suspension) with audit trail (`is_active`, `deleted_at`)
  - Cart management: add, update, remove, and view items

- **Product Management**

  - CRUD operations for shoes/products (admin only)
  - Advanced filtering, search, and pagination
  - Ratings, reviews, and category-based ratings

- **Order Management**

  - Place, view, and cancel orders
  - Admin order status updates and order history

- **Payment Integration**

  - bKash payment gateway: create, execute, refund, and callback support

- **Admin Panel APIs**

  - User and order management
  - Soft and hard delete for users
  - Admin authentication and profile

- **Security & Best Practices**
  - Secure cookies, environment variables, and error handling
  - Input validation and custom error middleware
  - Modular, maintainable codebase

---

## 🏗️ Project Structure

```
├── config/           # Database connection and configuration
├── controlers/       # Business logic for users, admins, shoes, orders, payments
├── middlewares/      # Auth, error handling, async error, payment middleware
├── models/           # Mongoose schemas: User, Admin, Shoe, Order, Payment
├── routes/           # Express route definitions (user, admin, shoes, payment)
├── utils/            # Utility functions (sendToken, sendEmail, etc.)
├── .env              # Environment variables (never commit secrets!)
├── server.js         # Entry point
└── package.json      # Dependencies and scripts
```

---

## 📦 Key Technologies

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, bcrypt
- **Payment:** bKash API integration
- **Email/SMS:** Nodemailer, Twilio
- **Other:** dotenv, cookie-parser, CORS, custom middleware

---

## 🔑 API Highlights

### Authentication & User

- `POST /api/user/register` — Register with email/phone verification
- `POST /api/user/login` — Login (checks `is_active`)
- `POST /api/user/otp-verification` — OTP/email verification
- `POST /api/user/password/forgot` — Forgot password (email reset)
- `PUT /api/user/password/reset/:token` — Reset password
- `GET /api/user/me` — Get current user profile
- `PUT /api/user/update-profile` — Update profile info
- `GET /api/user/cart` — View cart
- `POST /api/user/cart/add` — Add to cart
- `PUT /api/user/cart/update` — Update cart item
- `DELETE /api/user/cart/remove/:cartId` — Remove cart item
- `POST /api/user/orders/store` — Place order

### Admin

- `POST /api/admin/login` — Admin login
- `GET /api/admin/orders` — Get all orders
- `PUT /api/admin/orders/status/:orderId` — Update order status
- `PATCH /api/admin/soft-remove/:id` — Soft delete user
- `DELETE /api/admin/remove/:id` — Hard delete user

### Shoes/Products

- `POST /api/shoes/add` — Add new shoe (admin)
- `PUT /api/shoes/update/:id` — Update shoe (admin)
- `DELETE /api/shoes/:id` — Delete shoe (admin)
- `GET /api/shoes/` — Get all shoes
- `GET /api/shoes/paginated` — Filtered & paginated shoes
- `POST /api/shoes/:id/review` — Add/update review (user)
- `POST /api/shoes/:id/category-rating` — Add/update category rating (user)

### Payment (bKash)

- `POST /api/bkash/payment/create` — Initiate payment
- `GET /api/bkash/payment/callback` — Payment callback
- `GET /api/bkash/payment/refund/:trxID` — Refund payment

---

## 🛡️ Security & Best Practices

- Passwords are hashed with bcrypt
- JWT tokens managed via HTTP-only cookies
- All sensitive routes protected by middleware
- Soft delete preserves user data for auditability
- Centralized error handling and async error catching

---

## 🧑‍💻 How to Run Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/cshosain/react-admin-dashboard.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy `.env.example` to `.env` and fill in your MongoDB URI, JWT secret, SMTP, Twilio, and bKash configs.

4. **Run the server**
   ```bash
   npm start
   ```

---

## 📬 Contact

**Hosain**  
[LinkedIn](https://www.linkedin.com/in/cshosain) | [Email](mailto:cshosain@gmail.com)

---

## ⭐ Which things have been ensured?

- **Clean, modular code** with real-world e-commerce features
- **Security-focused**: JWT, password hashing, role-based access
- **Scalable architecture**: Ready for microservices or cloud deployment
- **Payment integration**: Real payment gateway experience
- **Professional documentation** and code comments

---

> _Let’s build something amazing together!_
