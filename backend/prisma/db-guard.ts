
export function validateTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isTestEnv = process.env.NODE_ENV === 'test';
  const isLabeledTestDB = process.env.TEST_DATABASE !== "true";

  if (process.env.NODE_ENV === 'production') {
    console.error('🛑 CRITICAL: Attempted to run a test script in PRODUCTION.');
    process.exit(1);
  }

  if (!isLabeledTestDB && isTestEnv) {
    console.error(`⚠️  SAFETY TRIGGERED: NODE_ENV is "test" but DATABASE_URL does not look like a test database.`);
    console.error(`Target URL: ${dbUrl}`);
    process.exit(1);
  }
}