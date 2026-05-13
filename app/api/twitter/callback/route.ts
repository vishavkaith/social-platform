import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

/**
 * Twitter OAuth callback handler
 * This endpoint is called by NextAuth after the user authorizes the application
 * The actual token exchange and user account linking is handled by NextAuth
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Check if Twitter account is connected
  const hasTwitter = session?.user?.accounts?.some((acc: { provider: string }) => acc.provider === 'twitter')

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Twitter callback processed',
      hasTwitter,
      user: session.user,
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  )
}
