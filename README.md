# Bus Booking App

An Express/Sequelize API with a React and Tailwind CSS bus booking frontend.

## Requirements

- Node.js 18 or newer
- MySQL 8

## Configure and run

1. Copy `.env.example` to `.env` and set your MySQL values.
2. Generate a random secret and set it as `JWT_SECRET`. It must be at least 32 characters. For example, run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and copy the output into `.env`.
3. Set both `ADMIN_EMAIL` and `ADMIN_PASSWORD` to bootstrap an administrator. The password must be at least 12 characters. `ADMIN_NAME` is optional. The server creates this account if it does not exist and promotes a matching account to admin. To allow admin signup from the form, set `ADMIN_SIGNUP_CODE` to a private six-digit code, for example by running `node -e "console.log(require('crypto').randomInt(100000, 1000000))"`. Admin signup is limited to five attempts per IP every 15 minutes; rotate the code after sharing it.
4. Start MySQL. If using Docker Compose, run `docker compose up -d` from the repository root.
5. To accept payments in India, configure Razorpay test credentials in `.env`:

   - In Razorpay Dashboard test mode, generate API keys and set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
   - Set up a webhook for `payment.captured` and `payment.failed`, then put its secret in `RAZORPAY_WEBHOOK_SECRET`.
   - Enable automatic payment capture in the Razorpay Dashboard so successful bookings are confirmed without manual capture.
   - `BUS_FARE_INR` defaults to `30`.

   Razorpay webhooks need a publicly reachable endpoint; `localhost` is not accepted. The browser checkout callback is verified directly by the backend, so you can test the payment flow locally without a webhook, but configure the webhook before deployment to cover cases where the browser closes before returning.

   Never put Razorpay secrets in frontend code or commit them. Use test-mode keys while developing.

6. Install backend dependencies and start the API:

   ```powershell
   npm install
   npm start
   ```

   On startup, the API syncs its existing models and adds required authentication and payment columns to existing tables without removing records.
7. In another terminal, start the frontend:

   ```powershell
   Set-Location frontend
   npm install
   npm run dev
   ```

   Open the local URL printed by Vite. Its `/api` proxy points to `http://localhost:3000`.

## Authentication and access

- Public users can sign up with a name, email, and password. Passwords are hashed with bcrypt; the browser receives an HTTP-only, same-site session cookie.
- Passenger signup is open. An applicant can select `Administrator` only when `ADMIN_SIGNUP_CODE` is set and provide the matching six-digit invitation code; the backend validates it before assigning the `ADMIN` role.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` can also bootstrap an administrator. Only admins can manage buses or read the users, all bookings, and payments endpoints.
- Signed-in users can create bookings and view their own bookings. Bus browsing and occupied seat numbers are public.
- Razorpay Checkout supports payment methods enabled for your account, including UPI and cards. The server creates an INR order for each seat and verifies the returned payment signature and captured payment before confirming a booking.
- Configure the Razorpay webhook secret so the backend can reconcile captured and failed payments even if the user closes the checkout window. Failed attempts can be retried from **My bookings**.
- Sessions expire after one hour. In production, serve the frontend and API on the same site over HTTPS so the secure cookie is sent.

Existing users without a password hash remain in the database but cannot sign in using email alone. This avoids silently treating an unverified email as proof of account ownership.
