# Social Authentication Architecture Documentation

## Overview

This document explains the refactored social authentication system for the SaaS platform. The architecture is designed to be scalable, maintainable, and production-ready.

## Architecture Components

### 1. **Core Authentication** (`lib/auth.ts`)

The main NextAuth configuration file that orchestrates the entire OAuth flow.

**Key Components:**

- **CredentialsProvider**: Handles email/password login
- **OAuth Providers**: Facebook, Instagram, Twitter (from `lib/providers/socialProviders.ts`)
- **JWT Strategy**: Stores provider tokens in JWT for session security
- **PrismaAdapter**: Manages user/account creation and OAuth account linking

**Callbacks:**

- `signIn()`: Validates user before sign-in (returns false to trigger AccessDenied)
- `jwt()`: Stores account and provider information in the token
- `session()`: Exposes token data to the frontend session
- `redirect()`: Controls post-signin redirect destinations

**Events:**

- `linkAccount()`: Fires when OAuth account is linked to user (useful for webhooks/logging)

### 2. **OAuth Providers Configuration** (`lib/providers/socialProviders.ts`)

Centralized configuration for all OAuth providers.

**Structure:**

```typescript
providerConfig: Record<SocialProvider, {
  name: string              // Technical name (facebook, instagram, twitter)
  displayName: string       // UI display name (Facebook, Instagram, X)
  description: string       // UI description
  scopes: string[]          // Required OAuth scopes
  features: string[]        // Available features
  color: string             // Brand color
  icon: string              // Icon name
}>

authProviders: Provider[]   // NextAuth provider instances
```

**Adding a New Provider (e.g., LinkedIn):**

```typescript
// 1. Add to providerConfig
linkedin: {
  name: 'linkedin',
  displayName: 'LinkedIn',
  description: 'Connect LinkedIn to share and manage content.',
  scopes: ['r_liteprofile', 'r_basicprofile', 'w_member_social'],
  features: ['posts', 'articles', 'analytics'],
  color: '#0077B5',
  icon: 'linkedin',
}

// 2. Add to authProviders
LinkedinProvider({
  clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
  authorization: {
    params: {
      scope: providerConfig.linkedin.scopes.join(','),
    },
  },
})

// 3. Update SocialProvider type in types/social.ts
export type SocialProvider = 'facebook' | 'instagram' | 'twitter' | 'linkedin'
```

### 3. **Type Definitions** (`types/next-auth.d.ts` & `types/social.ts`)

**NextAuth Session Extension:**

```typescript
Session.user extends {
  id: string                    // User database ID
  provider?: SocialProvider     // Currently active provider
  accessToken?: string          // Current provider's token
  providers?: SocialProvidersMap // All connected providers
}

JWT extends {
  id?: string
  provider?: SocialProvider
  accessToken?: string
  providers?: SocialProvidersMap
}
```

**Social Types:**

```typescript
type SocialProvider = 'facebook' | 'instagram' | 'twitter'

interface SocialProviderToken {
  accessToken: string           // OAuth token for API calls
  providerAccountId?: string    // Provider's account ID (Facebook Page ID, etc.)
}

type SocialProvidersMap = Partial<Record<SocialProvider, SocialProviderToken>>
```

### 4. **Session Utilities** (`lib/social/session.ts`)

Convenience wrappers for accessing provider data from sessions.

**Available Functions:**

```typescript
// Get all connected providers
getConnectedProviders(session)

// Check if provider is connected
isSocialProviderConnected(session, 'facebook')

// Get access token for API calls
getProviderAccessToken(session, 'facebook')

// Get provider account ID
getProviderAccountId(session, 'facebook')

// Get count of connected providers
getConnectedProviderCount(session)
```

### 5. **Provider Helpers** (`lib/social/providers.ts`)

Advanced utilities for provider operations and metadata.

**Functions:**

```typescript
// Check connection status
isProviderConnected(session, 'facebook')

// Get metadata for UI display
getProviderMetadata('facebook')

// Get all supported providers
supportedProviders // ['facebook', 'instagram', 'twitter']

// Connection count and list
getConnectedProviderCount(session)
getConnectedProviderList(session)
```

### 6. **Account Management** (`lib/social/account.ts`)

Database utilities for OAuth account operations.

**Functions:**

```typescript
// Get provider account from database
getConnectedSocialAccount(userId, 'facebook')

// Get provider's access token
getProviderAccessToken(userId, 'facebook')

// Get all connected accounts
getUserConnectedAccounts(userId)

// Check token validity
isProviderTokenValid(expiresAt)

// Refresh provider token (placeholder for future)
refreshProviderToken(userId, 'facebook')

// Get publishing credentials
getProviderPublishingCredentials(userId, 'facebook')

// Validate provider account setup
validateProviderAccount(userId, 'facebook')
validateAllProviderAccounts(userId)

// Disconnect provider
disconnectProviderAccount(userId, 'facebook')
```

### 7. **UI Components** (`app/(dashboard)/accounts/page.tsx`)

Provider connection management interface.

**Features:**

- Display connection status for all providers
- Connect new providers via OAuth flow
- Show provider account IDs when available
- Display available features per provider
- Summary of all connected accounts
- Error handling and loading states

### 8. **Error Handling** (`app/auth/error/page.tsx`)

