import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Use a singleton approach for consistent mocking
export const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock); // Reset the mock before each test
});
