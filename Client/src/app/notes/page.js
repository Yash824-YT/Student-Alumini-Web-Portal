'use client';
import { useState, useEffect, useRef } from 'react';
import { notesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const DEPARTMENTS = ['All', 'Artificial Intelligence and Machine Learning Engineering', 'Artificial Intelligence and Data Science Engineering','Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronic and TeleCommunication Engineering' ];
const CATEGORIES = ['Notes', 'Previous Year Questions', 'Study Material', 'Syllabus', 'Other'];
const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const CAT_ICONS = { 'Notes': '📝', 'Previous Year Questions': '📋', 'Study Material': '📚', 'Syllabus': '📖', 'Other': '📌' };
const CAT_COLORS = {
  'Notes': 'bg-blue-50 text-blue-700 border-blue-100',
  'Previous Year Questions': 'bg-purple-50 text-purple-700 border-purple-100',
  'Study Material': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Syllabus': 'bg-amber-50 text-amber-700 border-amber-100',
  'Other': 'bg-slate-100 text-slate-600 border-slate-200'
};

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [activeCat, setActiveCat] = useState('');
  const [activeSem, setActiveSem] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const { user } = useAuth();

  const [newNote, setNewNote] = useState({
    title: '', description: '', category: 'Notes', subject: '',
    department: 'Artificial Intelligence and Machine Learning Engineering', year: '', semester: '', fileUrl: '', tags: ''
  });
  const [noteFile, setNoteFile] = useState(null);

  useEffect(() => { fetchNotes(); }, [page, activeDept, activeCat, activeSem]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (activeDept && activeDept !== 'All') params.department = activeDept;
      if (activeCat) params.category = activeCat;
      if (activeSem) params.semester = activeSem;
      const res = await notesAPI.getAll(params);
      setNotes(res.data.notes);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch { console.error('Error fetching notes'); }
    setLoading(false);
  };

  const showMsg = (m) => { setMessage(m); setTimeout(() => setMessage(''), 3000); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.subject) { showMsg('Title and subject are required'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(newNote).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (noteFile) fd.append('file', noteFile);
      await notesAPI.create(fd);
      showMsg('✅ Note uploaded!');
      setShowUpload(false);
      setNewNote({ title: '', description: '', category: 'Notes', subject: '', department: 'Artificial Intelligence and Machine Learning Engineering', year: '', semester: '', fileUrl: '', tags: '' });
      setNoteFile(null);
      fetchNotes();
    } catch (err) { showMsg(err.response?.data?.message || '❌ Upload failed'); }
    setUploading(false);
  };

  const handleDownload = async (note) => {
    try {
      await notesAPI.trackDownload(note._id);
      if (note.fileUrl) window.open(note.fileUrl, '_blank');
      fetchNotes();
    } catch { console.error('Download error'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="gradient-bg py-14 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">📚 Notes & Resources</h1>
            <p className="text-indigo-200 text-lg">Branch-wise notes, PYQs, syllabus & study material</p>
          </div>
          {user && (
            <button onClick={() => setShowUpload(true)} className="bg-white text-indigo-600 font-semibold py-2.5 px-6 rounded-xl hover:bg-indigo-50 transition-all text-sm shrink-0">
              + Upload Note
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }} className="max-w-7xl mx-auto w-full px-4 py-8 gap-6">
        {/* Sidebar - Branch Tabs */}
        <div className="hidden md:block w-52 shrink-0">
          <div className="card !p-3 sticky top-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Branch</p>
            {DEPARTMENTS.map(dept => (
              <button key={dept} onClick={() => { setActiveDept(dept); setPage(1); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${activeDept === dept ? 'gradient-bg text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile dept select */}
          <div className="md:hidden mb-4">
            <select className="input-field" value={activeDept} onChange={e => { setActiveDept(e.target.value); setPage(1); }}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {message && <div className="mb-4 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100 slide-up">{message}</div>}

          {/* Search */}
          <div className="card !p-4 mb-4 !rounded-2xl">
            <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchNotes(); }} className="flex gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search subjects, topics..." className="input-field !pl-10 !py-2.5" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary !py-2.5 !px-5 text-sm">Search</button>
            </form>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => { setActiveCat(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${!activeCat ? 'gradient-bg text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              All
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setActiveCat(cat); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${activeCat === cat ? 'gradient-bg text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                {CAT_ICONS[cat]} {cat}
              </button>
            ))}
          </div>

          {/* Semester Filter */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => { setActiveSem(''); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${!activeSem ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              All Sems
            </button>
            {SEMESTERS.map(sem => (
              <button key={sem} onClick={() => { setActiveSem(sem); setPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${activeSem === sem ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {sem}
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-500 mb-4">Showing <span className="font-semibold text-slate-700">{notes.length}</span> of <span className="font-semibold text-slate-700">{total}</span> resources</p>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No notes found</h3>
              <p className="text-slate-500">Be the first to upload for this branch!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {notes.map((note) => (
                <div key={note._id} className="card group !rounded-2xl flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${CAT_COLORS[note.category] || 'bg-slate-100 text-slate-600'}`}>
                      {CAT_ICONS[note.category]} {note.category}
                    </span>
                    <span className="text-xs text-slate-400">📥 {note.downloads}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-2 flex-1">{note.title}</h3>
                  <p className="text-sm text-indigo-600 font-medium mb-2">{note.subject}</p>
                  {note.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{note.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {note.department && note.department !== 'General' && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">🎓 {note.department}</span>
                    )}
                    {note.semester && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">{note.semester}</span>}
                    {note.year && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">📅 {note.year}</span>}
                  </div>
                  {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <button onClick={() => handleDownload(note)} className="btn-primary w-full text-sm !py-2.5 mt-auto group-hover:shadow-lg transition-shadow">
                    {note.fileUrl ? '🔗 Open / Download' : '📝 View Content'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mb-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">← Prev</button>
              <span className="px-4 py-2 text-sm text-slate-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">📤 Upload Note / Resource</h2>
              <button onClick={() => setShowUpload(false)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">✕</button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                <input className="input-field" required value={newNote.title} onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Data Structures Unit 2 Notes" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Subject *</label>
                  <input className="input-field" required value={newNote.subject} onChange={e => setNewNote(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Data Structures" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select className="input-field" value={newNote.category} onChange={e => setNewNote(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                  <select className="input-field" value={newNote.department} onChange={e => setNewNote(p => ({ ...p, department: e.target.value }))}>
                    {DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Semester</label>
                  <select className="input-field" value={newNote.semester} onChange={e => setNewNote(p => ({ ...p, semester: e.target.value }))}>
                    <option value="">Select semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input className="input-field" placeholder="e.g. 2023-24" value={newNote.year} onChange={e => setNewNote(p => ({ ...p, year: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tags</label>
                  <input className="input-field" placeholder="e.g. trees,sorting,os" value={newNote.tags} onChange={e => setNewNote(p => ({ ...p, tags: e.target.value }))} />
                </div>
              </div>

              {/* File upload OR link */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Upload PDF / DOC</label>
                <div className={`border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-300 transition-colors ${noteFile ? 'bg-indigo-50 border-indigo-300' : ''}`}
                  onClick={() => fileInputRef.current?.click()}>
                  {noteFile
                    ? <p className="text-sm text-indigo-600 font-medium">📄 {noteFile.name}</p>
                    : <p className="text-sm text-slate-400">Click to upload PDF, DOC, DOCX, PPT</p>
                  }
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={e => setNoteFile(e.target.files?.[0] || null)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Or paste Google Drive / external link</label>
                <input className="input-field" placeholder="https://drive.google.com/..." value={newNote.fileUrl} onChange={e => setNewNote(p => ({ ...p, fileUrl: e.target.value }))} disabled={!!noteFile} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea className="input-field min-h-[70px]" value={newNote.description} onChange={e => setNewNote(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={uploading} className="btn-primary flex-1">{uploading ? 'Uploading...' : '📤 Upload'}</button>
                <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
