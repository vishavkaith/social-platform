'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Create Post', href: '/create-post', icon: '✏️' },
  { name: 'Scheduled', href: '/scheduled', icon: '📅' },
  { name: 'Media', href: '/media', icon: '🖼️' },
  { name: 'Feeds', href: '/feeds', icon: '📡' },
  { name: 'Inbox', href: '/inbox', icon: '📬' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Accounts', href: '/accounts', icon: '👥' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-16 shrink-0 items-center px-4">
        <h1 className="text-xl font-bold text-gray-900">Social Platform</h1>
      </div>
      <nav className="mt-8">
        <div className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}