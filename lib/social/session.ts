/**
 * Session utilities for accessing social provider information from NextAuth session.
 * These are convenience wrappers around the provider helpers for common use cases.
 */

import type { Session } from 'next-auth'
import type { SocialProvider, SocialProvidersMap } from '@/types/social'
import {
  getConnectedProviders,
  isProviderConnected,
  getProviderAccessToken,
  getProviderAccountId,
  getConnectedProviderCount,
  getConnectedProviderList,
  hasAnyProviderConnected,
} from './providers'

/**
 * Get all connected providers from session
 * @deprecated Use getConnectedProviders from lib/social/providers instead
 */
export function getSocialProviders(session: Session | null | undefined): SocialProvidersMap {
  return getConnectedProviders(session)
}

/**
 * Check if a social provider is connected to the current session
 * @param session - NextAuth session
 * @param provider - Provider to check
 * @returns true if provider is connected and has valid access token
 */
export function isSocialProviderConnected(
  session: Session | null | undefined,
  provider: SocialProvider
): boolean {
  return isProviderConnected(session, provider)
}

/**
 * Get access token for a social provider
 * @param session - NextAuth session
 * @param provider - Provider name
 * @returns Access token string or undefined
 */
export function getSocialProviderAccessToken(
  session: Session | null | undefined,
  provider: SocialProvider
): string | undefined {
  return getProviderAccessToken(session, provider)
}

/**
 * Get provider account ID from session
 * @param session - NextAuth session
 * @param provider - Provider name
 * @returns Provider account ID or undefined
 */
export function getSocialProviderAccountId(
  session: Session | null | undefined,
  provider: SocialProvider
): string | undefined {
  return getProviderAccountId(session, provider)
}

/**
 * Get count of all connected social providers
 * @param session - NextAuth session
 * @returns Number of connected providers
 */
export function getConnectedSocialProvidersCount(session: Session | null | undefined): number {
  return getConnectedProviderCount(session)
}

/**
 * Get list of all connected social providers
 * @param session - NextAuth session
 * @returns Array of provider names
 */
export function getConnectedSocialProvidersList(session: Session | null | undefined): SocialProvider[] {
  return getConnectedProviderList(session)
}

/**
 * Check if user has at least one social provider connected
 * @param session - NextAuth session
 * @returns true if any provider is connected
 */
export function hasAnySocialProviderConnected(session: Session | null | undefined): boolean {
  return hasAnyProviderConnected(session)
}
