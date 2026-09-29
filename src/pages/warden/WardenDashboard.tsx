import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  GatePass,
  Complaint,
  Notice,
  MessFeedback
} from '../../types';
import { HostelManagementView } from '../../components/HostelManagementView';
import {
  Building2,
  Users,
  QrCode,
  AlertCircle,
  Megaphone,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus
} from 'lucide-react';

interface WardenDashboardProps {
  currentTab: string;
}

export const WardenDashboard: React.FC<WardenDashboardProps> = ({ currentTab }) => {
  const { user } = useAuth();

  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [feedback, setFeedback] = useState<MessFeedback[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // New Notice form state
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');

  const loadData = async () => {
    try {
      const [gpRes, cRes, nRes, fRes] = await Promise.all([
        apiRequest<{ gatePasses: GatePass[] }>('/api/gatepasses'),
        apiRequest<{ complaints: Complaint[] }>('/api/complaints'),
        apiRequest<{ notices: Notice[] }>('/api/notices'),
        apiRequest<{ feedback: MessFeedback[] }>('/api/mess/feedback')
      ]);

      setGatePasses(gpRes.gatePasses || []);
      setComplaints((cRes.complaints || []).filter(c => c.category === 'hostel' || c.category === 'maintenance'));
      setNotices(nRes.notices || []);
      setFeedback(fRes.feedback || []);
    } catch (err) {
      console.error('Failed to load warden data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerNotice = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
    loadData();
  };

  const handlePassAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await apiRequest(`/api/gatepasses/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      triggerNotice(`Gate pass marked as ${status}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleComplaintStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/api/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          resolutionNotes: `Status updated to ${status} by Warden`
        })
      });
      triggerNotice('Hostel maintenance complaint updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublishHostelNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    try {
      await apiRequest('/api/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          category: 'hostel',
          targetAudience: 'hostelers',
          isPinned: false
        })
      });
      setNoticeTitle('');
      setNoticeContent('');
      triggerNotice('Hostel bulletin published.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {actionMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#12313B]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hostel Administration & Warden Command</h1>
          <p className="text-xs text-[#91B8C0] mt-0.5">
            {user?.name} · Chief Warden · Residence & Bed Allocations Board
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12313B] text-xs font-semibold text-[#D9F7FA] hover:bg-[#1a4452] border border-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#35D6E8]" /> Refresh Data
        </button>
      </div>

      {/* TAB: OVERVIEW & ROOM ALLOCATIONS */}
      {(currentTab === 'overview' || currentTab === 'allocations') && (
        <HostelManagementView userRole="warden" userName={user?.name} />
      )}

      {/* TAB: GATE PASS APPROVALS */}
      {currentTab === 'gatepasses' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
            Hostel Gate Pass Applications
          </div>
          <div className="divide-y divide-[#12313B]">
            {gatePasses.map(gp => (
              <div key={gp.id} className="p-4 hover:bg-[#12313B]/30 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="font-mono text-[#35D6E8]">{gp.passCode}</span>
                    <span>{gp.studentName}</span>
                    <span className="text-[#91B8C0]">({gp.rollNumber})</span>
                  </div>
                  <p className="text-xs text-[#D9F7FA] mt-1">Destination: {gp.destination}</p>
                  <p className="text-[11px] text-[#91B8C0]">Reason: {gp.reason}</p>
                  <div className="text-[11px] text-[#6EEAF5] font-mono mt-1">
                    Return Window: {new Date(gp.expectedReturnTime).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    gp.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    gp.status === 'used' ? 'bg-blue-500/20 text-blue-400' :
                    gp.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {gp.status}
                  </span>

                  {gp.status === 'pending' && (
                    <div className="flex gap-1.5 ml-2">
                      <button
                        onClick={() => handlePassAction(gp.id, 'approved')}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handlePassAction(gp.id, 'rejected')}
                        className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: COMPLAINTS & TICKETS */}
      {currentTab === 'complaints' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
            Hostel Maintenance Issues & Tickets
          </div>
          <div className="divide-y divide-[#12313B]">
            {complaints.map(c => (
              <div key={c.id} className="p-4 hover:bg-[#12313B]/30 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#35D6E8] font-bold">{c.ticketNumber}</span>
                    <span className="font-semibold text-white">{c.subject}</span>
                  </div>
                  <p className="text-xs text-[#D9F7FA] mt-1">{c.description}</p>
                  <div className="text-[11px] text-[#91B8C0] mt-1">
                    Student: {c.studentName} · Target Date: {c.resolutionTargetDate}
                  </div>
                </div>

                <select
                  value={c.status}
                  onChange={e => handleComplaintStatus(c.id, e.target.value)}
                  className="bg-[#12313B] border border-white/10 rounded px-2.5 py-1 text-xs text-white capitalize shrink-0"
                >
                  <option value="submitted">Submitted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DINING FEEDBACK */}
      {currentTab === 'mess' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
            Student Dining & Mess Feedback
          </div>
          <div className="divide-y divide-[#12313B]">
            {feedback.map(f => (
              <div key={f.id} className="p-4 hover:bg-[#12313B]/30 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-white">{f.studentName} · <span className="capitalize text-[#35D6E8]">{f.mealType}</span></span>
                  <span className="font-mono text-amber-300 font-bold">★ {f.rating}/5</span>
                </div>
                <p className="text-[#D9F7FA]">{f.comment || 'No written comment'}</p>
                <div className="text-[10px] text-[#66848C] font-mono mt-1">{f.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: NOTICES */}
      {currentTab === 'notices' && (
        <form onSubmit={handlePublishHostelNotice} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-[#12313B]">
            Publish Hostel Bulletin
          </h3>
          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={noticeTitle}
              onChange={e => setNoticeTitle(e.target.value)}
              placeholder="e.g. Maintenance Inspection of Hot Water Line"
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Notice Content</label>
            <textarea
              required
              rows={3}
              value={noticeContent}
              onChange={e => setNoticeContent(e.target.value)}
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
          >
            Publish Bulletin
          </button>
        </form>
      )}
    </div>
  );
};
