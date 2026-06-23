'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DEPARTMENTS = ['Artificial Intelligence and Machine Learning Engineering', 'Artificial Intelligence and Data Science Engineering','Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronic and TeleCommunication Engineering' ];
const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  // SGPA form state
  const [newSgpa, setNewSgpa] = useState({ year: '', semester: 'Sem 1', sgpa: '' });
  // Achievement form
  const [newAch, setNewAch] = useState({ title: '', description: '', year: '' });
  // Certification form
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: '', url: '' });
  // Work form
  const [newWork, setNewWork] = useState({ company: '', role: '', type: 'Job', startDate: '', endDate: '', current: false, description: '' });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getById(user._id || user.id);
      setProfile(res.data);
    } catch { setMsg('Failed to load profile'); }
    setLoading(false);
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await usersAPI.uploadPhoto(user._id || user.id, fd);
      setProfile(p => ({ ...p, profilePic: res.data.profilePic }));
      showMsg('✅ Photo updated!');
    } catch { showMsg('❌ Photo upload failed'); }
    setUploadingPhoto(false);
  };

  const handleSaveBasic = async () => {
    setSaving(true);
    try {
      const res = await usersAPI.update(user._id || user.id, {
        name: profile.name, phone: profile.phone, bio: profile.bio,
        department: profile.department, graduationYear: profile.graduationYear,
        linkedIn: profile.linkedIn, github: profile.github,
        currentCompany: profile.currentCompany, currentPosition: profile.currentPosition,
        location: profile.location
      });
      setProfile(res.data);
      showMsg('✅ Profile saved!');
    } catch { showMsg('❌ Save failed'); }
    setSaving(false);
  };

  const addSgpa = async () => {
    if (!newSgpa.year || !newSgpa.sgpa) return;
    const updated = [...(profile.sgpaData || []), { ...newSgpa, sgpa: parseFloat(newSgpa.sgpa) }]
      .sort((a, b) => a.semester.localeCompare(b.semester));
    try {
      const res = await usersAPI.update(user._id || user.id, { sgpaData: updated });
      setProfile(res.data); setNewSgpa({ year: '', semester: 'Sem 1', sgpa: '' });
      showMsg('✅ SGPA added!');
    } catch { showMsg('❌ Failed'); }
  };

  const removeSgpa = async (idx) => {
    const updated = profile.sgpaData.filter((_, i) => i !== idx);
    const res = await usersAPI.update(user._id || user.id, { sgpaData: updated });
    setProfile(res.data);
  };

  const addAchievement = async () => {
    if (!newAch.title) return;
    const updated = [...(profile.achievements || []), newAch];
    const res = await usersAPI.update(user._id || user.id, { achievements: updated });
    setProfile(res.data); setNewAch({ title: '', description: '', year: '' });
    showMsg('✅ Achievement added!');
  };

  const removeAchievement = async (idx) => {
    const updated = profile.achievements.filter((_, i) => i !== idx);
    const res = await usersAPI.update(user._id || user.id, { achievements: updated });
    setProfile(res.data);
  };

  const addCert = async () => {
    if (!newCert.name) return;
    const updated = [...(profile.certifications || []), newCert];
    const res = await usersAPI.update(user._id || user.id, { certifications: updated });
    setProfile(res.data); setNewCert({ name: '', issuer: '', year: '', url: '' });
    showMsg('✅ Certification added!');
  };

  const removeCert = async (idx) => {
    const updated = profile.certifications.filter((_, i) => i !== idx);
    const res = await usersAPI.update(user._id || user.id, { certifications: updated });
    setProfile(res.data);
  };

  const addWork = async () => {
    if (!newWork.company || !newWork.role) return;
    const updated = [...(profile.workHistory || []), newWork];
    const res = await usersAPI.update(user._id || user.id, { workHistory: updated });
    setProfile(res.data); setNewWork({ company: '', role: '', type: 'Job', startDate: '', endDate: '', current: false, description: '' });
    showMsg('✅ Experience added!');
  };

  const removeWork = async (idx) => {
    const updated = profile.workHistory.filter((_, i) => i !== idx);
    const res = await usersAPI.update(user._id || user.id, { workHistory: updated });
    setProfile(res.data);
  };

  const sgpaChartData = {
    labels: (profile?.sgpaData || []).map(d => `${d.semester}${d.year ? ` (${d.year})` : ''}`),
    datasets: [{
      label: 'SGPA',
      data: (profile?.sgpaData || []).map(d => d.sgpa),
      backgroundColor: 'rgba(99,102,241,0.7)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const tabs = [
    { id: 'info', label: '👤 Info' },
    { id: 'sgpa', label: '📊 SGPA' },
    { id: 'achievements', label: '🏆 Achievements' },
    { id: 'certifications', label: '🎖️ Certifications' },
    { id: 'work', label: '💼 Experience' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      {/* Header */}
      <div className="gradient-bg py-14 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-3xl overflow-hidden bg-white/20 border-4 border-white/40 shadow-xl">
              {profile.profilePic
                ? <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">{profile.name?.charAt(0)?.toUpperCase()}</div>
              }
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-all border border-indigo-100"
              disabled={uploadingPhoto}>
              {uploadingPhoto ? '⏳' : '📷'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
            <p className="text-indigo-200 mt-1">{profile.currentPosition || 'Alumni'}{profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}</p>
            <p className="text-indigo-300 text-sm mt-1">{profile.department} {profile.graduationYear ? `· Class of ${profile.graduationYear}` : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {msg && <div className="mb-6 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100 slide-up">{msg}</div>}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.id ? 'gradient-bg text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="card space-y-5">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name' },
                { label: 'Phone', key: 'phone' },
                { label: 'Location', key: 'location' },
                { label: 'LinkedIn URL', key: 'linkedIn' },
                { label: 'GitHub URL / Username', key: 'github' },
                { label: 'Current Company', key: 'currentCompany' },
                { label: 'Current Position', key: 'currentPosition' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">{f.label}</label>
                  <input className="input-field" value={profile[f.key] || ''} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Department</label>
                <select className="input-field" value={profile.department || ''} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Graduation Year</label>
                <input type="number" className="input-field" min="1990" max="2030" value={profile.graduationYear || ''} onChange={e => setProfile(p => ({ ...p, graduationYear: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Bio</label>
              <textarea className="input-field min-h-[100px]" value={profile.bio || ''} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Write something about yourself..." />
            </div>
            <button onClick={handleSaveBasic} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>
        )}

        {/* SGPA TAB */}
        {activeTab === 'sgpa' && (
          <div className="space-y-6">
            {profile.sgpaData?.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-slate-800 mb-4">📊 SGPA Progress</h2>
                <Bar data={sgpaChartData} options={{
                  responsive: true,
                  plugins: { legend: { display: false }, title: { display: false } },
                  scales: {
                    y: { min: 0, max: 10, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                  }
                }} />
              </div>
            )}
            <div className="card">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Add Semester SGPA</h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Academic Year</label>
                  <input className="input-field" placeholder="e.g. 2022-23" value={newSgpa.year} onChange={e => setNewSgpa(p => ({ ...p, year: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Semester</label>
                  <select className="input-field" value={newSgpa.semester} onChange={e => setNewSgpa(p => ({ ...p, semester: e.target.value }))}>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SGPA (0–10)</label>
                  <input type="number" step="0.01" min="0" max="10" className="input-field" placeholder="e.g. 8.5" value={newSgpa.sgpa} onChange={e => setNewSgpa(p => ({ ...p, sgpa: e.target.value }))} />
                </div>
              </div>
              <button onClick={addSgpa} className="btn-primary text-sm">+ Add SGPA</button>
            </div>
            {profile.sgpaData?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-slate-700 mb-3">All Entries</h3>
                <div className="space-y-2">
                  {profile.sgpaData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-medium text-slate-700">{d.semester} — {d.year}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-600 font-bold">{d.sgpa}</span>
                        <button onClick={() => removeSgpa(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Add Achievement</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
                  <input className="input-field" placeholder="e.g. National Hackathon Winner" value={newAch.title} onChange={e => setNewAch(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
                  <input className="input-field" placeholder="e.g. 2023" value={newAch.year} onChange={e => setNewAch(p => ({ ...p, year: e.target.value }))} />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <textarea className="input-field min-h-[70px]" placeholder="Describe the achievement..." value={newAch.description} onChange={e => setNewAch(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button onClick={addAchievement} className="btn-primary text-sm">🏆 Add Achievement</button>
            </div>
            {profile.achievements?.map((a, i) => (
              <div key={i} className="card !p-4 flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">{a.title}</h3>
                    <div className="flex items-center gap-2">
                      {a.year && <span className="text-xs text-slate-400">{a.year}</span>}
                      <button onClick={() => removeAchievement(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                  </div>
                  {a.description && <p className="text-sm text-slate-500 mt-1">{a.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CERTIFICATIONS TAB */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Add Certification</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Certificate Name *</label>
                  <input className="input-field" placeholder="e.g. AWS Certified Developer" value={newCert.name} onChange={e => setNewCert(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Issuer</label>
                  <input className="input-field" placeholder="e.g. Amazon Web Services" value={newCert.issuer} onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
                  <input className="input-field" placeholder="e.g. 2024" value={newCert.year} onChange={e => setNewCert(p => ({ ...p, year: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Certificate URL</label>
                  <input className="input-field" placeholder="https://..." value={newCert.url} onChange={e => setNewCert(p => ({ ...p, url: e.target.value }))} />
                </div>
              </div>
              <button onClick={addCert} className="btn-primary text-sm">🎖️ Add Certification</button>
            </div>
            {profile.certifications?.map((c, i) => (
              <div key={i} className="card !p-4 flex items-center gap-3">
                <span className="text-2xl">🎖️</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">{c.name}</h3>
                    <button onClick={() => removeCert(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                  <p className="text-sm text-slate-500">{c.issuer}{c.year ? ` · ${c.year}` : ''}</p>
                  {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">View Certificate →</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WORK TAB */}
        {activeTab === 'work' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Add Experience</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Company *</label>
                  <input className="input-field" placeholder="e.g. Google" value={newWork.company} onChange={e => setNewWork(p => ({ ...p, company: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Role *</label>
                  <input className="input-field" placeholder="e.g. Software Engineer" value={newWork.role} onChange={e => setNewWork(p => ({ ...p, role: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                  <select className="input-field" value={newWork.type} onChange={e => setNewWork(p => ({ ...p, type: e.target.value }))}>
                    <option value="Job">Job</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                  <input className="input-field" placeholder="e.g. Jun 2023" value={newWork.startDate} onChange={e => setNewWork(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                  <input className="input-field" placeholder="e.g. Dec 2023" disabled={newWork.current} value={newWork.endDate} onChange={e => setNewWork(p => ({ ...p, endDate: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="current-job" checked={newWork.current} onChange={e => setNewWork(p => ({ ...p, current: e.target.checked, endDate: '' }))} className="w-4 h-4 accent-indigo-600" />
                  <label htmlFor="current-job" className="text-sm font-medium text-slate-600">Currently working here</label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <textarea className="input-field min-h-[70px]" placeholder="Brief description of your role..." value={newWork.description} onChange={e => setNewWork(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button onClick={addWork} className="btn-primary text-sm">💼 Add Experience</button>
            </div>
            {profile.workHistory?.map((w, i) => (
              <div key={i} className="card !p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${w.type === 'Internship' ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                  {w.type === 'Internship' ? '🎓' : '💼'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{w.role}</h3>
                      <p className="text-sm text-indigo-600 font-medium">{w.company}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${w.type === 'Internship' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{w.type}</span>
                      <button onClick={() => removeWork(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{w.startDate}{w.startDate ? ' – ' : ''}{w.current ? 'Present' : w.endDate}</p>
                  {w.description && <p className="text-sm text-slate-500 mt-2">{w.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
