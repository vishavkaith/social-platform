'use client'

import { signIn, useSession } from 'next-auth/react'

export default function AccountsPage() {
  const { data: session } = useSession()
  const providers = session?.user?.providers || {}

  const facebookConnected = Boolean(providers.facebook?.accessToken)
  const instagramConnected = Boolean(providers.instagram?.accessToken)
  const twitterConnected = Boolean(providers.twitter?.accessToken)

  const handleConnect = async (provider: 'facebook' | 'instagram' | 'twitter') => {
    // Set up the provider parameter to indicate this is an additional account connection
    await signIn(provider, { 
      callbackUrl: '/accounts',
      redirect: true,
    })
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Connected Accounts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facebook */}
        <div className={`bg-white rounded-2xl p-8 shadow-sm border-2 ${facebookConnected ? 'border-blue-500' : 'border-gray-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Facebook</h2>
            {facebookConnected && <span className="text-green-600 text-sm font-semibold">✓ Connected</span>}
          </div>
          <p className="text-gray-500 mb-6">Connect your Facebook Pages and publish posts.</p>
          <button
            onClick={() => handleConnect('facebook')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            {facebookConnected ? 'Reconnect Facebook' : 'Connect Facebook'}
          </button>
        </div>

        {/* Instagram */}
        <div className={`bg-white rounded-2xl p-8 shadow-sm border-2 ${instagramConnected ? 'border-pink-500' : 'border-gray-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Instagram</h2>
            {instagramConnected && <span className="text-green-600 text-sm font-semibold">✓ Connected</span>}
          </div>
          <p className="text-gray-500 mb-6">Connect your Instagram account for media and feed access.</p>
          <button
            onClick={() => handleConnect('instagram')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition"
          >
            {instagramConnected ? 'Reconnect Instagram' : 'Connect Instagram'}
          </button>
        </div>

        {/* Twitter/X */}
        <div className={`bg-white rounded-2xl p-8 shadow-sm border-2 ${twitterConnected ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">X (Twitter)</h2>
            {twitterConnected && <span className="text-green-600 text-sm font-semibold">✓ Connected</span>}
          </div>
          <p className="text-gray-500 mb-6">Connect X to fetch and publish tweets.</p>
          <button
            onClick={() => handleConnect('twitter')}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition"
          >
            {twitterConnected ? 'Reconnect X' : 'Connect X'}
          </button>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-200">
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

      {/* Summary */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Connected Platforms Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Facebook</p>
            <p className={`font-semibold ${facebookConnected ? 'text-green-600' : 'text-red-600'}`}>
              {facebookConnected ? '✓ Active' : '✗ Not Connected'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Instagram</p>
            <p className={`font-semibold ${instagramConnected ? 'text-green-600' : 'text-red-600'}`}>
              {instagramConnected ? '✓ Active' : '✗ Not Connected'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">X (Twitter)</p>
            <p className={`font-semibold ${twitterConnected ? 'text-green-600' : 'text-red-600'}`}>
              {twitterConnected ? '✓ Active' : '✗ Not Connected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}