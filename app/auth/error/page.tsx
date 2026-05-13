'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const errorMessages: Record<string, string> = {
  AccessDenied: 'Access denied. You may have declined to authorize the application.',
  OAuthCallback: 'Error during OAuth callback. Please try again.',
  OAuthSignin: 'Error connecting to the OAuth provider. Check your credentials.',
  OAuthCreateAccount: 'Could not create user account. The account may already exist.',
  EmailCreateAccount: 'Could not create user account with this email.',
  Callback: 'An error occurred during the callback. Please try again.',
  EmailSignInError: 'Could not sign in with this email.',
  CredentialsSignin: 'Sign in failed. Check that the email and password are correct.',
  Default: 'An authentication error occurred. Please try again.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Authentication Error</h1>

        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <p className="text-center text-sm text-red-800">
            <span className="font-semibold">{error}:</span> {errorMessage}
          </p>
        </div>

        <div className="mb-6 space-y-2 text-sm text-slate-600">
          <p>
            <strong>What can you do:</strong>
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Try connecting again</li>
            <li>Check your internet connection</li>
            <li>Verify your OAuth credentials in the provider dashboard</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/accounts"
            className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Connected Accounts
          </Link>

          <Link
            href="/login"
            className="block w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Sign In
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded-lg bg-slate-100 p-3 text-xs font-mono text-slate-600">
            <p className="mb-1 font-semibold">Debug Info (Development Only):</p>
            <p>Error Code: {error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
