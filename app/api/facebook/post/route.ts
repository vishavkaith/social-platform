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
  const message = body?.message?.trim()
  const provider = body?.provider || 'facebook'

  if (!message) {
    return new Response(JSON.stringify({ error: 'Please provide a message to publish.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    // Get the Facebook account and access token from database
    const account = await prisma.account.findFirst({
      where: {
        userId: parseInt(session.user.id),
        provider: provider,
      },
    })

    if (!account?.access_token) {
      return new Response(JSON.stringify({ error: `${provider} access token not found. Please connect ${provider} first.` }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }

    const response = await axios.post('https://graph.facebook.com/v17.0/me/feed', null, {
      params: {
        access_token: account.access_token,
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
