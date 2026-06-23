'use client';
import { useState, useEffect } from 'react';
import { adminAPI, jobsAPI, eventsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', graduationYear: '', department: '' });
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '', location: '', category: 'Other', maxAttendees: 0 });

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 100 })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error('Admin fetch error:', err);
    }
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addUser({
        ...newUser,
        graduationYear: newUser.graduationYear ? parseInt(newUser.graduationYear) : undefined
      });
      setMessage('User added successfully! ✅');
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', graduationYear: '', department: '' });
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add user ❌');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      await jobsAPI.create(newJob);
      setMessage('Job posted successfully! ✅');
      setShowAddJob(false);
      setNewJob({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' });
      fetchData();
    } catch (err) {
      setMessage('Failed to post job ❌');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await eventsAPI.create({
        ...newEvent,
        maxAttendees: parseInt(newEvent.maxAttendees) || 0
      });
      setMessage('Event created successfully! ✅');
      setShowAddEvent(false);
      setNewEvent({ title: '', description: '', date: '', time: '', location: '', category: 'Other', maxAttendees: 0 });
      fetchData();
    } catch (err) {
      setMessage('Failed to create event ❌');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      setMessage('User deleted ✅');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete user ❌');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      setMessage(`Role updated to ${newRole} ✅`);
      fetchData();
    } catch (err) {
      setMessage('Failed to update role ❌');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const departments = ['Artificial Intelligence and Machine Learning Engineering', 'Artificial Intelligence and Data Science Engineering','Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronic and TeleCommunication Engineering' ];
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin w-10 h-10 text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      {/* Header */}
      <div className="gradient-bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-indigo-200">Manage users, jobs, and events</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100 slide-up">{message}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="👥" label="Total Users" value={stats?.totalUsers || 0} color="bg-indigo-50 text-indigo-600" />
          <StatCard icon="💼" label="Total Jobs" value={stats?.totalJobs || 0} color="bg-emerald-50 text-emerald-600" />
          <StatCard icon="📅" label="Total Events" value={stats?.totalEvents || 0} color="bg-amber-50 text-amber-600" />
          <StatCard icon="📄" label="Resumes" value={stats?.totalResumes || 0} color="bg-rose-50 text-rose-600" />
        </div>

        {/* Tab Navigation */}
        <div className="card !p-2 mb-6 !rounded-2xl">
          <div className="flex gap-1">
            {[
              { key: 'dashboard', label: '📊 Overview' },
              { key: 'users', label: '👥 Users' },
              { key: 'jobs', label: '💼 Jobs' },
              { key: 'events', label: '📅 Events' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'gradient-bg text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="card !p-6 !rounded-2xl mb-12">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Users</h2>
            <div className="space-y-3">
              {stats?.recentUsers?.map(u => (
                <div key={u._id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">{u.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{u.name}</p>
                    <p className="text-sm text-slate-500 truncate">{u.email}</p>
                  </div>
                  <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span>
                  <span className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="card !p-6 !rounded-2xl mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex-1 w-full sm:max-w-sm relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input-field !pl-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={() => setShowAddUser(true)} className="btn-primary text-sm !py-2.5">
                + Add User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Department</th>
                    <th className="pb-3 pr-4">Year</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-bold">{u.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-slate-700">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                      <td className="py-3 pr-4 text-slate-500">{u.department || '—'}</td>
                      <td className="py-3 pr-4 text-slate-500">{u.graduationYear || '—'}</td>
                      <td className="py-3 pr-4">
                        <button onClick={() => handleToggleRole(u._id, u.role)} className={`badge cursor-pointer hover:opacity-80 ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>
                          {u.role}
                        </button>
                      </td>
                      <td className="py-3">
                        {u._id !== user?.id && (
                          <button onClick={() => handleDeleteUser(u._id)} className="btn-danger !py-1 !px-3 text-xs">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <p className="text-center text-slate-400 py-8">No users found</p>
            )}
          </div>
        )}

        {/* Jobs Management */}
        {activeTab === 'jobs' && (
          <div className="card !p-6 !rounded-2xl mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Manage Jobs</h2>
              <button onClick={() => setShowAddJob(true)} className="btn-primary text-sm !py-2.5">+ Post Job</button>
            </div>
            <p className="text-slate-500 text-sm">Total jobs posted: <span className="font-bold text-indigo-600">{stats?.totalJobs || 0}</span></p>
            <p className="text-sm text-slate-400 mt-2">Create new job listings and manage them from the Jobs page.</p>
          </div>
        )}

        {/* Events Management */}
        {activeTab === 'events' && (
          <div className="card !p-6 !rounded-2xl mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Manage Events</h2>
              <button onClick={() => setShowAddEvent(true)} className="btn-primary text-sm !py-2.5">+ Create Event</button>
            </div>
            <p className="text-slate-500 text-sm">Total events: <span className="font-bold text-indigo-600">{stats?.totalEvents || 0}</span></p>
            <p className="text-sm text-slate-400 mt-2">Create new events and manage them from the Events page.</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <Modal title="Add New User" onClose={() => setShowAddUser(false)}>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                <input className="input-field" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                <input className="input-field" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password *</label>
                <input className="input-field" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Graduation Year</label>
                <input className="input-field" type="number" min="1950" max="2030" value={newUser.graduationYear} onChange={e => setNewUser({...newUser, graduationYear: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                <select className="input-field" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})}>
                  <option value="">Select...</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Add User</button>
              <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Job Modal */}
      {showAddJob && (
        <Modal title="Post New Job" onClose={() => setShowAddJob(false)}>
          <form onSubmit={handleAddJob} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                <input className="input-field" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company *</label>
                <input className="input-field" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                <input className="input-field" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                <select className="input-field" value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})}>
                  {['Full-time','Part-time','Internship','Contract','Remote'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Salary</label>
                <input className="input-field" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} placeholder="e.g. $50k-$70k" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
              <textarea className="input-field !min-h-[80px]" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Requirements</label>
              <textarea className="input-field !min-h-[60px]" value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Post Job</button>
              <button type="button" onClick={() => setShowAddJob(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <Modal title="Create New Event" onClose={() => setShowAddEvent(false)}>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
              <input className="input-field" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                <input className="input-field" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                <input className="input-field" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} placeholder="e.g. 10:00 AM" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select className="input-field" value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})}>
                  {['Reunion','Workshop','Seminar','Networking','Cultural','Sports','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                <input className="input-field" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Max Attendees (0 = unlimited)</label>
                <input className="input-field" type="number" min="0" value={newEvent.maxAttendees} onChange={e => setNewEvent({...newEvent, maxAttendees: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
              <textarea className="input-field !min-h-[80px]" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Create Event</button>
              <button type="button" onClick={() => setShowAddEvent(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card !rounded-2xl">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-xl`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
