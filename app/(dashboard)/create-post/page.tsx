'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function CreatePostPage() {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const providers = session?.user?.providers || {}
  const facebookConnected = Boolean(providers.facebook?.accessToken)
  const instagramConnected = Boolean(providers.instagram?.accessToken)
  const twitterConnected = Boolean(providers.twitter?.accessToken)

  const publishToFacebook = async () => {
    setStatus('')

    if (!facebookConnected) {
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
        body: JSON.stringify({ 
          message: content,
          provider: 'facebook'
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Unable to publish to Facebook.')
      }

      const data = await response.json()
      setStatus(`✓ Published to Facebook: ${data.id}`)
      setContent('')
    } catch (publishError) {
      setStatus(`✗ ${publishError instanceof Error ? publishError.message : 'Failed to publish to Facebook.'}`)
    } finally {
      setLoading(false)
    }
  }

  const publishToInstagram = async () => {
    setStatus('Instagram publishing coming soon.')
  }

  const publishToTwitter = async () => {
    setStatus('X publishing coming soon.')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create Post</h1>

      {/* Connected Providers Status */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 ${facebookConnected ? 'bg-blue-50 border border-blue-300' : 'bg-gray-50 border border-gray-300'}`}>
          <p className="text-sm font-medium">Facebook</p>
          <p className={facebookConnected ? 'text-blue-600' : 'text-gray-500'}>
            {facebookConnected ? '✓ Connected' : '✗ Not Connected'}
          </p>
        </div>
        <div className={`rounded-xl p-4 ${instagramConnected ? 'bg-pink-50 border border-pink-300' : 'bg-gray-50 border border-gray-300'}`}>
          <p className="text-sm font-medium">Instagram</p>
          <p className={instagramConnected ? 'text-pink-600' : 'text-gray-500'}>
            {instagramConnected ? '✓ Connected' : '✗ Not Connected'}
          </p>
        </div>
        <div className={`rounded-xl p-4 ${twitterConnected ? 'bg-slate-50 border border-slate-300' : 'bg-gray-50 border border-gray-300'}`}>
          <p className="text-sm font-medium">X (Twitter)</p>
          <p className={twitterConnected ? 'text-slate-600' : 'text-gray-500'}>
            {twitterConnected ? '✓ Connected' : '✗ Not Connected'}
          </p>
        </div>
      </div>

      {!facebookConnected && !instagramConnected && !twitterConnected ? (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
          <p>No social platforms connected. <Link href="/accounts" className="underline font-semibold">Connect now</Link></p>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post here..."
          className="w-full h-52 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center flex-wrap">
          <button
            onClick={publishToFacebook}
            disabled={loading || !facebookConnected}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Publishing...' : 'Post to Facebook'}
          </button>

          <button
            type="button"
            onClick={publishToInstagram}
            disabled={!instagramConnected}
            className="bg-pink-600 text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post to Instagram
          </button>

          <button
            type="button"
            onClick={publishToTwitter}
            disabled={!twitterConnected}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

        {status ? (
          <p className={`mt-4 text-sm ${status.startsWith('✓') ? 'text-green-700' : 'text-red-700'}`}>
            {status}
          </p>
        ) : null}
      </div>
    </div>
  )
}