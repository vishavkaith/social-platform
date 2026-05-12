'use client'

import Link from 'next/link'

import {
  LayoutDashboard,
  PlusSquare,
  Calendar,
  Settings,
  Image,
  Users,
  BarChart3,
  Inbox,
  Newspaper,
} from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-black text-white p-6 fixed left-0 top-0 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-10">
        Social Platform
      </h1>

      <nav className="space-y-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/create-post"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <PlusSquare size={20} />
          Create Post
        </Link>

        <Link
          href="/scheduled"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Calendar size={20} />
          Scheduled
        </Link>

        <Link
          href="/media"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Image size={20} />
          Media
        </Link>

        <Link
          href="/feeds"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Newspaper size={20} />
          Feeds
        </Link>

        <Link
          href="/inbox"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Inbox size={20} />
          Inbox
        </Link>

        <Link
          href="/accounts"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Users size={20} />
          Accounts
        </Link>

        <Link
          href="/analytics"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <BarChart3 size={20} />
          Analytics
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800"
        >
          <Settings size={20} />
          Settings
        </Link>
      </nav>
    </aside>
  )
}