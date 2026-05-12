import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import FacebookProvider from 'next-auth/providers/facebook'
import InstagramProvider from 'next-auth/providers/instagram'
import TwitterProvider from 'next-auth/providers/twitter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken?: string
      providers?: {
        facebook?: {
          accessToken: string
          providerAccountId: string
        }
        instagram?: {
          accessToken: string
          providerAccountId: string
        }
        twitter?: {
          accessToken: string
          providerAccountId: string
        }
      }
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string | number
    accessToken?: string
    providers?: {
      facebook?: {
        accessToken: string
        providerAccountId: string
      }
      instagram?: {
        accessToken: string
        providerAccountId: string
      }
      twitter?: {
        accessToken: string
        providerAccountId: string
      }
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID ?? '',
      clientSecret: process.env.FACEBOOK_APP_SECRET ?? '',
      authorization: {
        params: {
          scope: 'email,public_profile,pages_show_list,pages_read_engagement',
          auth_type: 'rerequest',
        },
      },
      profile(profile) {
        const userData: any = {
          id: profile.id,
          name: profile.name || `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim(),
          image: profile.picture?.data?.url,
        }

        if (profile.email) {
          userData.email = profile.email
        }

        return userData
      },
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID ?? '',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'user_profile,user_media',
        },
      },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
      version: '2.0',
    }),
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
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.debug('signIn callback', { user, account, profile })

      // For OAuth providers, ensure user exists in database
      if (account?.provider !== 'credentials' && user?.id && account) {
        try {
          // Check if the user already exists by provider account or email.
          const searchByEmail = user.email ? { email: user.email } : undefined

          let existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                {
                  accounts: {
                    some: {
                      provider: account.provider,
                      providerAccountId: user.id,
                    },
                  },
                },
                ...(searchByEmail ? [searchByEmail] : []),
              ],
            },
          })

          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                image: user.image,
              },
            })
          }

          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: user.id,
              },
            },
          })

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: user.id,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                expires_at: account.expires_at,
                refresh_token: account.refresh_token,
              }
            })
          }

          // Update user ID for NextAuth
          user.id = existingUser.id.toString()

        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allow same-origin callback URLs
      else if (new URL(url).origin === baseUrl) return url
      // Default to dashboard
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user, account }) {
      if (user) {
        const userId = Number(user.id)
        token.id = Number.isNaN(userId) ? user.id : userId
        token.email = user.email
        token.name = user.name
      }

      if (account?.access_token && user) {
        if (!token.providers) {
          token.providers = {}
        }
        const provider = account.provider as keyof typeof token.providers
        if (provider === 'facebook' || provider === 'instagram' || provider === 'twitter') {
          token.providers[provider] = {
            accessToken: account.access_token,
            providerAccountId: account.providerAccountId || '',
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id)
        session.user.email = token.email as string
        session.user.name = token.name as string
        
        // Load all connected accounts from the database
        try {
          const userId = typeof token.id === 'string' ? parseInt(token.id, 10) : token.id
          
          if (!isNaN(userId)) {
            const accounts = await prisma.account.findMany({
              where: { userId },
            })

            session.user.providers = {}

            for (const account of accounts) {
              const provider = account.provider as keyof typeof session.user.providers
              if (provider === 'facebook' || provider === 'instagram' || provider === 'twitter') {
                if (account.access_token) {
                  session.user.providers[provider] = {
                    accessToken: account.access_token,
                    providerAccountId: account.providerAccountId,
                  }
                }
              }
            }

            // Keep the first available token for backward compatibility
            const firstProvider = Object.keys(session.user.providers)[0] as keyof typeof session.user.providers | undefined
            if (firstProvider && session.user.providers[firstProvider]) {
              session.user.accessToken = session.user.providers[firstProvider].accessToken
            }
          }
        } catch (error) {
          console.error('Error loading user accounts:', error)
        }
      }
      return session
    },
  },
  events: {
    async linkAccount({ user, account }) {
      // This event fires when an OAuth account is linked to a user
      // It helps with account linking workflows
    },
  },
}