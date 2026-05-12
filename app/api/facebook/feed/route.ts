import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import axios from 'axios'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    return new Response(JSON.stringify({ error: 'Facebook access token required.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const response = await axios.get('https://graph.facebook.com/v17.0/me/feed', {
      params: {
        access_token: session.user.accessToken,
        fields: 'id,message,story,created_time',
        limit: 10,
      },
    })

    return new Response(JSON.stringify(response.data.data), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load Facebook feed.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
