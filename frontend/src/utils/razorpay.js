let scriptPromise;

function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Unable to load Razorpay Checkout. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function openRazorpayCheckout({ order, user, onSuccess, onFailure, onDismiss }) {
  await loadRazorpayScript();
  const checkout = new window.Razorpay({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: "Wayfare",
    description: order.description || "Bus booking",
    order_id: order.orderId,
    prefill: {
      name: user.name,
      email: user.email,
    },
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
    },
  });
  checkout.on("payment.failed", (response) => {
    onFailure(response.error?.description || "Payment failed. Please try again.");
  });
  checkout.open();
}
