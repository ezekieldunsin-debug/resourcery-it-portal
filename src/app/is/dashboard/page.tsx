"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { isISUser } from '@/lib/is-team'

export default function ISDashboard() {
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user && !isISUser(data.user.user_metadata.email)) {
        window.location.href = '/'
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
      setTickets(data || [])
    }
    fetch()
    const channel = supabase.channel('tickets').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetch).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const update = async (id: string, updates: any) => {
    await supabase.from('tickets').update(updates).eq('id', id)
    window.location.reload()
  }

  if (!user) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-navy p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="https://resourcery.com/wp-content/uploads/2023/06/Resourcery-Logo-1.png" alt="Resourcery" className="h-12" />
            <h1 className="text-3xl font-bold">IS Department Dashboard</h1>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid gap-6">
          {tickets.map(t => (
            <div key={t.id} className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{t.title}</h3>
                <select value={t.status} onChange={e => update(t.id, { status: e.target.value })} className="bg-gray-700 px-4 py-2 rounded">
                  <option>New</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
              <p className="text-gray-400 mb-2">From: {t.user_name || t.user_email}</p>
              <p className="whitespace-pre-wrap">{t.description}</p>
              {t.attachment_url && <a href={t.attachment_url} target="_blank" className="text-teal block mt-2">View Attachment</a>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
