// Lightweight compatibility shim for legacy Mongoose-style connectDB / dbConnect
// The project uses Prisma (see lib/prisma.ts). Some routes import connectDB/dbConnect
// so we provide small wrappers that return the Prisma client and are no-ops for
// connection management. This keeps existing code working without changing many files.

import prisma from './prisma'

export async function connectDB() {
  // Prisma manages its own connection pooling. Keep a stable API for existing code.
  return prisma
}

export default connectDB
