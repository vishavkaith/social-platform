import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import axios from 'axios'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    return new Response(JSON.stringify({ error: 'Facebook access token required.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  const body = await req.json()
  const message = body?.message?.trim()

  if (!message) {
    return new Response(JSON.stringify({ error: 'Please provide a message to publish.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const response = await axios.post('https://graph.facebook.com/v17.0/me/feed', null, {
      params: {
        access_token: session.user.accessToken,
        message,
      },
    })

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to publish to Facebook.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
