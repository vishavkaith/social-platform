'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/dashboard')
    } else {
      alert('Login failed')
    }
  }

  const handleFacebookLogin = async () => {
    await signIn('facebook', {
      callbackUrl: '/dashboard',
    })
  }

  const handleInstagramLogin = async () => {
    await signIn('instagram', {
      callbackUrl: '/dashboard',
    })
  }

  const handleXLogin = async () => {
    await signIn('twitter', {
      callbackUrl: '/dashboard',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-xl px-4 py-3 mb-4"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl px-4 py-3 mb-6"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button className="w-full bg-black text-white py-3 rounded-xl">
          Login
        </button>

        <div className="mt-4 text-center text-gray-500">or</div>

        <button
          type="button"
          onClick={handleFacebookLogin}
          className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl"
        >
          Continue with Facebook
        </button>

        <button
          type="button"
          onClick={handleInstagramLogin}
          className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl"
        >
          Continue with Instagram
        </button>

        <button
          type="button"
          onClick={handleXLogin}
          className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl"
        >
          Continue with X
        </button>

        <button
          type="button"
          className="w-full mt-4 bg-gray-500 text-white py-3 rounded-xl opacity-60 cursor-not-allowed"
          disabled
        >
          Continue with WhatsApp
        </button>
      </form>
    </div>
  )
}