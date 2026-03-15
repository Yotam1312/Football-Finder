import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance that is shared across the entire application.
// Never create a new PrismaClient inside a controller or function — that would open
// a new connection pool on every request, which quickly exhausts Azure's connection limit.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
