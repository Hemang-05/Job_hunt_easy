'use client'

import React, { useEffect, useState } from 'react'
import { Briefcase, Clock, Globe } from 'lucide-react'

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
      <div className="max-w-5xl space-y-8 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-48"></div>
        <div className="glass-tile h-[400px] w-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl text-center py-20">
        <div className="text-red-400 font-bold mb-2">Failed to load applications</div>
        <p className="text-white/30 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-8 flex flex-col min-h-[calc(100vh-10rem)]">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Job Applications</h1>
        <p className="text-white/50 text-sm mt-2 font-medium">
          Automatically tracked from every form you fill with Job Hunt Easy.
        </p>
      </div>

      <div className="glass-tile overflow-hidden flex-1 flex flex-col">
        {apps.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center mb-8">
              <Briefcase className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">No applications yet</h2>
            <p className="text-white/40 max-w-sm mx-auto font-medium leading-relaxed mb-8">
              Apply to your first job using the Job Hunt Easy extension to see it tracked here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5 text-white/40 font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-8 py-5">Company</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Platform</th>
                  <th className="px-8 py-5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-8 py-6 font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {app.company_name || 'Unknown Company'}
                    </td>
                    <td className="px-8 py-6 text-white/70 font-medium">
                      {app.role_title || 'Unknown Role'}
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                        <Globe className="w-3 h-3" /> {app.platform || 'Direct'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap text-white/30 font-bold tabular-nums">
                      <div className="flex items-center justify-end gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
