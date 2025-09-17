import { NextResponse } from 'next/server'

// This endpoint is deprecated; owner reset should be done via normal auth flows
export async function POST() {
  return NextResponse.json({ error: 'Deprecated endpoint' }, { status: 410 })
}