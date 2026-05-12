'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function CreatePostPage() {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const connected = Boolean(session?.user?.accessToken)

  const publishToFacebook = async () => {
    setStatus('')

    if (!connected) {
      setStatus('Please connect Facebook first from the Accounts page.')
      return
    }

    if (!content.trim()) {
      setStatus('Enter some text before publishing.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || 'Unable to publish to Facebook.')
      }

      const data = await response.json()
      setStatus(`Published to Facebook: ${data.id}`)
      setContent('')
    } catch (publishError) {
      setStatus(publishError instanceof Error ? publishError.message : 'Failed to publish to Facebook.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create Post</h1>

      {!connected ? (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
          Connect Facebook first in Accounts before posting.
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post here..."
          className="w-full h-52 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            onClick={publishToFacebook}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Post to Facebook'}
          </button>

          <button
            type="button"
            onClick={() => setStatus('Instagram publishing coming soon.')}
            className="bg-pink-600 text-white px-6 py-3 rounded-xl"
          >
            Post to Instagram
          </button>

          <button
            type="button"
            onClick={() => setStatus('X publishing coming soon.')}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl"
          >
            Post to X
          </button>

          <button className="bg-black text-white px-6 py-3 rounded-xl">
            Upload Image
          </button>

          <input
            type="datetime-local"
            className="border rounded-xl px-4 py-3"
          />
        </div>

        {status ? <p className="mt-4 text-sm text-gray-700">{status}</p> : null}
      </div>
    </div>
  )
}