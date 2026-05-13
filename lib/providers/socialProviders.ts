import FacebookProvider from 'next-auth/providers/facebook'
import InstagramProvider from 'next-auth/providers/instagram'
import TwitterProvider from 'next-auth/providers/twitter'
import type { Provider } from 'next-auth/providers'
import type { SocialProvider } from '@/types/social'

/**
 * Provider configuration metadata for UI display and provider-specific settings.
 * This centralized configuration makes it easy to add new providers and customize their appearance.
 */
export const providerConfig: Record<SocialProvider, {
  name: string
  displayName: string
  description: string
  scopes: string[]
  features: string[]
  color: string
  icon: string
}> = {
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    description: 'Connect Facebook Pages to publish posts and manage engagement.',
    scopes: [
     // 'email',
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
    //  'pages_manage_posts',
    ],
    features: ['posts', 'comments', 'insights'],
    color: '#1877F2',
    icon: 'facebook',
  },
  instagram: {
    name: 'instagram',
    displayName: 'Instagram',
    description: 'Connect Instagram to manage media, stories, and profile content.',
    scopes: ['user_profile', 'user_media'],
    features: ['stories', 'media', 'insights', 'messages'],
    color: '#E1306C',
    icon: 'instagram',
  },
  twitter: {
    name: 'twitter',
    displayName: 'X (Twitter)',
    description: 'Connect X to schedule and publish tweets from your dashboard.',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    features: ['tweets', 'replies', 'analytics'],
    color: '#000000',
    icon: 'twitter',
  },
} as const

/**
 * Supported social providers (used for validation and iteration)
 */
export const supportedSocialProviders: SocialProvider[] = Object.keys(
  providerConfig,
) as SocialProvider[]

/**
 * Legacy metadata for backward compatibility
 * @deprecated Use providerConfig and lib/social/providers instead
 */
export const socialProviderMetadata = {
  facebook: {
    id: 'facebook' as const,
    name: 'Facebook',
    description: 'Connect Facebook Pages and publish posts through the dashboard.',
    buttonLabel: 'Connect Facebook',
    reconnectLabel: 'Reconnect Facebook',
    colorClass: 'border-blue-500',
    buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
    statusClass: 'text-blue-600',
  },
  instagram: {
    id: 'instagram' as const,
    name: 'Instagram',
    description: 'Connect Instagram to manage media and profile content.',
    buttonLabel: 'Connect Instagram',
    reconnectLabel: 'Reconnect Instagram',
    colorClass: 'border-pink-500',
    buttonClass: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white',
    statusClass: 'text-pink-600',
  },
  twitter: {
    id: 'twitter' as const,
    name: 'X (Twitter)',
    description: 'Connect X to schedule and publish tweets from your dashboard.',
    buttonLabel: 'Connect X',
    reconnectLabel: 'Reconnect X',
    colorClass: 'border-slate-700',
    buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white',
    statusClass: 'text-slate-600',
  },
} as const

/**
 * NextAuth provider instances with OAuth configuration.
 * Each provider is pre-configured with the necessary scopes and redirect settings.
 *
 * These providers are automatically handled by NextAuth:
 * - Authorization flow
 * - Token refresh
 * - Account linking
 * - PrismaAdapter integration
 */
export const authProviders: Provider[] = [
  FacebookProvider({
    clientId: process.env.FACEBOOK_APP_ID ?? '',
    clientSecret: process.env.FACEBOOK_APP_SECRET ?? '',
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: providerConfig.facebook.scopes.join(','),
        auth_type: 'rerequest',
      },
    },
    profile(profile) {
      // Ensure we extract the Facebook user profile data correctly
      const name =
        profile.name || `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()

      return {
        id: profile.id,
        name,
        email: profile.email,
        image: profile.picture?.data?.url,
      }
    },
  }),

  InstagramProvider({
    clientId: process.env.INSTAGRAM_CLIENT_ID ?? '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET ?? '',
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: providerConfig.instagram.scopes.join(','),
      },
    },
  }),

  TwitterProvider({
    clientId: process.env.TWITTER_CLIENT_ID ?? '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
    version: '2.0',
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: providerConfig.twitter.scopes.join(' '),
      },
    },
  }),
]

/**
 * Helper to get provider configuration
 * @param provider - Provider name
 * @returns Provider configuration object
 */
export function getProviderConfig(provider: SocialProvider) {
  return providerConfig[provider]
}

/**
 * Helper to get all provider configurations
 * @returns Record of all provider configurations
 */
export function getAllProviderConfigs() {
  return providerConfig
}
