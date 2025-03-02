import { PrismaClient } from '@prisma/client';
import { DatabaseError } from './errors';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Database connection established');
    return true;
  } catch (error) {
    // Safely log error details
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to connect to database:', errorMessage);

    if (errorMessage.includes("Can't reach database server")) {
      console.error(
        'Please ensure your database server is running at the configured address (default: localhost:5432)'
      );
      console.error(
        'Check your DATABASE_URL environment variable and make sure PostgreSQL is running'
      );
    }

    return false;
  }
}

// Initialize connection
let isConnected = false;

// Try to connect and set the connection status
connectDB()
  .then((connected) => {
    isConnected = connected;
  })
  .catch(() => {
    isConnected = false;
  });

// Export a wrapped version of prisma that checks connection status
export const db = new Proxy(prisma, {
  get(target: PrismaClient, prop: string | symbol) {
    if (!isConnected) {
      throw new DatabaseError(
        'Database is not connected. Please check your database configuration.'
      );
    }
    return Reflect.get(target, prop);
  },
}) as PrismaClient;

// Also export the raw client for cases where it's needed
export { prisma as prismaClient };
