import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({
      error: 'No code received',
    })
  }

  return NextResponse.json({
    success: true,
    code,
  })