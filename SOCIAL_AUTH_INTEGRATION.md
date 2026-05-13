# Social Auth Integration Guide

Quick reference for using the refactored social authentication system.

## Basic Usage

### 1. Check Connection Status in Components

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { isSocialProviderConnected, getProviderAccessToken } from '@/lib/social/session'

export function MyComponent() {
  const { data: session } = useSession()

  if (isSocialProviderConnected(session, 'facebook')) {
    return <p>Facebook is connected!</p>
  }

  return <p>Please connect Facebook</p>
}
```

### 2. Get Provider Token for API Calls

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { getProviderAccessToken } from '@/lib/social/session'

export function PublishButton() {
  const { data: session } = useSession()

  const handlePublish = async () => {
    const token = getProviderAccessToken(session, 'facebook')
    if (!token) {
      alert('Please connect Facebook first')
      return
    }

    // Use token for API call
    const response = await fetch('https://graph.facebook.com/me/feed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: 'Hello from my app!',
      }),
    })
  }

  return <button onClick={handlePublish}>Publish to Facebook</button>
}
```

### 3. Get All Connected Providers

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { getConnectedProviderList } from '@/lib/social/providers'

export function ProviderSummary() {
  const { data: session } = useSession()

  const providers = getConnectedProviderList(session)

  return (
    <div>
      <h3>Connected: {providers.length}</h3>
      <ul>
        {providers.map(p => <li key={p}>{p}</li>)}
      </ul>
    </div>
  )
}
```

### 4. Get Provider Account ID

```typescript
import { getSocialProviderAccountId } from '@/lib/social/session'

const facebookPageId = getSocialProviderAccountId(session, 'facebook')

// Use for publishing to specific page
await publishToFacebookPage(facebookPageId, content)
```

## Server-Side Usage

### 1. Validate Provider Account in API Route

```typescript
// app/api/publish/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSocialProviderAccessToken } from '@/lib/social/session'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = getSocialProviderAccessToken(session, 'facebook')
  if (!token) {
    return Response.json({ error: 'Facebook not connected' }, { status: 400 })
  }

  // Use token for Facebook API call
  // ...
}
```

### 2. Validate Provider Account from Database

```typescript
// For background jobs, scheduled publishing, etc.
import { validateProviderAccount } from '@/lib/social/account'

const userId = 123
const validation = await validateProviderAccount(userId, 'facebook')

if (validation.hasAccessToken && validation.tokenValid) {
  // Account is ready for publishing
  console.log('Provider ready:', validation)
} else {
  // Account needs refresh or reconnection
  console.log('Account error:', validation.message)
}
```

### 3. Get Publishing Credentials

```typescript
import { getProviderPublishingCredentials } from '@/lib/social/account'

const creds = await getProviderPublishingCredentials(userId, 'facebook')

if (creds) {
  // Use credentials to publish
  console.log('Token:', creds.accessToken)
  console.log('Account ID:', creds.providerAccountId)
  console.log('Scopes:', creds.scope)
}
```

## Connecting Multiple Accounts from Same Provider

Currently, the system supports one account per provider per user. To connect multiple accounts:

```typescript
// User scenario: Multiple Facebook pages

const facebookPageIds = [
  session.user.providers?.facebook?.providerAccountId,
  // Additional pages would need custom database structure
]

// Future: Extend schema to support multiple accounts per provider
```

## Error Handling

### Handle OAuth Errors in Frontend

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function OAuthErrorHandler() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (error) {
    return (
      <div className="error-alert">
        <p>OAuth Error: {error}</p>
        <p><a href="/accounts">Try reconnecting</a></p>
      </div>
    )
  }

  return null
}
```

### Automatic Error Page

OAuth errors automatically redirect to `/auth/error?error=ErrorType`

