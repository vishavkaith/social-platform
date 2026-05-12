'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

type FacebookPost = {
  id: string
  message?: string
  story?: string
  created_time?: string
}

export default function FeedsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const connected = Boolean(session?.user?.accessToken)

  const fetchFacebookFeed = async () => {
    if (!connected) {
      setError('Please connect Facebook first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/facebook/feed')
      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || 'Unable to fetch Facebook feed.')
      }

      const data = await response.json()
      setPosts(data)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load Facebook feed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Social Feeds</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={fetchFacebookFeed}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Facebook
        </button>

        <button
          onClick={() => setError('Instagram feed support coming soon.')}
          className="bg-pink-600 text-white px-6 py-3 rounded-xl"
        >
          Instagram
        </button>

        <button
          onClick={() => setError('X feed support coming soon.')}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl"
        >
          X
        </button>

        <button
          onClick={() => setError('WhatsApp feed support is not available yet.')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          WhatsApp
        </button>
      </div>

      {!connected ? (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
          Connect Facebook first from the Accounts page before loading your feed.
        </div>
      ) : null}

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        {loading ? (
          <p className="text-gray-500">Loading feed...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-xl p-4">
                <p className="text-sm text-gray-400">{post.created_time}</p>
                <p className="text-gray-900">{post.message ?? post.story ?? 'No text available'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Feed data will appear here.</p>
        )}
      </div>
    </div>
  )
}