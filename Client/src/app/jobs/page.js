'use client';
import { useState, useEffect } from 'react';
import { jobsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const TYPE_COLORS = {
  'Full-time': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Part-time': 'bg-amber-50 text-amber-700 border-amber-100',
  'Internship': 'bg-blue-50 text-blue-700 border-blue-100',
  'Contract': 'bg-purple-50 text-purple-700 border-purple-100',
  'Remote': 'bg-cyan-50 text-cyan-700 border-cyan-100',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'job', 'internship'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [applyJob, setApplyJob] = useState(null); // job being applied to
  const [showPost, setShowPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [applying, setApplying] = useState(false);
  const { user } = useAuth();

  const [postForm, setPostForm] = useState({
    title: '', company: '', location: '', type: 'Full-time', salary: '',
    description: '', requirements: '', skills: '', applicationDeadline: '', applicationLink: ''
  });

  const [applyForm, setApplyForm] = useState({ name: '', email: '', phone: '', resumeLink: '', coverNote: '' });

  useEffect(() => {
    if (user) setApplyForm(f => ({ ...f, name: user.name || '', email: user.email || '' }));
  }, [user]);

  useEffect(() => { fetchJobs(); }, [page, activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (activeTab === 'job') params.type = 'Full-time';
      if (activeTab === 'internship') params.type = 'Internship';
      const res = await jobsAPI.getAll(params);
      setJobs(res.data.jobs);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch { console.error('Error fetching jobs'); }
    setLoading(false);
  };

  const showMsg = (m) => { setMessage(m); setTimeout(() => setMessage(''), 4000); };

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await jobsAPI.create({ ...postForm });
      showMsg('✅ Opportunity posted successfully!');
      setShowPost(false);
      setPostForm({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '', skills: '', applicationDeadline: '', applicationLink: '' });
      fetchJobs();
    } catch (err) { showMsg(err.response?.data?.message || '❌ Failed to post'); }
    setPosting(false);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyJob) return;
    setApplying(true);
    try {
      const res = await jobsAPI.apply(applyJob._id, applyForm);
      showMsg(res.data.message);
      setApplyJob(null);
      fetchJobs();
    } catch (err) { showMsg(err.response?.data?.message || '❌ Application failed'); }
    setApplying(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      {/* Header */}
      <div className="gradient-bg py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">💼 Job & Internship Portal</h1>
            <p className="text-indigo-200 text-lg">Opportunities shared by alumni & organizations</p>
          </div>
          {user && (
            <button onClick={() => setShowPost(true)} className="bg-white text-indigo-600 font-semibold py-2.5 px-6 rounded-xl hover:bg-indigo-50 transition-all text-sm shrink-0">
              + Post Opportunity
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Tabs + Search */}
        <div className="card !p-5 mb-6 !rounded-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex rounded-xl border border-slate-200 overflow-hidden shrink-0">
              {[{ key: 'all', label: '🔍 All' }, { key: 'job', label: '💼 Jobs' }, { key: 'internship', label: '🎓 Internships' }].map(t => (
                <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
                  className={`px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === t.key ? 'gradient-bg text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); setPage(1); fetchJobs(); }} className="flex flex-1 gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search by title, company, skills..." className="input-field !pl-10 !py-2.5" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary !py-2.5 !px-5 text-sm shrink-0">Search</button>
            </form>
          </div>
        </div>

        {message && <div className="mb-5 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100 slide-up">{message}</div>}

        <p className="text-sm text-slate-500 mb-4">Showing <span className="font-semibold text-slate-700">{jobs.length}</span> of <span className="font-semibold text-slate-700">{total}</span> listings</p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No listings found</h3>
            <p className="text-slate-500">Be the first to post an opportunity!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-10">
            {jobs.map((job) => (
              <div key={job._id} className="card group !rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${TYPE_COLORS[job.type] || 'bg-slate-100 text-slate-600'}`}>{job.type}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                      <span>🏢 {job.company}</span>
                      <span>📍 {job.location}</span>
                      {job.salary && job.salary !== 'Not disclosed' && <span>💰 {job.salary}</span>}
                      <span>👥 {job.applicants?.length || 0} applicants</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">{job.description}</p>
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills.map((s, i) => (
                          <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{job.postedBy?.name ? ` by ${job.postedBy.name}` : ''}</span>
                      {job.applicationDeadline && <span className="text-orange-500">⏰ Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {job.applicationLink ? (
                      <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" className="btn-primary !py-2.5 !px-6 text-sm text-center">Apply Now →</a>
                    ) : (
                      <button onClick={() => { if (!user) { showMsg('Please login to apply'); return; } setApplyJob(job); setApplyForm(f => ({ ...f, name: user.name || '', email: user.email || '' })); }}
                        className="btn-primary !py-2.5 !px-6 text-sm">
                        Apply Now →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">← Prev</button>
            <span className="px-4 py-2 text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">Next →</button>
          </div>
        )}
      </div>

      {/* Post Opportunity Modal */}
      {showPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">💼 Post Opportunity</h2>
              <button onClick={() => setShowPost(false)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">✕</button>
            </div>
            <form onSubmit={handlePost} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title *</label>
                  <input className="input-field" required value={postForm.title} onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Frontend Developer" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Company *</label>
                  <input className="input-field" required value={postForm.company} onChange={e => setPostForm(p => ({ ...p, company: e.target.value }))} placeholder="e.g. Google" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                  <select className="input-field" value={postForm.type} onChange={e => setPostForm(p => ({ ...p, type: e.target.value }))}>
                    <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                  <input className="input-field" value={postForm.location} onChange={e => setPostForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Mumbai / Remote" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Salary / Stipend</label>
                  <input className="input-field" value={postForm.salary} onChange={e => setPostForm(p => ({ ...p, salary: e.target.value }))} placeholder="e.g. ₹10,000/month" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input type="date" className="input-field" value={postForm.applicationDeadline} onChange={e => setPostForm(p => ({ ...p, applicationDeadline: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
                <textarea className="input-field min-h-[80px]" required value={postForm.description} onChange={e => setPostForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the role..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Requirements</label>
                <textarea className="input-field min-h-[60px]" value={postForm.requirements} onChange={e => setPostForm(p => ({ ...p, requirements: e.target.value }))} placeholder="Skills, experience, qualifications..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Skills (comma-separated)</label>
                <input className="input-field" value={postForm.skills} onChange={e => setPostForm(p => ({ ...p, skills: e.target.value }))} placeholder="e.g. React, Node.js, MongoDB" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">External Application Link (optional)</label>
                <input className="input-field" value={postForm.applicationLink} onChange={e => setPostForm(p => ({ ...p, applicationLink: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={posting} className="btn-primary flex-1">{posting ? 'Posting...' : '📤 Post Opportunity'}</button>
                <button type="button" onClick={() => setShowPost(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 slide-up">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-800">📋 Apply</h2>
              <button onClick={() => setApplyJob(null)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">✕</button>
            </div>
            <p className="text-sm text-indigo-600 font-medium mb-5">{applyJob.title} @ {applyJob.company}</p>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                <input className="input-field" required value={applyForm.name} onChange={e => setApplyForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                <input type="email" className="input-field" required value={applyForm.email} onChange={e => setApplyForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                <input type="tel" className="input-field" value={applyForm.phone} onChange={e => setApplyForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Resume Link *</label>
                <input className="input-field" required value={applyForm.resumeLink} onChange={e => setApplyForm(p => ({ ...p, resumeLink: e.target.value }))} placeholder="Google Drive / LinkedIn PDF link..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Note</label>
                <textarea className="input-field min-h-[100px]" value={applyForm.coverNote} onChange={e => setApplyForm(p => ({ ...p, coverNote: e.target.value }))} placeholder="Why are you a great fit for this role?..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={applying} className="btn-primary flex-1">{applying ? 'Submitting...' : '🚀 Submit Application'}</button>
                <button type="button" onClick={() => setApplyJob(null)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