Error types:
- `AccessDenied`: User declined authorization
- `OAuthCallback`: Error during callback
- `OAuthSignin`: Error connecting to provider
- `OAuthCreateAccount`: Account creation failed
- `Callback`: Generic error
- `CredentialsSignin`: Invalid credentials

## Session Structure

After successful OAuth connection, `session.user` contains:

```typescript
{
  id: "123",                    // User DB ID
  email: "user@example.com",
  name: "User Name",
  image: "https://...",
  provider: "facebook",         // Current/last provider
  accessToken: "token...",      // Current provider's token
  providers: {                  // All connected providers
    facebook: {
      accessToken: "fb_token...",
      providerAccountId: "12345"
    },
    twitter: {
      accessToken: "tw_token...",
      providerAccountId: "@username"
    }
  }
}
```

## Migration from Old System

If upgrading from the old system:

1. **Old way** (no longer works):
   ```typescript
   // ❌ Don't use these anymore
   token.provider
   token.accessToken
   session.user.accessToken
   ```

2. **New way**:
   ```typescript
   // ✅ Use these instead
   isSocialProviderConnected(session, 'facebook')
   getProviderAccessToken(session, 'facebook')
   session.user.providers?.facebook?.accessToken
   ```

## Publishing Integration Example

Complete example of publishing to Facebook:

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { getProviderAccessToken, getSocialProviderAccountId } from '@/lib/social/session'

export function FacebookPublisher() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const handlePublish = async (content: string) => {
    const token = getProviderAccessToken(session, 'facebook')
    const pageId = getSocialProviderAccountId(session, 'facebook')

    if (!token || !pageId) {
      alert('Please connect Facebook first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: content }),
        }
      )

      if (!response.ok) throw new Error('Publish failed')

      const data = await response.json()
      console.log('Published:', data.id)
      alert('Published successfully!')
    } catch (error) {
      console.error('Error publishing:', error)
      alert('Failed to publish')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={() => handlePublish('Hello Facebook!')} disabled={loading}>
      {loading ? 'Publishing...' : 'Publish'}
    </button>
  )
}
```

## Common Tasks

### Display Connected Providers

```typescript
import { supportedProviders, getProviderMetadata, isSocialProviderConnected } from '@/lib/social/providers'
import { useSession } from 'next-auth/react'

export function ProviderStatus() {
  const { data: session } = useSession()

  return (
    <div>
      {supportedProviders.map(provider => {
        const meta = getProviderMetadata(provider)
        const connected = isSocialProviderConnected(session, provider)

        return (
          <div key={provider}>
            <span>{meta.displayName}</span>
            <span>{connected ? '✓ Connected' : '✗ Not Connected'}</span>
          </div>
        )
      })}
    </div>
  )
}
```

### Add New Provider

1. Add to `types/social.ts`:
   ```typescript
   export type SocialProvider = 'facebook' | 'instagram' | 'twitter' | 'linkedin'
   ```

2. Add to `lib/providers/socialProviders.ts`:
   ```typescript
   linkedin: {
     name: 'linkedin',
     displayName: 'LinkedIn',
     scopes: ['r_liteprofile', 'w_member_social'],
     features: ['posts', 'articles'],
     color: '#0077B5',
     icon: 'linkedin',
   }
   ```

3. Add provider instance in `authProviders`:
   ```typescript
   LinkedInProvider({
     clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
     clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
   })
   ```

4. Accounts page automatically displays it!

## Debugging

### Check Session Content

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function DebugSession() {
  const { data: session } = useSession()
  return <pre>{JSON.stringify(session, null, 2)}</pre>
}
```

### Check Database Account

```typescript
import { getConnectedSocialAccount } from '@/lib/social/account'

const account = await getConnectedSocialAccount(userId, 'facebook')
console.log('Stored account:', account)
```

### Enable NextAuth Debug Logging

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  debug: true,  // Already enabled
  logger: {
    error: (code, metadata) => {
      console.error('[next-auth][error]', code, metadata)
    },
  },
}
```
