import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { AlumniPost } from '../../types';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface AlumniDashboardProps {
  currentTab: string;
}

export const AlumniDashboard: React.FC<AlumniDashboardProps> = ({ currentTab }) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<AlumniPost[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form State
  const [postType, setPostType] = useState<AlumniPost['type']>('workshop');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('Seminar Hall 1 / Hybrid');
  const [stipendOrSalary, setStipendOrSalary] = useState<string>('Stipend backed');
  const [requirements, setRequirements] = useState<string>('Python, REST APIs');
  const [deadline, setDeadline] = useState<string>(new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      const res = await apiRequest<{ posts: AlumniPost[] }>('/api/alumni/posts');
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Failed to load alumni posts:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
    loadData();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      await apiRequest('/api/alumni/posts', {
        method: 'POST',
        body: JSON.stringify({
          type: postType,
          title,
          description,
          location,
          stipendOrSalary,
          requirements: requirements.split(',').map(r => r.trim()),
          deadline
        })
      });

      setTitle('');
      setDescription('');
      triggerNotice('Opportunity submitted! It will appear on the student portal once verified by the administrator.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await apiRequest(`/api/alumni/posts/${postId}`, {
        method: 'DELETE'
      });
      triggerNotice('Opportunity removed.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const myPosts = posts.filter(p => p.alumniId === user?.id || p.alumniEmail === user?.email);
  const totalApplicants = myPosts.reduce((acc, p) => acc + (p.applicants?.length || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {actionNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#12313B]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Alumni Network & Career Mentorship</h1>
          <p className="text-xs text-[#91B8C0] mt-0.5">
            {user?.name} · {user?.company || 'Databricks AI Labs'} · Class of {user?.graduationYear || 2021}
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12313B] text-xs font-semibold text-[#D9F7FA] hover:bg-[#1a4452] border border-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#35D6E8]" /> Sync Opportunities
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
          <div className="text-xs text-[#91B8C0]">Your Published Opportunities</div>
          <div className="text-3xl font-bold text-white font-mono mt-1">{myPosts.length}</div>
          <div className="text-[11px] text-[#35D6E8] mt-1">Jobs, Internships, Workshops</div>
        </div>

        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
          <div className="text-xs text-[#91B8C0]">Student Applications Received</div>
          <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">{totalApplicants}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Verified Enrolled Students</div>
        </div>

        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
          <div className="text-xs text-[#91B8C0]">Network Status</div>
          <div className="text-xl font-bold text-[#6EEAF5] font-mono mt-2">Verified Mentor</div>
          <div className="text-[11px] text-[#91B8C0] mt-1">Campus Nexus Alumni Chapter</div>
        </div>
      </div>

      {/* TAB: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider flex justify-between items-center">
              <span>Your Posted Opportunities</span>
              <span className="text-[#91B8C0]">{myPosts.length} Active</span>
            </div>

            <div className="divide-y divide-[#12313B] text-xs">
              {myPosts.length === 0 ? (
                <div className="p-8 text-center text-[#66848C]">
                  You have not published any opportunities yet. Click "Publish Opportunity" to post jobs or workshops.
                </div>
              ) : (
                myPosts.map(p => (
                  <div key={p.id} className="p-4 hover:bg-[#12313B]/30 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#35D6E8]/10 text-[#35D6E8] font-bold">
                          {p.type}
                        </span>
                        <span className="font-bold text-white text-sm">{p.title}</span>
                      </div>
                      <p className="text-[#D9F7FA] text-xs mt-1">{p.description}</p>
                      <div className="text-[11px] text-[#91B8C0] mt-1">
                        Location: {p.location} · Deadline: {p.deadline} · <span className="text-emerald-400 font-bold">{p.applicants?.length || 0} student(s) applied</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        p.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {p.status}
                      </span>
                      <button
                        onClick={() => handleDeletePost(p.id)}
                        className="p-1.5 rounded text-[#91B8C0] hover:text-rose-400 hover:bg-[#12313B]"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PUBLISH OPPORTUNITY */}
      {currentTab === 'create' && (
        <form onSubmit={handleCreatePost} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-6 text-xs space-y-4 max-w-2xl">
          <div className="pb-2 border-b border-[#12313B]">
            <h3 className="text-sm font-bold text-white">Create New Student Career Track</h3>
            <p className="text-[11px] text-[#91B8C0]">Opportunities undergo administrative moderation before appearing on student portals</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Opportunity Type</label>
              <select
                value={postType}
                onChange={e => setPostType(e.target.value as any)}
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="workshop">Interactive Masterclass Workshop</option>
                <option value="internship">Paid Summer / Winter Internship</option>
                <option value="job">Full-Time Placement Recruitment</option>
                <option value="mentoring">1-on-1 Alumni Mentorship</option>
                <option value="event">Campus Tech Talk</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Opportunity Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Distributed Database Engineering Masterclass"
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Detailed Description & Agenda</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Topics covered, eligibility criteria, benefits, learning outcomes..."
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Location / Mode</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Seminar Hall 1 or Remote"
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Stipend or Compensation (if applicable)</label>
              <input
                type="text"
                value={stipendOrSalary}
                onChange={e => setStipendOrSalary(e.target.value)}
                placeholder="e.g. ₹60,000 / month or Free"
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Key Prerequisites (comma separated)</label>
            <input
              type="text"
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              placeholder="e.g. Python, Docker, Algorithms"
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5] transition-colors"
          >
            Submit for Administrative Review
          </button>
        </form>
      )}

      {/* TAB: STUDENT APPLICANTS */}
      {currentTab === 'applicants' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
            Student Applicants Roster
          </div>

          <div className="divide-y divide-[#12313B] text-xs">
            {totalApplicants === 0 ? (
              <div className="p-8 text-center text-[#66848C]">No applications received yet.</div>
            ) : (
              myPosts.flatMap(p =>
                (p.applicants || []).map(app => (
                  <div key={`${p.id}_${app.studentId}`} className="p-4 hover:bg-[#12313B]/30 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">
                        {app.studentName} ({app.rollNumber}) · <span className="text-[#35D6E8]">{p.title}</span>
                      </div>
                      <p className="text-[11px] text-[#91B8C0] mt-0.5">Note: {app.note || 'Academic profile review requested'}</p>
                      <div className="text-[10px] text-[#66848C] font-mono mt-0.5">{app.email} · Applied on {new Date(app.appliedAt).toLocaleDateString()}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                      Applicant
                    </span>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
