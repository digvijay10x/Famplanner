const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// Choose connection string based on environment
const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL_POOLED
    : process.env.DATABASE_URL;

// Create PostgreSQL connection pool
const pool = new Pool({ connectionString });

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
