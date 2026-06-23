'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CAT_ICONS = { Reunion: '🎉', Workshop: '🔧', Seminar: '📚', Networking: '🤝', Cultural: '🎭', Sports: '⚽', NSS: '🌿', Other: '📌' };

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const mediaInputRef = useRef();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [registering, setRegistering] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { fetchEvent(); }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getById(id);
      setEvent(res.data);
    } catch { setMsg('Failed to load event'); }
    setLoading(false);
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const handleRegister = async () => {
    if (!user) { showMsg('Please login to register'); return; }
    setRegistering(true);
    try {
      const res = await eventsAPI.register(id);
      showMsg(res.data.message); fetchEvent();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed'); }
    setRegistering(false);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!mediaFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('media', mediaFile);
      fd.append('caption', caption);
      await eventsAPI.uploadMedia(id, fd);
      showMsg('✅ Media uploaded!');
      setShowMediaModal(false); setMediaFile(null); setMediaPreview(''); setCaption('');
      fetchEvent();
    } catch { showMsg('❌ Upload failed'); }
    setUploading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4">😕</div><p className="text-slate-500">Event not found</p></div>
    </div>
  );

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const images = event.mediaContributions?.filter(m => m.mediaType === 'image') || [];
  const videos = event.mediaContributions?.filter(m => m.mediaType === 'video') || [];

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
        {event.bannerImage
          ? <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-9xl opacity-20">{CAT_ICONS[event.category] || '📌'}</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <button onClick={() => router.push('/events')} className="text-white/70 hover:text-white text-sm mb-3 flex items-center gap-1 transition-colors">
            ← Back to Events
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold">
              {CAT_ICONS[event.category]} {event.category}
            </span>
            {isPast && <span className="text-xs px-3 py-1 bg-black/30 rounded-full text-white/70">Ended</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{event.title}</h1>
          {event.caption && <p className="text-indigo-200 italic text-lg">"{event.caption}"</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {msg && <div className="mb-6 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100 slide-up">{msg}</div>}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-slate-800 mb-3">About This Event</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Photo Gallery */}
            {images.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold text-slate-800 mb-4">📸 Photos ({images.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((m, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group" onClick={() => setLightbox(m)}>
                      <img src={m.url} alt={m.caption || 'Event photo'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      {m.caption && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <p className="text-white text-xs">{m.caption}</p>
                        </div>
                      )}
                      {m.user?.name && <div className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">{m.user.name}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Gallery */}
            {videos.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold text-slate-800 mb-4">🎥 Videos ({videos.length})</h2>
                <div className="space-y-4">
                  {videos.map((m, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-slate-200">
                      <video src={m.url} controls className="w-full max-h-64 bg-black" />
                      {(m.caption || m.user?.name) && (
                        <div className="p-3 bg-slate-50 text-xs text-slate-500 flex justify-between">
                          <span>{m.caption}</span>
                          {m.user?.name && <span>by {m.user.name}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.mediaContributions?.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">No photos or videos yet. Be the first to contribute!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-700 mb-3">📋 Event Details</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><span>📅</span><span>{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                {event.time && <div className="flex items-center gap-2"><span>🕐</span><span>{event.time}</span></div>}
                <div className="flex items-center gap-2"><span>📍</span><span>{event.location}</span></div>
                <div className="flex items-center gap-2"><span>👥</span><span>{event.attendees?.length || 0} registered{event.maxAttendees > 0 ? ` / ${event.maxAttendees} max` : ''}</span></div>
                {event.organizer?.name && <div className="flex items-center gap-2"><span>👤</span><span>By {event.organizer.name}</span></div>}
              </div>
            </div>

            {!isPast && (
              <button onClick={handleRegister} disabled={registering} className="btn-primary w-full">
                {registering ? 'Registering...' : '✅ Register for Event'}
              </button>
            )}

            {user && (
              <button onClick={() => setShowMediaModal(true)} className="btn-secondary w-full text-sm">
                📷 Add Photos / Videos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Media Upload Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">📸 Contribute Media</h2>
              <button onClick={() => { setShowMediaModal(false); setMediaFile(null); setMediaPreview(''); }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">✕</button>
            </div>
            <form onSubmit={handleUploadMedia} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Photo or Video *</label>
                <div className={`border-2 border-dashed border-slate-200 rounded-xl overflow-hidden ${mediaPreview ? 'h-48' : 'h-28'} flex items-center justify-center cursor-pointer hover:border-indigo-300 transition-colors`}
                  onClick={() => mediaInputRef.current?.click()}>
                  {mediaPreview
                    ? (mediaFile?.type?.startsWith('video/')
                      ? <video src={mediaPreview} className="w-full h-full object-cover" />
                      : <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />)
                    : <div className="text-center text-slate-400"><div className="text-3xl mb-1">📁</div><p className="text-sm">Click to select photo or video</p></div>
                  }
                </div>
                <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Caption (optional)</label>
                <input className="input-field" placeholder="Describe this moment..." value={caption} onChange={e => setCaption(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading || !mediaFile} className="btn-primary flex-1">{uploading ? 'Uploading...' : '📤 Upload'}</button>
                <button type="button" onClick={() => setShowMediaModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.caption} className="max-w-full max-h-full rounded-xl" onClick={e => e.stopPropagation()} />
          {lightbox.caption && <div className="absolute bottom-8 left-0 right-0 text-center text-white text-sm">{lightbox.caption}</div>}
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full text-white text-xl flex items-center justify-center hover:bg-white/30">✕</button>
        </div>
      )}
    </div>
  );
}
