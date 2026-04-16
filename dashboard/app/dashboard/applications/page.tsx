'use client'

import React, { useEffect, useState } from 'react'

type Application = {
  id: string
  company_name: string
  role_title: string
  platform: string
  created_at: string
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      const res = await fetch('/api/applications')
      if (!res.ok) throw new Error('Failed to load applications')
      const data = await res.json()
      setApps(data.applications || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-red-500 mb-2">Failed to load applications</div>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    )
  }

  // MONETIZE: Gate this entire page behind a subscription paywall
  // For now, visible in free dev mode.
  return (
    <div className="max-w-4xl flex flex-col min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        <p className="text-gray-500 text-sm mt-1">
          Automatically tracked from form fields filled by the extension.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
        {apps.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
              💼
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Fill out a job application using Fillr and we'll automatically save the details here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Company</th>
                <th className="px-6 py-4 whitespace-nowrap">Role</th>
                <th className="px-6 py-4 whitespace-nowrap">Platform</th>
                <th className="px-6 py-4 whitespace-nowrap text-right rounded-tr-xl">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {app.company_name || 'Unknown Company'}
                  </td>
                  <td className="px-6 py-4">
                    {app.role_title || 'Unknown Role'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {app.platform || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-gray-400">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
