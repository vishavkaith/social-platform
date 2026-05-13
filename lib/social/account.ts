/**
 * Social account utilities for managing OAuth accounts and future publishing operations.
 * These utilities provide helpers for fetching account data, managing credentials,
 * and preparing infrastructure for posting to social media.
 */

import { prisma } from '@/lib/prisma'
import type { SocialProvider } from '@/types/social'

/**
 * Get a specific provider account for a user
 * @param userId - User ID (string or number)
 * @param provider - Provider name (facebook, instagram, twitter)
 * @returns Account record or null
 */
export async function getConnectedSocialAccount(userId: string | number, provider: SocialProvider) {
  try {
    const parsedUserId = typeof userId === 'string' ? Number(userId) : userId

    if (Number.isNaN(parsedUserId)) {
      console.warn('[account] Invalid user ID provided:', userId)
      return null
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: parsedUserId,
        provider,
      },
    })

    return account
  } catch (error) {
    console.error('[account] Error fetching connected account:', error, { provider })
    return null
  }
}

/**
 * Get access token for a specific provider
 * @param userId - User ID (string or number)
 * @param provider - Provider name
 * @returns Access token string or null
 */
export async function getProviderAccessToken(
  userId: string | number,
  provider: SocialProvider
): Promise<string | null> {
  try {
    const account = await getConnectedSocialAccount(userId, provider)
    return account?.access_token ?? null
  } catch (error) {
    console.error('[account] Error getting provider access token:', error, { provider })
    return null
  }
}

/**
 * Get all connected accounts for a user
 * @param userId - User ID (string or number)
 * @returns Array of connected Account records from database
 */
export async function getUserConnectedAccounts(userId: string | number) {
  try {
    const parsedUserId = typeof userId === 'string' ? Number(userId) : userId

    if (Number.isNaN(parsedUserId)) {
      return []
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: parsedUserId,
      },
      select: {
        provider: true,
        providerAccountId: true,
        access_token: true,
        refresh_token: true,
        expires_at: true,
        scope: true,
      },
    })

    return accounts
  } catch (error) {
    console.error('[account] Error fetching connected accounts:', error)
    return []
  }
}

/**
 * Check if a provider account token is still valid
 * @param expiresAt - Token expiration timestamp (Unix seconds) or null for non-expiring tokens
 * @returns true if token is still valid or is long-lived (no expiration)
 */
export function isProviderTokenValid(expiresAt: number | null): boolean {
  // Some tokens don't expire (e.g., Facebook long-lived tokens)
  if (!expiresAt) {
    return true
  }

  // Check if token has expired (add 60 second buffer)
  const now = Math.floor(Date.now() / 1000)
  return expiresAt > now + 60
}

/**
 * Refresh a provider token if needed (for future implementation)
 * @param userId - User ID (string or number)
 * @param provider - Provider name
 * @returns Refreshed account or null
 *
 * Note: This is a placeholder for future implementation.
 * Different providers have different token refresh mechanisms:
 * - Facebook: Long-lived tokens, refresh flow exists
 * - Instagram: Inherits from Facebook
 * - Twitter: Refresh tokens available with offline.access scope
 */
export async function refreshProviderToken(userId: string | number, provider: SocialProvider) {
  try {
    const account = await getConnectedSocialAccount(userId, provider)

    if (!account) {
      console.warn('[account] Account not found for refresh:', { provider, userId })
      return null
    }

    if (isProviderTokenValid(account.expires_at)) {
      // Token is still valid, no refresh needed
      return account
    }

    // TODO: Implement provider-specific token refresh logic
    console.info('[account] Token refresh needed:', { provider, userId })
    return account
  } catch (error) {
    console.error('[account] Error refreshing token:', error, { provider })
    return null
  }
}

/**
 * Get publishing credentials for a provider
 * Returns all necessary information to make API calls to the provider
 * @param userId - User ID (string or number)
 * @param provider - Provider name
 * @returns Publishing credentials object or null
 */
export async function getProviderPublishingCredentials(userId: string | number, provider: SocialProvider) {
  try {
    const account = await getConnectedSocialAccount(userId, provider)

    if (!account || !account.access_token) {
      console.warn('[account] No account or token found:', { provider, userId })
      return null
    }

    // Ensure token is still valid
    const account_refreshed = await refreshProviderToken(userId, provider)
    if (!account_refreshed) {
      throw new Error('Failed to refresh provider token')
    }

    return {
      provider,
      userId,
      accessToken: account_refreshed.access_token,
      refreshToken: account_refreshed.refresh_token || undefined,
      expiresAt: account_refreshed.expires_at || undefined,
      providerAccountId: account_refreshed.providerAccountId,
      scope: account_refreshed.scope || undefined,
    }
  } catch (error) {
    console.error('[account] Error getting publishing credentials:', error, { provider })
    return null
  }
}

/**
 * Disconnect a provider account for a user
 * @param userId - User ID (string or number)
 * @param provider - Provider name
 * @returns true if successfully deleted
 */
export async function disconnectProviderAccount(
  userId: string | number,
  provider: SocialProvider
): Promise<boolean> {
  try {
    const parsedUserId = typeof userId === 'string' ? Number(userId) : userId

    if (Number.isNaN(parsedUserId)) {
      return false
    }

    const result = await prisma.account.deleteMany({
      where: {
        userId: parsedUserId,
        provider,
      },
    })

    if (result.count > 0) {
      console.info('[account] Provider account disconnected:', { provider, userId })
    }

    return result.count > 0
  } catch (error) {
    console.error('[account] Error disconnecting provider:', error, { provider })
    return false
  }
}

/**
 * Validate provider account setup
 * @param userId - User ID (string or number)
 * @param provider - Provider name
 * @returns Object with validation status and details
 */
export async function validateProviderAccount(userId: string | number, provider: SocialProvider) {
  try {
    const account = await getConnectedSocialAccount(userId, provider)

    const isValid = {
      exists: Boolean(account),
      hasAccessToken: Boolean(account?.access_token),
      tokenValid: account ? isProviderTokenValid(account.expires_at) : false,
      hasProviderAccountId: Boolean(account?.providerAccountId),
      scopes: account?.scope?.split(' ') ?? [],
    }

    return {
      provider,
      ...isValid,
      message:
        isValid.exists && isValid.hasAccessToken && isValid.tokenValid
          ? 'Account is ready for publishing'
          : 'Account needs reconnection or token refresh',
    }
  } catch (error) {
    console.error('[account] Error validating provider account:', error, { provider })
    return {
      provider,
      exists: false,
      hasAccessToken: false,
      tokenValid: false,
      hasProviderAccountId: false,
      scopes: [],
      message: 'Error validating account',
    }
  }
}

/**
 * Get all provider accounts validation status
 * @param userId - User ID (string or number)
 * @returns Array of validation results for each provider
 */
export async function validateAllProviderAccounts(userId: string | number) {
  try {
    const providers: SocialProvider[] = ['facebook', 'instagram', 'twitter']
    const results = await Promise.all(providers.map((p) => validateProviderAccount(userId, p)))
    return results
  } catch (error) {
    console.error('[account] Error validating all accounts:', error)
    return []
  }
}
