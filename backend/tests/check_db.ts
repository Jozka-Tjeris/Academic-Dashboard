
// Hard safety check
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

if (process.env.TEST_DATABASE !== "true") {
  throw new Error(
    `Tests are NOT running against test database!\nCurrent DB: ${process.env.DATABASE_URL}`
  );
}

if (process.env.JWT_SECRET !== "test-secret-123") {
  throw new Error(
    `JWT secret doesn't match!\nCurrent JWT Secret: ${process.env.JWT_SECRET}`
  );
}
