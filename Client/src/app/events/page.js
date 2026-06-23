'use client';
import { useState, useEffect } from 'react';
import { eventsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['Reunion', 'Workshop', 'Seminar', 'Networking', 'Cultural', 'Sports', 'NSS', 'Other'];
const CAT_ICONS = { Reunion: '🎉', Workshop: '🔧', Seminar: '📚', Networking: '🤝', Cultural: '🎭', Sports: '⚽', NSS: '🌿', Other: '📌' };
const CAT_COLORS = {
  Reunion: 'bg-pink-50 text-pink-700', Workshop: 'bg-amber-50 text-amber-700',
  Seminar: 'bg-blue-50 text-blue-700', Networking: 'bg-purple-50 text-purple-700',
  Cultural: 'bg-rose-50 text-rose-700', Sports: 'bg-green-50 text-green-700',
  NSS: 'bg-teal-50 text-teal-700', Other: 'bg-slate-100 text-slate-600'
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [message, setMessage] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', caption: '', date: '', time: '', location: '', category: 'Other', maxAttendees: '' });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const { user } = useAuth();

  useEffect(() => { fetchEvents(); }, [category, showUpcoming]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (category) params.category = category;
      if (showUpcoming) params.upcoming = 'true';
      const res = await eventsAPI.getAll(params);
      setEvents(res.data.events);
    } catch { console.error('Error fetching events'); }
    setLoading(false);
  };

  const showMsg = (m) => { setMessage(m); setTimeout(() => setMessage(''), 4000); };

  const handleRegister = async (eventId) => {
    if (!user) { showMsg('Please login to register for events'); return; }
    setRegisteringId(eventId);
    try {
      const res = await eventsAPI.register(eventId);
      showMsg(res.data.message); fetchEvents();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to register'); }
    setRegisteringId(null);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (bannerFile) fd.append('bannerImage', bannerFile);
      await eventsAPI.create(fd);
      showMsg('✅ Event created!');
      setShowCreate(false);
      setForm({ title: '', description: '', caption: '', date: '', time: '', location: '', category: 'Other', maxAttendees: '' });
      setBannerFile(null); setBannerPreview('');
      fetchEvents();
    } catch (err) { showMsg(err.response?.data?.message || '❌ Failed to create event'); }
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      {/* Header */}
      <div className="gradient-bg py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">🎉 Events & Reunions</h1>
            <p className="text-indigo-200 text-lg">Stay connected through workshops, reunions, NSS & more</p>
          </div>
          {user && (
            <button onClick={() => setShowCreate(true)} className="bg-white text-indigo-600 font-semibold py-2.5 px-6 rounded-xl hover:bg-indigo-50 transition-all text-sm shrink-0">
              + Create Event
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Filter Bar */}
        <div className="card !p-5 mb-8 !rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <button onClick={() => setCategory('')}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${category === '' ? 'gradient-bg text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                All
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${category === cat ? 'gradient-bg text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {CAT_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 shrink-0 cursor-pointer">
              <input type="checkbox" checked={showUpcoming} onChange={e => setShowUpcoming(e.target.checked)} className="w-4 h-4 accent-indigo-600 rounded" />
              Upcoming only
            </label>
          </div>
        </div>

        {message && <div className="mb-6 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100 slide-up">{message}</div>}

        {/* Events Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-40 bg-slate-200 rounded-xl mb-4" />
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No events found</h3>
            <p className="text-slate-500">Check back later or create one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              const isPast = eventDate < new Date();
              return (
                <div key={event._id} className={`card group !rounded-2xl !p-0 overflow-hidden ${isPast ? 'opacity-70' : ''}`}>
                  {/* Banner */}
                  <div className="h-44 bg-gradient-to-br from-indigo-400 to-purple-500 relative overflow-hidden">
                    {event.bannerImage
                      ? <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-7xl opacity-30">{CAT_ICONS[event.category] || '📌'}</div>
                    }
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${CAT_COLORS[event.category] || 'bg-slate-100 text-slate-600'}`}>
                        {CAT_ICONS[event.category]} {event.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1 text-center min-w-[44px]">
                      <div className="text-xs font-bold text-indigo-500 uppercase">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="text-lg font-black text-indigo-700 leading-none">{eventDate.getDate()}</div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1">{event.title}</h3>
                    {event.caption && <p className="text-sm text-indigo-600 italic mb-2 line-clamp-1">"{event.caption}"</p>}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                      <span>📍 {event.location}</span>
                      {event.time && <span>🕐 {event.time}</span>}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">{event.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>👥 {event.attendees?.length || 0}{event.maxAttendees > 0 ? `/${event.maxAttendees}` : ''}</span>
                        {event.mediaContributions?.length > 0 && <span>🖼️ {event.mediaContributions.length}</span>}
                      </div>
                      <div className="flex gap-2">
                        <a href={`/events/${event._id}`} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium">View →</a>
                        {!isPast && (
                          <button onClick={() => handleRegister(event._id)} disabled={registeringId === event._id}
                            className="btn-primary !py-1.5 !px-4 text-xs">
                            {registeringId === event._id ? '...' : 'Register'}
                          </button>
                        )}
                        {isPast && <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1.5 rounded-lg">Ended</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">🎉 Create Event</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Banner upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Banner Image</label>
                <div className={`border-2 border-dashed border-slate-200 rounded-xl overflow-hidden ${bannerPreview ? 'h-36' : 'h-20'} flex items-center justify-center cursor-pointer hover:border-indigo-300 transition-colors`}
                  onClick={() => document.getElementById('banner-input').click()}>
                  {bannerPreview
                    ? <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    : <span className="text-slate-400 text-sm">📷 Click to upload banner image</span>
                  }
                </div>
                <input id="banner-input" type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                <input className="input-field" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Caption</label>
                <input className="input-field" placeholder="Short catchy caption..." value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
                <textarea className="input-field min-h-[80px]" required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                  <input type="date" className="input-field" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                  <input type="time" className="input-field" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Attendees</label>
                  <input type="number" min="0" className="input-field" placeholder="0 = unlimited" value={form.maxAttendees} onChange={e => setForm(p => ({ ...p, maxAttendees: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location *</label>
                <input className="input-field" required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating} className="btn-primary flex-1">{creating ? 'Creating...' : '🎉 Create Event'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
