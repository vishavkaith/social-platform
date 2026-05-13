import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { authProviders } from '@/lib/providers/socialProviders'
import type { SocialProvider, SocialProvidersMap } from '@/types/social'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        }
      },
    }),
    ...authProviders,
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('[next-auth][error]', code, metadata)
    },
    warn(code) {
      console.warn('[next-auth][warn]', code)
    },
    debug(code, metadata) {
      console.debug('[next-auth][debug]', code, metadata)
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    /**
     * SignIn callback - Allows or denies user sign-in.
     * Returning false triggers AccessDenied error.
     * For OAuth providers, we allow all sign-ins (PrismaAdapter handles user creation).
     * For credentials, authorization already filtered invalid users.
     */
    async signIn({ user, account, profile }) {
      try {
        // Allow all sign-ins - PrismaAdapter handles account creation/linking
        // User object is already validated by the provider
        if (!user?.id) {
          console.warn('[auth] signIn: Missing user.id', { account, profile })
          return false
        }
        return true
      } catch (error) {
        console.error('[auth] signIn error:', error)
        return false
      }
    },

    /**
     * JWT callback - Stores account/provider info in the JWT token.
     * This token is then used in the session callback and sent to the client.
     * Essential for accessing provider access tokens and provider account IDs.
     */
    async jwt({ token, account, user, profile }) {
      try {
        // Store user ID
        if (user?.id) {
          token.id = String(user.id)
        }

        // When OAuth account is first linked or refreshed, store provider data
        if (account) {
          const providerKey = account.provider as SocialProvider

          // Initialize providers object if it doesn't exist
          if (!token.providers) {
            token.providers = {}
          }

          // Store provider-specific tokens and info
          ;(token.providers as SocialProvidersMap)[providerKey] = {
            accessToken: account.access_token || '',
            providerAccountId: account.providerAccountId || undefined,
          }

          // Also set current provider info
          token.provider = account.provider
          token.accessToken = account.access_token || ''
        }

        return token
      } catch (error) {
        console.error('[auth] JWT callback error:', error, { account, user })
        return token
      }
    },

    /**
     * Session callback - Exposes JWT token data to the client session.
     * This is what the frontend receives when calling useSession().
     * Includes user ID, connected providers, and access tokens.
     */
    async session({ session, token }) {
      try {
        if (!session.user) {
          return session
        }

        // Expose JWT token data to session
        session.user.id = String(token.id || '')
        session.user.provider = (token.provider as SocialProvider) || undefined
        session.user.accessToken = (token.accessToken as string) || undefined
        session.user.providers = (token.providers as SocialProvidersMap) || {}

        return session
      } catch (error) {
        console.error('[auth] Session callback error:', error)
        return session
      }
    },

    /**
     * Redirect callback - Controls where users are redirected after sign-in/sign-out.
     * Allows relative URLs and same-origin URLs, otherwise redirects to dashboard.
     */
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      // Allow same-origin URLs
      try {
        const urlObj = new URL(url)
        if (urlObj.origin === baseUrl) {
          return url
        }
      } catch {
        // Invalid URL, fall through to default
      }

      // Default redirect to dashboard
      return `${baseUrl}/dashboard`
    },
  },

  /**
   * Events - Hooks that fire at key points in the auth lifecycle.
   * Currently logging linkAccount events for debugging and future webhook support.
   */
  events: {
    async linkAccount({ user, account, profile }) {
      // Fires when an OAuth account is linked to an existing user
      // Useful for logging, analytics, and triggering webhooks
      console.log('[auth] Account linked:', {
        userId: user.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      })
    },
  },
}