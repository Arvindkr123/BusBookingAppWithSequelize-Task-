const { createHmac, timingSafeEqual } = require("node:crypto");

function matchesSignature(message, signature, secret) {
    if (
        typeof signature !== "string"
        || !/^[a-f0-9]{64}$/i.test(signature)
        || typeof secret !== "string"
        || secret.length === 0
    ) {
        return false;
    }

    const expected = createHmac("sha256", secret).update(message).digest();
    const received = Buffer.from(signature, "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
}

function verifyPaymentSignature(orderId, paymentId, signature, keySecret) {
    if (!orderId || !paymentId) {
        return false;
    }
    return matchesSignature(`${orderId}|${paymentId}`, signature, keySecret);
}

function verifyWebhookSignature(rawBody, signature, webhookSecret) {
    if (!Buffer.isBuffer(rawBody)) {
        return false;
    }
    return matchesSignature(rawBody, signature, webhookSecret);
}

module.exports = { verifyPaymentSignature, verifyWebhookSignature };
