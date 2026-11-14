export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.error || body.details?.join(", ") || message;
    } catch {
      message = `Request failed (${response.status})`;
    }
    throw new ApiError(message, response.status);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  auth: {
    me: () => request("/users/me"),
    login: (credentials) =>
      request("/users/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    signup: (details) =>
      request(details.role === "ADMIN" ? "/users/admin/signup" : "/users/signup", {
        method: "POST",
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          password: details.password,
          adminCode: details.role === "ADMIN" ? details.adminCode : undefined,
        }),
      }),
    logout: () => request("/users/logout", { method: "POST" }),
  },
  buses: {
    list: () => request("/buses"),
    create: (bus) =>
      request("/buses", { method: "POST", body: JSON.stringify(bus) }),
    update: (id, bus) =>
      request(`/buses/${id}`, { method: "PATCH", body: JSON.stringify(bus) }),
    remove: (id) => request(`/buses/${id}`, { method: "DELETE" }),
  },
  bookings: {
    mine: () => request("/bookings/mine"),
    list: () => request("/bookings"),
    occupied: () => request("/bookings/occupied"),
    create: (booking) =>
      request("/bookings", { method: "POST", body: JSON.stringify(booking) }),
  },
  users: {
    list: () => request("/users"),
  },
  payments: {
    list: () => request("/payments"),
    fare: () => request("/payments/fare"),
    mine: () => request("/payments/mine"),
    checkout: (details) =>
      request("/payments/checkout", {
        method: "POST",
        body: JSON.stringify(details),
      }),
    verify: (paymentDetails) =>
      request("/payments/verify", {
        method: "POST",
        body: JSON.stringify(paymentDetails),
      }),
    order: (orderId) =>
      request(`/payments/order/${encodeURIComponent(orderId)}`),
  },
};
