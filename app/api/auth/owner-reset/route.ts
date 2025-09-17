import { NextResponse } from 'next/server'

// Owner reset route removed due to SQLite/Prisma bootstrap flow.
export async function POST() {
  return NextResponse.json({ error: 'Endpoint removed' }, { status: 410 })
}