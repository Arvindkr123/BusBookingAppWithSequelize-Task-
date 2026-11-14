# Wayfare frontend

The React, React Router, and Tailwind CSS frontend for the Bus Booking API.

## Run locally

1. Configure the backend environment and database as described in the repository [README](../README.md).
2. From the repository root, start the API with `npm start`.
3. In `frontend`, run `npm install` and then `npm run dev`.
4. Open the local URL printed by Vite.

Vite forwards `/api` requests to `http://localhost:3000`. The app uses the backend's
HTTP-only session cookie for authentication.

## Features

- Public bus availability and seat search.
- Account signup, login, and personal booking list.
- Admin overview, bus management, user list, booking list, and payment summary.

Payment records and statuses are displayed from the API. A payment provider is not
connected, so this frontend does not collect card details or process payments.
