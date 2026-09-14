// Throwaway credentials for unit tests. Some modules read secrets at import
// time and fail fast without insecure defaults, while the unit-test CI step
// provides no environment. Real values always win: these only fill the gaps.
process.env.JWT_SECRET ??= 'unit-test-jwt-secret';
process.env.COOKIE_SECRET ??= 'unit-test-cookie-secret';
process.env.DEFAULT_ADMIN_PASSWORD ??= 'unit-test-admin-password';
