"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isITUser } from '@/lib/it-team';
import { Search, MessageSquare, CheckCircle } from 'lucide-react';

export default function ITDashboard() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user && !isITUser(data.user.user_metadata.email)) {
        window.location.href = '/';
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchTickets();
    const channel = supabase.channel('tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => fetchTickets())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchTickets = async () => {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    setTickets(data || []);
  };

  const updateTicket = async (id: string, updates: any) => {
    await supabase.from('tickets').update(updates).eq('id', id);
    fetchTickets();
  };

  const addComment = async () => {
    if (!comment.trim() || !selected) return;
    const newComment = { text: comment, author: user.user_metadata.full_name || user.email, timestamp: new Date().toISOString() };
    const comments = selected.comments ? [...selected.comments, newComment] : [newComment];
    await supabase.from('tickets').update({ comments }).eq('id', selected.id);
    setComment('');
    fetchTickets();
  };

  if (!user || !isITUser(user.user_metadata.email)) return null;

  const filtered = tickets.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !`${t.title} ${t.user_name}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-navy p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="https://resourcery.com/wp-content/uploads/2023/06/Resourcery-Logo-1.png" alt="Resourcery" className="h-12" />
            <h1 className="text-3xl font-bold">IT Team Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex gap-3 mb-4">
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 pl-10 bg-gray-700 rounded-lg py-3" />
              <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-gray-700 rounded-lg px-4">
                <option value="all">All</option>
                <option>New</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <div className="space-y-3 max-h-screen overflow-y-auto">
              {filtered.map(t => (
                <div key={t.id} onClick={() => setSelected(t)} className={`bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 ${selected?.id === t.id ? 'ring-2 ring-teal' : ''}`}>
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{t.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${t.status === 'New' ? 'bg-red-500' : t.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{t.user_name || t.user_email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">{selected.title}</h2>
              <select value={selected.status} onChange={e => updateTicket(selected.id, { status: e.target.value })} className="mb-4 bg-gray-700 px-4 py-2 rounded">
                <option>New</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded"><strong>Priority:</strong> {selected.priority}</div>
                <div className="bg-gray-700 p-4 rounded"><strong>User:</strong> {selected.user_name || selected.user_email}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded mb-6 whitespace-pre-wrap">{selected.description}</div>
              {selected.comments?.length > 0 && (
                <div className="space-y-3 mb-6">
                  {selected.comments.map((c: any, i: number) => (
                    <div key={i} className="bg-gray-600 p-4 rounded">
                      <strong>{c.author}</strong> – {new Date(c.timestamp).toLocaleString()}<br/>
                      {c.text}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <input placeholder="Add comment..." value={comment} onChange={e => setComment(e.target.value)} className="flex-1 bg-gray-700 rounded px-4 py-3" />
                <button onClick={addComment} className="bg-teal px-6 py-3 rounded">Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
