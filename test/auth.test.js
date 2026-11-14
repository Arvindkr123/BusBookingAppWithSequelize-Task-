const assert = require("node:assert/strict");
const test = require("node:test");
const authController = require("../src/controllers/auth.controllers");
const { requireAdmin } = require("../src/middleware/auth.middleware");

test("password policy accepts a sufficiently long password", () => {
    assert.doesNotThrow(() => authController.validatePassword("travel-safe-pass"));
});

test("password policy rejects short and overlong passwords", () => {
    assert.throws(() => authController.validatePassword("short"), {
        statusCode: 400,
    });
    assert.throws(() => authController.validatePassword("a".repeat(73)), {
        statusCode: 400,
    });
});

test("admin signup code must match the configured six-digit invitation code", () => {
    const invitationCode = "583104";

    assert.equal(
        authController.verifyAdminSignupCode(invitationCode, invitationCode),
        true,
    );
    assert.equal(
        authController.verifyAdminSignupCode("wrong-code", invitationCode),
        false,
    );
    assert.equal(
        authController.verifyAdminSignupCode("12345", invitationCode),
        false,
    );
    assert.equal(
        authController.verifyAdminSignupCode("1234567", invitationCode),
        false,
    );
    assert.equal(
        authController.verifyAdminSignupCode(invitationCode, "not-six"),
        false,
    );
});

test("public user data never contains the password hash", () => {
    const user = authController.publicUser({
        id: 3,
        name: "Rider",
        email: "rider@example.com",
        role: "USER",
        passwordHash: "private-hash",
    });

    assert.deepEqual(user, {
        id: 3,
        name: "Rider",
        email: "rider@example.com",
        role: "USER",
    });
});

test("admin middleware rejects ordinary users", () => {
    let forwardedError;
    requireAdmin({ auth: { role: "USER" } }, {}, (error) => {
        forwardedError = error;
    });

    assert.equal(forwardedError.statusCode, 403);
});

test("admin middleware accepts administrators", () => {
    let calledNext = false;
    requireAdmin({ auth: { role: "ADMIN" } }, {}, (error) => {
        assert.equal(error, undefined);
        calledNext = true;
    });

    assert.equal(calledNext, true);
});
