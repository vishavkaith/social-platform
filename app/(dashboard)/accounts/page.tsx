'use client'

import { signIn, useSession } from 'next-auth/react'

export default function AccountsPage() {
  const { data: session } = useSession()

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Connected Accounts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Facebook</h2>
          <p className="text-gray-500 mb-6">Connect your Facebook Pages and publish posts.</p>
          <button
            onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            {session?.user?.accessToken ? 'Reconnect Facebook' : 'Connect Facebook'}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Instagram</h2>
          <p className="text-gray-500 mb-6">Connect your Instagram account for media and feed access.</p>
          <button
            onClick={() => signIn('instagram', { callbackUrl: '/dashboard' })}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl"
          >
            Connect Instagram
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">X (Twitter)</h2>
          <p className="text-gray-500 mb-6">Connect X to fetch and publish tweets.</p>
          <button
            onClick={() => signIn('twitter', { callbackUrl: '/dashboard' })}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl"
          >
            Connect X
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">WhatsApp</h2>
          <p className="text-gray-500 mb-6">WhatsApp integration requires WhatsApp Business API setup.</p>
          <button
            className="bg-gray-500 text-white px-6 py-3 rounded-xl opacity-60 cursor-not-allowed"
            disabled
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  )
}