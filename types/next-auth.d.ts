import type { DefaultSession } from 'next-auth'
import type { SocialProvider, SocialProvidersMap } from '@/types/social'

/**
 * Extended NextAuth Session type.
 * Adds social provider information to the default session.
 * Available after calling useSession() on the client.
 */
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      /** User ID from database */
      id: string
      /** Currently selected provider (set during OAuth flow) */
      provider?: SocialProvider
      /** Current provider's access token (deprecated in favor of providers object) */
      accessToken?: string
      /** Map of all connected providers and their tokens */
      providers?: SocialProvidersMap
    }
  }

  interface User {
    id: string
  }
}

/**
 * Extended NextAuth JWT token type.
 * Stores provider data in the JWT for later retrieval in session callback.
 * This is used internally by NextAuth and not sent to the client directly.
 */
declare module 'next-auth/jwt' {
  interface JWT {
    /** User ID from database */
    id?: string
    /** Currently selected provider (set during OAuth flow) */
    provider?: SocialProvider
    /** Current provider's access token (deprecated in favor of providers object) */
    accessToken?: string
    /** Map of all connected providers and their tokens */
    providers?: SocialProvidersMap
  }
}
