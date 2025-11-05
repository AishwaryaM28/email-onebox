'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

interface Email {
  subject: string
  from: string
  body: string
  date: string
  category: string
  account: string
}

interface Stats {
  total_emails: number
  categories: Record<string, number>
  accounts: Record<string, number>
}

const CATEGORIES = ['All', 'Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office']

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = 'https://email-onebox-backend-hs8s.onrender.com/ || http://localhost:3000'

  const fetchEmails = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/emails`)
      const data = await response.json()
      setEmails(data.emails || [])
    } catch (error) {
      console.error('Error fetching emails:', error)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`)
      const data = await response.json()
      setStats(data.statistics)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      await fetchEmails()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/emails/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setEmails(data.emails || [])
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryFilter = async (category: string): Promise<void> => {
    setSelectedCategory(category)

    if (category === 'All') {
      await fetchEmails()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/emails/category/${category}`)
      const data = await response.json()
      setEmails(data.emails || [])
    } catch (error) {
      console.error('Error filtering:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
    fetchStats()
  }, [])

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Interested: 'bg-green-100 text-green-700',
      'Meeting Booked': 'bg-blue-100 text-blue-700',
      'Not Interested': 'bg-red-100 text-red-700',
      Spam: 'bg-gray-100 text-gray-700',
      'Out of Office': 'bg-yellow-100 text-yellow-700',
      Uncategorized: 'bg-purple-100 text-purple-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="w-full px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">📧 Email Onebox</h1>
            <p className="text-gray-600 mt-1">Real-time email aggregator</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  fetchEmails()
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b-2 border-gray-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition">
                <p className="text-gray-600 text-sm font-semibold uppercase">Total</p>
                <p className="text-4xl font-bold text-blue-600 mt-3">{stats.total_emails}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition">
                <p className="text-gray-600 text-sm font-semibold uppercase">Interested</p>
                <p className="text-4xl font-bold text-green-600 mt-3">{stats.categories['Interested'] || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition">
                <p className="text-gray-600 text-sm font-semibold uppercase">Meetings</p>
                <p className="text-4xl font-bold text-purple-600 mt-3">{stats.categories['Meeting Booked'] || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition">
                <p className="text-gray-600 text-sm font-semibold uppercase">Spam</p>
                <p className="text-4xl font-bold text-red-600 mt-3">{stats.categories['Spam'] || 0}</p>
              </div>
            </div>
          )}

          {/* Email List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16 bg-white rounded-lg border-2 border-gray-200">
                <p className="text-gray-500 text-lg">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border-2 border-gray-200">
                <p className="text-gray-500 text-lg">No emails found</p>
              </div>
            ) : (
              emails.map((email, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 border-2 border-gray-200 rounded-lg hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{email.subject}</h3>
                      <p className="text-sm text-gray-600 truncate mt-1">{email.from}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getCategoryColor(email.category)}`}>
                      {email.category}
                    </span>
                  </div>
                  <p className="text-gray-700 line-clamp-2 mb-3 leading-relaxed">{email.body}</p>
                  <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="font-medium">{new Date(email.date).toLocaleDateString()}</span>
                    <span className="text-gray-400">{email.account}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