Dedicated error page for OAuth failures.

**Error Types:**

- `AccessDenied`: User declined authorization
- `OAuthCallback`: Callback processing error
- `OAuthSignin`: Provider connection error
- `OAuthCreateAccount`: Account creation failed
- `Callback`: Generic callback error
- `CredentialsSignin`: Credentials validation error

## Data Flow

### OAuth Connection Flow

```
User clicks "Connect Facebook"
    ↓
signIn('facebook') → NextAuth OAuth flow
    ↓
Facebook OAuth authorization
    ↓
Facebook callback → NextAuth callback
    ↓
signIn callback → Validates user
    ↓
jwt callback → Stores provider token in JWT
    ↓
PrismaAdapter → Creates/links Account in database
    ↓
session callback → Exposes provider data to frontend
    ↓
Redirect to /accounts
    ↓
useSession() → Session has providers object
```

### Session Access Pattern

```typescript
'use client'

const { data: session } = useSession()

// Get connected providers
const connected = isSocialProviderConnected(session, 'facebook')

// Get access token for API call
const token = getProviderAccessToken(session, 'facebook')

// Get provider account ID
const pageId = getProviderAccountId(session, 'facebook')
```

## Database Schema

### Account Model (PrismaAdapter)

Stores OAuth account information per user per provider.

```prisma
model Account {
  id                String    @id @default(cuid())
  userId            Int
  type              String    // "oauth"
  provider          String    // "facebook", "instagram", "twitter"
  providerAccountId String    // Provider's unique ID
  access_token      String?   // OAuth access token
  refresh_token     String?   // Refresh token (if provider supports)
  expires_at        Int?      // Token expiration (Unix timestamp)
  token_type        String?   // "Bearer", etc.
  scope             String?   // Space-separated scopes
  id_token          String?   // OIDC tokens
  session_state     String?   // OAuth state parameter

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

## Future Enhancements

### 1. **Token Refresh Implementation**

Implement provider-specific token refresh logic:

```typescript
// In lib/social/account.ts
export async function refreshProviderToken(userId, provider) {
  // Facebook: Use long-lived token refresh
  // Twitter: Use refresh token with offline.access scope
  // Instagram: Inherits from Facebook
}
```

### 2. **Publishing APIs**

Use provider credentials for posting:

```typescript
// Future: lib/publishing/facebook.ts
export async function publishToFacebook(userId, pageId, content) {
  const creds = await getProviderPublishingCredentials(userId, 'facebook')
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/feed`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.accessToken}`,
      },
      body: JSON.stringify({ message: content }),
    }
  )
  return response.json()
}
```

### 3. **Additional Providers**

Add LinkedIn, YouTube, TikTok following the same pattern:

1. Add to `providerConfig`
2. Import and instantiate provider in `authProviders`
3. Update `SocialProvider` type
4. Update UI to display new provider
5. Create provider-specific publishing utilities

### 4. **Account Scoping**

Allow users to connect multiple accounts from same provider:

```typescript
// Future: Many-to-many relationship
model SocialAccount {
  id                Int    @id @default(autoincrement())
  userId            Int
  provider          String // facebook, instagram, etc.
  providerAccountId String // Specific account ID from provider
  accessToken       String
  refreshToken      String?
  expiresAt         Int?
  label             String? // User's custom label

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, provider, providerAccountId])
}
```

## Environment Variables

Required for OAuth providers:

```env
# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Instagram (Facebook Graph API)
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret

# Twitter/X
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

## Common Issues & Solutions

### Issue: AccessDenied Error

**Cause:** Usually in the `signIn` callback returning false or missing user ID.

**Solution:**
- Check JWT callback logs
- Verify provider profile function returns `id` field
- Check user.id in signIn callback

### Issue: Token Not Persisting

**Cause:** JWT callback not storing account data correctly.

**Solution:**
- Ensure `account` parameter is passed to jwt callback
- Verify token is stored: `token.providers[provider].accessToken`
- Check session callback exposes `token.providers`

### Issue: Provider Account Not Linking

**Cause:** Account model missing unique constraint or PrismaAdapter not configured.

**Solution:**
- Verify `@@unique([provider, providerAccountId])` in Account model
- Ensure PrismaAdapter is used in auth options
- Check database migrations applied

## Security Considerations

1. **Access Tokens**: Stored in JWT (encrypted) and database
2. **Refresh Tokens**: Only stored in database, never exposed to client
3. **Email Account Linking**: `allowDangerousEmailAccountLinking: true` enabled for flexibility
4. **HTTPS Only**: Always use HTTPS in production (enforced by NextAuth)
5. **Token Expiry**: Check `expires_at` before making API calls
6. **Scope Minimization**: Request only necessary scopes per provider

## Testing Checklist

- [ ] User can sign up with credentials
- [ ] User can connect Facebook OAuth
- [ ] User can connect Instagram OAuth
- [ ] User can connect Twitter OAuth
- [ ] Connected provider appears in accounts page
- [ ] Provider account ID displays (if available)
- [ ] Reconnecting provider updates token
- [ ] Session exposes provider tokens
- [ ] Error page displays OAuth errors
- [ ] Multiple providers can be connected
- [ ] Database stores accounts correctly
- [ ] Tokens are persisted in JWT
