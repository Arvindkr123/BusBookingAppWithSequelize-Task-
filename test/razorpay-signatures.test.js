const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const test = require("node:test");
const {
    verifyPaymentSignature,
    verifyWebhookSignature,
} = require("../src/utils/razorpay-signatures");

function sign(message, secret) {
    return createHmac("sha256", secret).update(message).digest("hex");
}

test("Razorpay payment signatures bind the payment to its order", () => {
    const signature = sign("order_123|pay_456", "key-secret");

    assert.equal(
        verifyPaymentSignature("order_123", "pay_456", signature, "key-secret"),
        true,
    );
    assert.equal(
        verifyPaymentSignature("order_other", "pay_456", signature, "key-secret"),
        false,
    );
    assert.equal(
        verifyPaymentSignature("order_123", "pay_456", "invalid", "key-secret"),
        false,
    );
});

test("Razorpay webhook signatures require the exact raw request body", () => {
    const body = Buffer.from('{"event":"payment.captured"}');
    const signature = sign(body, "webhook-secret");

    assert.equal(
        verifyWebhookSignature(body, signature, "webhook-secret"),
        true,
    );
    assert.equal(
        verifyWebhookSignature(Buffer.from('{"event":"payment.failed"}'), signature, "webhook-secret"),
        false,
    );
    assert.equal(
        verifyWebhookSignature(body.toString("utf8"), signature, "webhook-secret"),
        false,
    );
});
