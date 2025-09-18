declare module '@/lib/db' {
  import prisma from '../lib/prisma';
  export function connectDB(): Promise<typeof prisma>;
  export default connectDB;
}
