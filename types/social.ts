/**
 * Supported social media providers for OAuth integration
 */
export type SocialProvider = 'facebook' | 'instagram' | 'twitter'

/**
 * Token data for a single social provider
 * Stores both the access token and provider account ID (e.g., Facebook Page ID)
 */
export interface SocialProviderToken {
  /** OAuth access token for making API calls */
  accessToken: string
  /** Provider's unique ID for the connected account (e.g., Facebook user/page ID) */
  providerAccountId?: string
}

/**
 * Map of all connected social providers and their tokens
 * Example: { facebook: { accessToken: "...", providerAccountId: "12345" }, twitter: { accessToken: "...", ... } }
 */
export type SocialProvidersMap = Partial<Record<SocialProvider, SocialProviderToken>>
