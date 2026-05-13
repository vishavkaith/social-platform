/**
 * Provider helper utilities for managing social provider connections.
 * These utilities handle common operations like checking connection status,
 * accessing tokens, and fetching provider metadata.
 */

import type { Session } from 'next-auth'
import type { SocialProvider, SocialProvidersMap } from '@/types/social'

/**
 * Get all connected providers and their tokens from the session
 * @param session - NextAuth session (can be null)
 * @returns Map of connected providers and their tokens
 */
export function getConnectedProviders(session: Session | null | undefined): SocialProvidersMap {
  return session?.user?.providers ?? {}
}

/**
 * Check if a specific provider is connected
 * @param session - NextAuth session
 * @param provider - Provider to check (facebook, instagram, twitter)
 * @returns true if provider is connected and has an access token
 */
export function isProviderConnected(
  session: Session | null | undefined,
  provider: SocialProvider
): boolean {
  const providers = getConnectedProviders(session)
  return Boolean(providers[provider]?.accessToken)
}

/**
 * Get the access token for a specific provider
 * Useful for making API calls to the provider
 * @param session - NextAuth session
 * @param provider - Provider to get token for
 * @returns Access token string or undefined if not connected
 */
export function getProviderAccessToken(
  session: Session | null | undefined,
  provider: SocialProvider
): string | undefined {
  return getConnectedProviders(session)[provider]?.accessToken
}

/**
 * Get the provider account ID (e.g., Facebook Page ID)
 * Useful for displaying which account is connected
 * @param session - NextAuth session
 * @param provider - Provider to get account ID for
 * @returns Provider account ID or undefined
 */
export function getProviderAccountId(
  session: Session | null | undefined,
  provider: SocialProvider
): string | undefined {
  return getConnectedProviders(session)[provider]?.providerAccountId
}

/**
 * Get count of connected providers
 * Useful for displaying connection status summary
 * @param session - NextAuth session
 * @returns Number of connected providers
 */
export function getConnectedProviderCount(session: Session | null | undefined): number {
  return Object.keys(getConnectedProviders(session)).length
}

/**
 * Get list of all connected provider names
 * @param session - NextAuth session
 * @returns Array of provider names
 */
export function getConnectedProviderList(session: Session | null | undefined): SocialProvider[] {
  return Object.keys(getConnectedProviders(session)) as SocialProvider[]
}

/**
 * Check if any providers are connected
 * @param session - NextAuth session
 * @returns true if at least one provider is connected
 */
export function hasAnyProviderConnected(session: Session | null | undefined): boolean {
  return getConnectedProviderCount(session) > 0
}

/**
 * Metadata for displaying provider information in the UI
 * Contains names, descriptions, colors, and button styles
 */
export const providerMetadata = {
  facebook: {
    id: 'facebook' as const,
    name: 'Facebook',
    displayName: 'Facebook',
    description: 'Connect Facebook Pages to publish posts and manage engagement.',
    apiVersion: 'v19.0',
    scopes: ['public_profile', 'pages_show_list', 'pages_read_engagement'],
    features: ['posts', 'comments', 'insights'],
    icon: 'facebook',
    color: '#1877F2',
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-500',
    hoverBg: 'hover:bg-blue-700',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  instagram: {
    id: 'instagram' as const,
    name: 'Instagram',
    displayName: 'Instagram',
    description: 'Connect Instagram to manage media, stories, and profile content.',
    apiVersion: 'graph',
    scopes: ['user_profile', 'user_media'],
    features: ['stories', 'media', 'insights', 'messages'],
    icon: 'instagram',
    color: '#E1306C',
    bgColor: 'bg-gradient-to-r from-pink-500 to-purple-600',
    borderColor: 'border-pink-500',
    hoverBg: 'hover:opacity-90',
    textColor: 'text-pink-600',
    badgeColor: 'bg-pink-100 text-pink-800',
  },
  twitter: {
    id: 'twitter' as const,
    name: 'X',
    displayName: 'X (Twitter)',
    description: 'Connect X to schedule and publish tweets from your dashboard.',
    apiVersion: 'v2',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    features: ['tweets', 'replies', 'analytics'],
    icon: 'twitter',
    color: '#000000',
    bgColor: 'bg-slate-900',
    borderColor: 'border-slate-700',
    hoverBg: 'hover:bg-slate-800',
    textColor: 'text-slate-600',
    badgeColor: 'bg-slate-100 text-slate-800',
  },
} as const

/**
 * List of all supported providers
 */
export const supportedProviders: SocialProvider[] = ['facebook', 'instagram', 'twitter']

/**
 * Get metadata for a specific provider
 * @param provider - Provider name
 * @returns Provider metadata object
 */
export function getProviderMetadata(provider: SocialProvider) {
  return providerMetadata[provider]
}

/**
 * Get all provider metadata
 * @returns Object containing metadata for all providers
 */
export function getAllProviderMetadata() {
  return providerMetadata
}
