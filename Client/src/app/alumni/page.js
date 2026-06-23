'use client';
import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/api';

export default function AlumniPage() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const departments = ['Artificial Intelligence and Machine Learning Engineering', 'Artificial Intelligence and Data Science Engineering','Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronic and TeleCommunication Engineering' ];

  useEffect(() => {
    fetchAlumni();
  }, [page, department, graduationYear]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (department) params.department = department;
      if (graduationYear) params.graduationYear = graduationYear;

      const res = await usersAPI.getAll(params);
      setAlumni(res.data.users);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error fetching alumni:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAlumni();
  };

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      {/* Header */}
      <div className="gradient-bg py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Alumni Directory</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Search and connect with alumni from our network. Filter by department, year, or search by name.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search & Filters */}
        <div className="card !p-6 mb-8 !rounded-2xl">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, company, position..."
                className="input-field !pl-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="alumni-search"
              />
            </div>
            <select
              className="input-field !w-auto min-w-[180px]"
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
              id="alumni-dept-filter"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input
              type="number"
              placeholder="Grad Year"
              className="input-field !w-auto min-w-[140px]"
              min="1950"
              max="2030"
              value={graduationYear}
              onChange={(e) => { setGraduationYear(e.target.value); setPage(1); }}
              id="alumni-year-filter"
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </form>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{alumni.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> alumni
          </p>
        </div>

        {/* Alumni Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No alumni found</h3>
            <p className="text-slate-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {alumni.map((user) => (
              <div key={user._id} className="card group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                    {user.profilePic
                      ? <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="text-white text-xl font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{user.name}</h3>
                    {user.currentPosition && (
                      <p className="text-sm text-slate-500 truncate">{user.currentPosition}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {user.department && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-base">🎓</span>
                      <span className="truncate">{user.department}</span>
                    </div>
                  )}
                  {user.graduationYear && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-base">📅</span>
                      <span>Class of {user.graduationYear}</span>
                    </div>
                  )}
                  {user.currentCompany && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-base">🏢</span>
                      <span className="truncate">{user.currentCompany}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-base">📍</span>
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <p className="mt-3 text-sm text-slate-400 line-clamp-2">{user.bio}</p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  {user.email && (
                    <a href={`mailto:${user.email}`} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                      📧 Email
                    </a>
                  )}
                  {user.linkedIn && (
                    <a href={user.linkedIn} target="_blank" rel="noopener" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                      🔗 LinkedIn
                    </a>
                  )}
                  {user.github && (
                    <a href={user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`} target="_blank" rel="noopener" className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
                      🐙 GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10 mb-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 text-sm font-semibold rounded-xl transition-colors ${
                    page === pageNum
                      ? 'gradient-bg text-white'
                      : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
