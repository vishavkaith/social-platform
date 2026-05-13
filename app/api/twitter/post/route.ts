import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  const body = await req.json()
  const text = body?.message?.trim() || body?.text?.trim()
  const provider = body?.provider || 'twitter'

  if (!text) {
    return new Response(JSON.stringify({ error: 'Please provide a message to publish.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  if (text.length > 280) {
    return new Response(JSON.stringify({ error: 'Tweet must be 280 characters or less.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    // Get the Twitter account and access token from database
    const account = await prisma.account.findFirst({
      where: {
        userId: parseInt(session.user.id),
        provider: provider,
      },
    })

    if (!account?.access_token) {
      return new Response(
        JSON.stringify({ error: `${provider} access token not found. Please connect ${provider} first.` }),
        {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      { text },
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      }
    )

    return new Response(JSON.stringify(response.data), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to post tweet.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
