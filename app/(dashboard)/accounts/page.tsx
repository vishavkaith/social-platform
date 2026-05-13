'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import {
  isSocialProviderConnected,
  getSocialProviderAccountId,
} from '@/lib/social/session'
import { supportedProviders, getProviderMetadata } from '@/lib/social/providers'
import type { SocialProvider } from '@/types/social'

export default function AccountsPage() {
  const { data: session, status } = useSession()
  const [isConnecting, setIsConnecting] = useState<SocialProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isLoading = status === 'loading'

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleConnect = async (provider: SocialProvider) => {
    try {
      setIsConnecting(provider)
      setError(null)

      // signIn will redirect to the provider's OAuth flow
      await signIn(provider, {
        callbackUrl: '/accounts',
        redirect: true,
      })
    } catch (err) {
      setError(`Failed to connect ${provider}. Please try again.`)
      setIsConnecting(null)
      console.error(`[accounts] Error connecting ${provider}:`, err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Connected Accounts</h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage your social media connections for publishing and engagement.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="mt-4 text-slate-600">Loading your connections...</p>
            </div>
          </div>
        )}

        {/* Provider Cards Grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {supportedProviders.map((provider) => {
                const metadata = getProviderMetadata(provider)
                const connected = isSocialProviderConnected(session, provider)
                const providerAccountId = getSocialProviderAccountId(session, provider)
                const isConnectingThisProvider = isConnecting === provider

                return (
                  <div
                    key={provider}
                    className={`bg-white rounded-2xl p-8 shadow-sm border-2 transition-all ${
                      connected
                        ? `${metadata.borderColor} shadow-md`
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Provider Name & Status */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {metadata.displayName}
                        </h2>
                        {connected && (
                          <div className={`flex items-center gap-2 mt-2 ${metadata.badgeColor} w-fit px-3 py-1 rounded-full`}>
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-semibold">Connected</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 text-sm">
                      {metadata.description}
                    </p>

                    {/* Account Info (if connected) */}
                    {connected && providerAccountId && (
                      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Connected Account
                        </p>
                        <p className="text-sm font-mono text-gray-900 break-all">
                          {providerAccountId}
                        </p>
                      </div>
                    )}

                    {connected && !providerAccountId && (
                      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                          Info
                        </p>
                        <p className="text-sm text-blue-700">
                          Connected, but provider account ID not available. This may be normal for some providers.
                        </p>
                      </div>
                    )}

                    {/* Features List (if connected) */}
                    {connected && metadata.features && (
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                          Available Features
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {metadata.features.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                            >
                              <svg
                                className="h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleConnect(provider)}
                      disabled={isConnectingThisProvider || isLoading}
                      className={`w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        isConnectingThisProvider
                          ? 'cursor-wait'
                          : ''
                      } ${metadata.bgColor} ${metadata.hoverBg}`}
                    >
                      {isConnectingThisProvider ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Connecting...
                        </span>
                      ) : connected ? (
                        'Reconnect'
                      ) : (
                        'Connect'
                      )}
                    </button>
                  </div>
                )
              })}

              {/* Coming Soon: WhatsApp */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">WhatsApp</h2>
                    <div className="flex items-center gap-2 mt-2 bg-gray-100 text-gray-700 w-fit px-3 py-1 rounded-full">
                      <span className="text-sm font-semibold">Coming Soon</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm">
                  WhatsApp integration requires WhatsApp Business API setup. Support coming soon.
                </p>
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl bg-gray-400 px-6 py-3 text-white font-semibold opacity-60 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Connection Status Summary</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supportedProviders.map((provider) => {
                  const metadata = getProviderMetadata(provider)
                  const connected = isSocialProviderConnected(session, provider)

                  return (
                    <div
                      key={provider}
                      className={`rounded-xl border-2 p-4 ${
                        connected
                          ? `${metadata.borderColor} bg-green-50`
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-700">
                        {metadata.displayName}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {connected ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <p className="font-semibold text-green-700">Active</p>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            <p className="font-semibold text-gray-700">Not Connected</p>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {!session?.user?.providers || Object.keys(session.user.providers).length === 0 ? (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">No providers connected yet.</span> Start by connecting your first social account above to begin scheduling posts.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">
                      {Object.keys(session.user.providers).length} provider(s) connected.
                    </span>{' '}
                    You're ready to start publishing!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
