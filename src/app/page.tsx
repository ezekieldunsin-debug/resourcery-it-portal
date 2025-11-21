"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { isISUser } from '@/lib/is-team'
import { LogIn, Send } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const signIn = () => supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: { scopes: 'email profile' }
  })

  const sign = [
    { title: "New Laptop", cat: "Hardware", desc: "Request new laptop" },
    { title: "Software Install", cat: "Software", desc: "Need software installed" },
    { title: "Account Unlock", cat: "Account", desc: "Account locked" },
    { title: "Printer Issue", cat: "Printer", desc: "Printer not working" },
    { title: "VPN Problem", cat: "Network", desc: "Can't connect to VPN" },
    { title: "Access Request", cat: "Permissions", desc: "Need folder access" }
  ]

  const submitTicket = async () => {
    if (!user) return alert("Please log in")

    let attachment_url = null
    if (file) {
      const { data } = await supabase.storage
        .from('attachments')
        .upload(`tickets/${Date.now()}-${file.name}`, file)
      if (data) {
        attachment_url = supabase.storage.from('attachments').getPublicUrl(data.path).data.publicUrl
      }
    }

    const { data: newTicket } = await supabase
      .from('tickets')
      .insert({
        user_email: user.user_metadata.email,
        user_name: user.user_metadata.full_name,
        title, description, category, priority,
        attachment_url,
        status: 'New'
      })
      .select()
      .single()

    if (newTicket) {
      await fetch('/api/new-ticket-email', {
        method: 'POST',
        body: JSON.stringify({ ticket: newTicket }),
        headers: { 'Content-Type': 'application/json' }
      })
    }

    alert("Ticket submitted! IS team will contact you.")
    setTitle(''); setDescription(''); setCategory(''); setFile(null)
  }

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-purple-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
        <img src="https://resourcery.com/wp-content/uploads/2023/06/Resourcery-Logo-1.png" alt="Resourcery" className="h-16 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Resourcery IS Portal</h1>
        <button onClick={signIn} className="bg-teal text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto text-lg font-bold">
          <LogIn /> Login with Office 365
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="https://resourcery.com/wp-content/uploads/2023/06/Resourcery-Logo-1.png" alt="Resourcery" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold">Resourcery IS Portal</h1>
              <p className="text-sm opacity-80">Information Systems Support</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {isISUser(user.user_metadata.email) && (
              <a href="/is/dashboard" className="bg-teal px-6 py-3 rounded-lg font-bold">
                IS Dashboard →
              </a>
            )}
            <button onClick={() => supabase.auth.signOut()} className="bg-white/10 px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {quickButtons.map((b, i) => (
            <button key={i} onClick={() => { setTitle(b.title); setCategory(b.cat); setDescription(b.desc) }}
              className="bg-white border-2 hover:border-teal rounded-xl p-6 text-center font-semibold">
              {b.title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Create Custom Ticket</h2>
          <div className="space-y-4">
            <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-lg px-4 py-3" />
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border rounded-lg px-4 py-3">
              <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
            </select>
            <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg px-4 py-3" />
            <textarea placeholder="Describe the issue..." value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full border rounded-lg px-4 py-3" />
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" />
            <button onClick={submitTicket} className="bg-teal text-white px-8 py-4 rounded-xl flex items-center gap-3 font-bold">
              <Send size={24} /> Submit Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
