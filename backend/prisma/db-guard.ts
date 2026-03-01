
export function validateTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isTestEnv = process.env.NODE_ENV === 'test';
  
  // Requirement 1: Check if the connection string contains 'rice'
  const isTestDb = dbUrl.includes('rice') || dbUrl.includes('localhost');

  if (process.env.NODE_ENV === 'production') {
    console.error('🛑 CRITICAL: Attempted to run a test script in PRODUCTION.');
    process.exit(1);
  }

  if (!isTestDb && isTestEnv) {
    console.error(`⚠️  SAFETY TRIGGERED: NODE_ENV is "test" but DATABASE_URL does not look like a test database.`);
    console.error(`Target URL: ${dbUrl}`);
    process.exit(1);
  }
}