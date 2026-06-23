'use client';
import { useState, useEffect } from 'react';
import { resumesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ResumePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('personal');

  const [resume, setResume] = useState({
    personalInfo: { fullName: '', email: '', phone: '', address: '', linkedIn: '', summary: '' },
    education: [{ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' }],
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '', isCurrent: false }],
    skills: [''],
    projects: [{ name: '', description: '', technologies: '', link: '' }],
    certifications: [{ name: '', issuer: '', year: '' }]
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchResume();
  }, [user]);

  const fetchResume = async () => {
    try {
      const res = await resumesAPI.get(user.id);
      setResume(prev => ({
        ...prev,
        ...res.data,
        skills: res.data.skills?.length ? res.data.skills : [''],
        education: res.data.education?.length ? res.data.education : prev.education,
        experience: res.data.experience?.length ? res.data.experience : prev.experience,
        projects: res.data.projects?.length ? res.data.projects : prev.projects,
        certifications: res.data.certifications?.length ? res.data.certifications : prev.certifications,
      }));
    } catch (err) {
      // No resume yet, use defaults
      setResume(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, fullName: user.name || '', email: user.email || '' }
      }));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanResume = {
        personalInfo: resume.personalInfo,
        education: resume.education.filter(e => e.institution || e.degree),
        experience: resume.experience.filter(e => e.company || e.position),
        skills: resume.skills.filter(s => s.trim()),
        projects: resume.projects.filter(p => p.name),
        certifications: resume.certifications.filter(c => c.name)
      };
      await resumesAPI.save(cleanResume);
      setMessage('Resume saved successfully! ✅');
    } catch (err) {
      setMessage('Failed to save resume ❌');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDownload = () => {
    if (user) window.open(resumesAPI.download(user.id), '_blank');
  };

  const updatePersonal = (field, value) => {
    setResume(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const updateArrayItem = (section, index, field, value) => {
    setResume(prev => {
      const arr = [...prev[section]];
      if (typeof arr[index] === 'string') arr[index] = value;
      else arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addArrayItem = (section, template) => {
    setResume(prev => ({ ...prev, [section]: [...prev[section], template] }));
  };

  const removeArrayItem = (section, index) => {
    setResume(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  };

  const sections = [
    { key: 'personal', icon: '👤', label: 'Personal' },
    { key: 'education', icon: '🎓', label: 'Education' },
    { key: 'experience', icon: '💼', label: 'Experience' },
    { key: 'skills', icon: '⚡', label: 'Skills' },
    { key: 'projects', icon: '🚀', label: 'Projects' },
    { key: 'certifications', icon: '🏆', label: 'Certs' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-10 h-10 text-indigo-500 mx-auto mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
          <p className="text-slate-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      {/* Header */}
      <div className="gradient-bg py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Resume Builder</h1>
            <p className="text-indigo-200">Create and download your professional resume</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-white text-indigo-600 font-semibold py-2.5 px-6 rounded-xl hover:bg-indigo-50 transition-all text-sm">
              {saving ? 'Saving...' : '💾 Save'}
            </button>
            <button onClick={handleDownload} className="bg-white/20 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-white/30 transition-all text-sm border border-white/30">
              📥 Download
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium border border-indigo-100 slide-up">
            {message}
          </div>
        )}

        {/* Section Navigation */}
        <div className="card !p-2 mb-6 !rounded-2xl">
          <div className="flex gap-1 overflow-x-auto">
            {sections.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === s.key ? 'gradient-bg text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Sections */}
        <div className="card !p-8 !rounded-2xl mb-12">
          {/* Personal Info */}
          {activeSection === 'personal' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 mb-4">👤 Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <InputField label="Full Name" value={resume.personalInfo.fullName} onChange={v => updatePersonal('fullName', v)} />
                <InputField label="Email" type="email" value={resume.personalInfo.email} onChange={v => updatePersonal('email', v)} />
                <InputField label="Phone" value={resume.personalInfo.phone} onChange={v => updatePersonal('phone', v)} />
                <InputField label="Address" value={resume.personalInfo.address} onChange={v => updatePersonal('address', v)} />
                <InputField label="LinkedIn URL" value={resume.personalInfo.linkedIn} onChange={v => updatePersonal('linkedIn', v)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Professional Summary</label>
                <textarea
                  className="input-field !min-h-[100px] resize-y"
                  value={resume.personalInfo.summary}
                  onChange={e => updatePersonal('summary', e.target.value)}
                  placeholder="Brief summary of your professional background..."
                />
              </div>
            </div>
          )}

          {/* Education */}
          {activeSection === 'education' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">🎓 Education</h2>
                <button onClick={() => addArrayItem('education', { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' })} className="btn-primary text-sm !py-2 !px-4">+ Add</button>
              </div>
              {resume.education.map((edu, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl mb-4 relative">
                  {resume.education.length > 1 && (
                    <button onClick={() => removeArrayItem('education', i)} className="absolute top-3 right-3 w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 text-sm">✕</button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField label="Institution" value={edu.institution} onChange={v => updateArrayItem('education', i, 'institution', v)} />
                    <InputField label="Degree" value={edu.degree} onChange={v => updateArrayItem('education', i, 'degree', v)} />
                    <InputField label="Field of Study" value={edu.fieldOfStudy} onChange={v => updateArrayItem('education', i, 'fieldOfStudy', v)} />
                    <InputField label="Grade/GPA" value={edu.grade} onChange={v => updateArrayItem('education', i, 'grade', v)} />
                    <InputField label="Start Year" type="number" value={edu.startYear} onChange={v => updateArrayItem('education', i, 'startYear', v)} />
                    <InputField label="End Year" type="number" value={edu.endYear} onChange={v => updateArrayItem('education', i, 'endYear', v)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {activeSection === 'experience' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">💼 Experience</h2>
                <button onClick={() => addArrayItem('experience', { company: '', position: '', startDate: '', endDate: '', description: '', isCurrent: false })} className="btn-primary text-sm !py-2 !px-4">+ Add</button>
              </div>
              {resume.experience.map((exp, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl mb-4 relative">
                  {resume.experience.length > 1 && (
                    <button onClick={() => removeArrayItem('experience', i)} className="absolute top-3 right-3 w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 text-sm">✕</button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField label="Company" value={exp.company} onChange={v => updateArrayItem('experience', i, 'company', v)} />
                    <InputField label="Position" value={exp.position} onChange={v => updateArrayItem('experience', i, 'position', v)} />
                    <InputField label="Start Date" value={exp.startDate} onChange={v => updateArrayItem('experience', i, 'startDate', v)} placeholder="e.g. Jan 2023" />
                    <InputField label="End Date" value={exp.endDate} onChange={v => updateArrayItem('experience', i, 'endDate', v)} placeholder="e.g. Dec 2024" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea className="input-field !min-h-[80px] resize-y" value={exp.description} onChange={e => updateArrayItem('experience', i, 'description', e.target.value)} placeholder="Describe your responsibilities..." />
                  </div>
                  <label className="flex items-center gap-2 mt-3 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={exp.isCurrent} onChange={e => updateArrayItem('experience', i, 'isCurrent', e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                    I currently work here
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {activeSection === 'skills' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">⚡ Skills</h2>
                <button onClick={() => addArrayItem('skills', '')} className="btn-primary text-sm !py-2 !px-4">+ Add</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {resume.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <input
                      type="text"
                      className="bg-transparent outline-none text-sm w-32"
                      value={skill}
                      onChange={e => updateArrayItem('skills', i, null, e.target.value)}
                      placeholder="e.g. React"
                    />
                    {resume.skills.length > 1 && (
                      <button onClick={() => removeArrayItem('skills', i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {activeSection === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">🚀 Projects</h2>
                <button onClick={() => addArrayItem('projects', { name: '', description: '', technologies: '', link: '' })} className="btn-primary text-sm !py-2 !px-4">+ Add</button>
              </div>
              {resume.projects.map((proj, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl mb-4 relative">
                  {resume.projects.length > 1 && (
                    <button onClick={() => removeArrayItem('projects', i)} className="absolute top-3 right-3 w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 text-sm">✕</button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField label="Project Name" value={proj.name} onChange={v => updateArrayItem('projects', i, 'name', v)} />
                    <InputField label="Technologies" value={proj.technologies} onChange={v => updateArrayItem('projects', i, 'technologies', v)} placeholder="e.g. React, Node.js" />
                    <InputField label="Link" value={proj.link} onChange={v => updateArrayItem('projects', i, 'link', v)} placeholder="https://..."  target="_blank" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea className="input-field !min-h-[80px] resize-y" value={proj.description} onChange={e => updateArrayItem('projects', i, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {activeSection === 'certifications' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">🏆 Certifications</h2>
                <button onClick={() => addArrayItem('certifications', { name: '', issuer: '', year: '' })} className="btn-primary text-sm !py-2 !px-4">+ Add</button>
              </div>
              {resume.certifications.map((cert, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl mb-4 relative">
                  {resume.certifications.length > 1 && (
                    <button onClick={() => removeArrayItem('certifications', i)} className="absolute top-3 right-3 w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 text-sm">✕</button>
                  )}
                  <div className="grid md:grid-cols-3 gap-4">
                    <InputField label="Certification Name" value={cert.name} onChange={v => updateArrayItem('certifications', i, 'name', v)} />
                    <InputField label="Issuer" value={cert.issuer} onChange={v => updateArrayItem('certifications', i, 'issuer', v)} />
                    <InputField label="Year" type="number" value={cert.year} onChange={v => updateArrayItem('certifications', i, 'year', v)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input type={type} className="input-field" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || label} />
    </div>
  );
}
