"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isITUser } from '@/lib/it-team';
import { LogIn, Send, Paperclip } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const signIn = () => supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: { scopes: 'email profile' }
  });

  const signOut = () => supabase.auth.signOut();

  const quickRequest = (t: string, c: string, d: string) => {
    setTitle(t);
    setCategory(c);
    setDescription(d);
  };

  const submitTicket = async () => {
    if (!user) return alert("Please log in");

    let attachment_url = null;
    if (file) {
      const { data } = await supabase.storage
        .from('attachments')
        .upload(`tickets/${Date.now()}-${file.name}`, file);
      if (data) {
        attachment_url = supabase.storage.from('attachments').getPublicUrl(data.path).data.publicUrl;
      }
    }

    const { data: newTicket } = await supabase
      .from('tickets')
      .insert({
        user_email: user.user_metadata.email,
        user_name: user.user_metadata.full_name,
        title,
        description,
        category,
        priority,
        attachment_url,
        status: 'New'
      })
      .select()
      .single();

    if (newTicket) {
      await fetch('/api/new-ticket-email', {
        method: 'POST',
        body: JSON.stringify({ ticket: newTicket }),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    alert("Ticket submitted! IT will contact you soon.");
    setTitle(''); setDescription(''); setCategory(''); setPriority('Medium'); setFile(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md">
          <img src="https://resourcery.com/wp-content/uploads/2023/06/Resourcery-Logo-1.png" alt="Resourcery" className="h-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Resourcery IT Portal</h1>
          <button onClick={signIn} className="bg-teal hover:bg-teal/90 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto text-lg font-semibold">
            <LogIn size={24} /> Login with Office 365
          </button>
        </div>
      </div>
    );
  }

  const quickButtons = [
    { title: "New Laptop", icon: "Laptop", cat: "Hardware", desc: "Need a new laptop or accessories" },
    { title: "Software Install", icon: "Package", cat: "Software", desc: "Need software installed" },
    { title: "Account Unlock", icon: "Unlock", cat: "Account", desc: "Account locked or password reset" },
    { title: "Guest Wi-Fi", icon: "Wi-Fi", cat: "Network", desc: "Guest Wi-Fi access needed" },
    { title: "Printer Issue", icon: "Printer", cat: "Printer", desc: "Printer not working" },
    { title: "Teams/Zoom", icon: "Video Camera", cat: "Collaboration", desc: "Issue with Teams or Zoom" },
    { title: "VPN Problem", icon: "Globe", cat: "Network", desc: "VPN not connecting" },
    { title: "New Employee", icon: "User Plus", cat: "Onboarding", desc: "New staff onboarding" },
    { title: "Access Request", icon: "Key", cat: "Permissions", desc: "Need folder/software access" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="https://resourcery.com/wp-content/uploads/2023/06/Resourcery-Logo-1.png" alt="Resourcery" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold">Resourcery IT Portal</h1>
              <p className="text-sm opacity-80">Fast. Simple. Reliable.</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {isITUser(user.user_metadata.email) && (
              <a href="/it/dashboard" className="bg-teal hover:bg-teal/90 px-6 py-3 rounded-lg font-bold">
                IT Dashboard →
              </a>
            )}
            <button onClick={signOut} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Quick Requests</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {quickButtons.map((b, i) => (
            <button key={i} onClick={() => quickRequest(b.title, b.cat, b.desc)}
              className="bg-white border-2 border-gray-200 hover:border-teal hover:shadow-lg rounded-xl p-6 text-center transition">
              <div className="text-4xl mb-2">{b.icon}</div>
              <div className="font-semibold">{b.title}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Create Custom Ticket</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border rounded-lg px-4 py-3" />
            <select value={priority} onChange={e => setPriority(e.target.value)} className="border rounded-lg px-4 py-3">
              <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
            </select>
            <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="border rounded-lg px-4 py-3 md:col-span-2" />
            <textarea placeholder="Describe the issue..." value={description} onChange={e => setDescription(e.target.value)} rows={5} className="border rounded-lg px-4 py-3 md:col-span-2" />
            <div className="md:col-span-2">
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4" />
              <button onClick={submitTicket} className="bg-teal text-white px-8 py-4 rounded-xl flex items-center gap-3 text-lg font-bold hover:shadow-lg">
                <Send size={24} /> Submit Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
