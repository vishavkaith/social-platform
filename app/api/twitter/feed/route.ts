import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import axios from 'axios'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    return new Response(JSON.stringify({ error: 'Twitter access token required.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const response = await axios.get('https://api.twitter.com/2/users/me/tweets', {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      params: {
        'tweet.fields': 'created_at,public_metrics,author_id',
        max_results: 10,
      },
    })

    return new Response(JSON.stringify(response.data.data || []), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load Twitter feed.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
