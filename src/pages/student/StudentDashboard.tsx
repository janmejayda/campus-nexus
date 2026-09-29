import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  StudentAttendanceSummary,
  TimetableEntry,
  GatePass,
  LeaveRequest,
  CertificateRequest,
  Complaint,
  MessMenuDay,
  FeeRecord,
  AlumniPost,
  detectBranch
} from '../../types';
import { QRPassModal } from '../../components/QRPassModal';
import {
  CalendarCheck,
  CalendarDays,
  QrCode,
  FileCheck,
  FileText,
  Building2,
  UtensilsCrossed,
  AlertCircle,
  CreditCard,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  Download,
  Send
} from 'lucide-react';

interface StudentDashboardProps {
  currentTab: string;
  onOpenAIAssistant: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentTab,
  onOpenAIAssistant
}) => {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState<StudentAttendanceSummary | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [certificates, setCertificates] = useState<CertificateRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [messMenu, setMessMenu] = useState<MessMenuDay[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [alumniPosts, setAlumniPosts] = useState<AlumniPost[]>([]);

  // Selected pass for modal
  const [activeModalPass, setActiveModalPass] = useState<GatePass | null>(null);

  // New Gate Pass Form
  const [destination, setDestination] = useState<string>('Central City Library');
  const [passReason, setPassReason] = useState<string>('Academic Research and Reference Material Study');
  const [exitTime, setExitTime] = useState<string>(new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16));
  const [expectedReturnTime, setExpectedReturnTime] = useState<string>(new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 16));

  // New Leave Form
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Academic');
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState<string>('');

  // New Certificate Form
  const [certType, setCertType] = useState<CertificateRequest['certificateType']>('Bonafide');
  const [certPurpose, setCertPurpose] = useState<string>('Passport Application and Verification');

  // New Complaint Form
  const [compCat, setCompCat] = useState<Complaint['category']>('hostel');
  const [compSub, setCompSub] = useState<string>('');
  const [compDesc, setCompDesc] = useState<string>('');

  // Dining Feedback Form
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('lunch');
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  // Application Note for Alumni
  const [applyPostId, setApplyPostId] = useState<string | null>(null);
  const [applicantNote, setApplicantNote] = useState<string>('');

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        apiRequest<StudentAttendanceSummary>('/api/attendance/my'),
        apiRequest<{ timetable: TimetableEntry[] }>('/api/timetable'),
        apiRequest<{ gatePasses: GatePass[] }>('/api/gatepasses'),
        apiRequest<{ leaveRequests: LeaveRequest[] }>('/api/leave'),
        apiRequest<{ certificates: CertificateRequest[] }>('/api/certificates'),
        apiRequest<{ complaints: Complaint[] }>('/api/complaints'),
        apiRequest<{ menu: MessMenuDay[] }>('/api/mess/menu'),
        apiRequest<{ fees: FeeRecord[] }>('/api/fees'),
        apiRequest<{ posts: AlumniPost[] }>('/api/alumni/posts')
      ]);

      const getVal = <T,>(res: PromiseSettledResult<T>): T | null =>
        res.status === 'fulfilled' ? res.value : null;

      const attRes = getVal<StudentAttendanceSummary>(results[0]);
      const ttRes = getVal<{ timetable: TimetableEntry[] }>(results[1]);
      const gpRes = getVal<{ gatePasses: GatePass[] }>(results[2]);
      const lrRes = getVal<{ leaveRequests: LeaveRequest[] }>(results[3]);
      const certRes = getVal<{ certificates: CertificateRequest[] }>(results[4]);
      const cmpRes = getVal<{ complaints: Complaint[] }>(results[5]);
      const menuRes = getVal<{ menu: MessMenuDay[] }>(results[6]);
      const feeRes = getVal<{ fees: FeeRecord[] }>(results[7]);
      const alpRes = getVal<{ posts: AlumniPost[] }>(results[8]);

      if (attRes) setAttendance(attRes);
      if (ttRes?.timetable) setTimetable(ttRes.timetable);
      if (gpRes?.gatePasses) setGatePasses(gpRes.gatePasses);
      if (lrRes?.leaveRequests) setLeaveRequests(lrRes.leaveRequests);
      if (certRes?.certificates) setCertificates(certRes.certificates);
      if (cmpRes?.complaints) setComplaints(cmpRes.complaints);
      if (menuRes?.menu) setMessMenu(menuRes.menu);
      if (feeRes?.fees) setFees(feeRes.fees);
      if (alpRes?.posts) setAlumniPosts(alpRes.posts);
    } catch (err) {
      console.error('Failed to load student data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerFeedback = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleCreateGatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ gatePass: GatePass }>('/api/gatepasses', {
        method: 'POST',
        body: JSON.stringify({
          exitTime: new Date(exitTime).toISOString(),
          expectedReturnTime: new Date(expectedReturnTime).toISOString(),
          destination,
          reason: passReason
        })
      });
      triggerFeedback(`Gate pass requested (${res.gatePass.passCode}). Awaiting warden approval.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;

    try {
      await apiRequest('/api/leave', {
        method: 'POST',
        body: JSON.stringify({
          leaveType,
          fromDate,
          toDate,
          reason: leaveReason
        })
      });
      setLeaveReason('');
      triggerFeedback('Leave request submitted to department faculty.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/certificates', {
        method: 'POST',
        body: JSON.stringify({
          certificateType: certType,
          purpose: certPurpose
        })
      });
      triggerFeedback(`${certType} certificate application submitted to Registrar Office.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compSub || !compDesc) return;

    try {
      await apiRequest('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({
          category: compCat,
          subject: compSub,
          description: compDesc,
          priority: 'medium'
        })
      });
      setCompSub('');
      setCompDesc('');
      triggerFeedback('Complaint ticket generated and assigned to campus staff.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitMessFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/mess/feedback', {
        method: 'POST',
        body: JSON.stringify({
          mealType,
          rating,
          comment: feedbackComment
        })
      });
      setFeedbackComment('');
      triggerFeedback('Meal rating submitted to Campus Dining Board.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApplyOpportunity = async (postId: string) => {
    try {
      await apiRequest(`/api/alumni/posts/${postId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ note: applicantNote || 'Applying with institutional academic profile' })
      });
      setApplyPostId(null);
      setApplicantNote('');
      triggerFeedback('Applied successfully! Alumni organizer notified.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {notification && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#12313B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase bg-[#35D6E8]/20 text-[#6EEAF5] border border-[#35D6E8]/30">
              {detectBranch(user?.course, user?.department, user?.rollNumber)} Program
            </span>
            <span className="text-xs text-[#91B8C0]">
              {user?.course || (detectBranch(user?.course, user?.department, user?.rollNumber) === 'MBA' ? 'Master of Business Administration' : detectBranch(user?.course, user?.department, user?.rollNumber) === 'MCA' ? 'Master of Computer Applications' : 'Bachelor of Technology')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Academic & Campus Hub</h1>
          <p className="text-xs text-[#91B8C0] mt-0.5">
            {user?.name} · Roll No: <span className="font-mono text-[#6EEAF5]">{user?.rollNumber || 'STD-001'}</span> · {user?.department || 'Department'} · Year {user?.year || 1}, Semester {user?.semester || 1}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Campus AI</span>
          </button>
        </div>
      </div>

      {/* Low Attendance Warning Alert */}
      {attendance?.summary.isBelowThreshold && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-2xl flex items-center justify-between gap-3 text-xs animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Low Attendance Notice ({attendance.summary.percentage}%)</div>
              <div className="text-rose-200/80">
                Your cumulative attendance is below the mandatory institutional threshold of {attendance.summary.threshold}%. Please attend scheduled lectures to avoid exam debarment.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-xs text-[#91B8C0]">Overall Attendance</div>
              <div className={`text-3xl font-bold font-mono mt-1 ${attendance?.summary.isBelowThreshold ? 'text-rose-400' : 'text-[#6EEAF5]'}`}>
                {attendance?.summary.percentage ?? 100}%
              </div>
              <div className="text-[10px] text-[#91B8C0] mt-1">
                {attendance?.summary.attendedClasses}/{attendance?.summary.totalClasses} Lectures
              </div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-xs text-[#91B8C0]">Active Gate Pass</div>
              <div className="text-xl font-bold text-white font-mono mt-1 truncate">
                {gatePasses.length > 0 ? gatePasses[0].passCode : 'None'}
              </div>
              <div className="text-[10px] text-[#35D6E8] mt-1 capitalize">
                {gatePasses.length > 0 ? gatePasses[0].status : 'No Active Pass'}
              </div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-xs text-[#91B8C0]">Hostel & Room</div>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {user?.roomNumber || 'A-204'}
              </div>
              <div className="text-[10px] text-[#91B8C0] mt-1">Aryabhata Hall of Residence</div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-xs text-[#91B8C0]">Alumni Opportunities</div>
              <div className="text-3xl font-bold text-white font-mono mt-1">
                {alumniPosts.length}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">Verified Published</div>
            </div>
          </div>

          {/* Dual Column: Today's Classes & Approved Gate Pass */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#35D6E8]" /> Your Academic Classes Today
              </h3>
              <div className="space-y-2.5 text-xs">
                {timetable.slice(0, 3).map(t => (
                  <div key={t.id} className="p-3 bg-[#12313B]/50 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">{t.subjectName}</div>
                      <div className="text-[11px] text-[#91B8C0]">{t.subjectCode} · {t.roomNumber}</div>
                    </div>
                    <span className="font-mono text-[#6EEAF5] text-[11px] bg-[#081820] px-2 py-1 rounded">
                      {t.timeSlot}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#35D6E8]" /> Security Gate Pass
                </h3>
                {gatePasses.length > 0 ? (
                  <div className="p-4 bg-[#12313B]/50 rounded-xl border border-white/5 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#91B8C0]">Pass Code:</span>
                      <span className="font-mono text-white font-bold">{gatePasses[0].passCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#91B8C0]">Destination:</span>
                      <span className="text-white">{gatePasses[0].destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#91B8C0]">Status:</span>
                      <span className="font-semibold uppercase text-emerald-400">{gatePasses[0].status}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#91B8C0]">No gate passes currently requested.</p>
                )}
              </div>

              {gatePasses.length > 0 && gatePasses[0].status === 'approved' && (
                <button
                  onClick={() => setActiveModalPass(gatePasses[0])}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" /> View Digital QR Pass
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE */}
      {currentTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attendance?.subjectWise.map(s => (
              <div key={s.code} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">{s.name}</div>
                    <div className="text-[11px] text-[#35D6E8] font-mono">{s.code}</div>
                  </div>
                  <span className={`text-base font-bold font-mono ${s.percentage < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {s.percentage}%
                  </span>
                </div>
                <div className="w-full bg-[#12313B] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.percentage < 75 ? 'bg-rose-500' : 'bg-[#35D6E8]'}`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#91B8C0] text-right">
                  {s.present} attended of {s.total} sessions
                </div>
              </div>
            ))}
          </div>

          {/* History */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
              Lecture Attendance Log
            </div>
            <div className="divide-y divide-[#12313B] text-xs">
              {attendance?.history.map(h => (
                <div key={h.id} className="p-3.5 hover:bg-[#12313B]/30 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{h.subjectName} ({h.subjectCode})</div>
                    <div className="text-[11px] text-[#91B8C0]">
                      {h.date} · {h.timeSlot} · Faculty: {h.facultyName}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    h.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' :
                    h.status === 'late' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: TIMETABLE */}
      {currentTab === 'timetable' && (() => {
        const studentBranch = detectBranch(user?.course, user?.department, user?.rollNumber);
        const filteredSchedule = timetable.filter(tt => {
          if (studentBranch === 'MBA') return tt.subjectCode.startsWith('MBA') || tt.department.includes('Management');
          if (studentBranch === 'MCA') return tt.subjectCode.startsWith('MCA') || tt.department.includes('Application');
          return tt.subjectCode.startsWith('CS') || tt.department.includes('Computer') || tt.department.includes('Engineering');
        });
        const activeTimetable = filteredSchedule.length > 0 ? filteredSchedule : timetable;

        return (
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#12313B]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#35D6E8]" />
                {studentBranch} · Semester {user?.semester || 1} Lecture Schedule
              </h3>
              <span className="text-[11px] font-mono text-[#6EEAF5] bg-[#12313B] px-2.5 py-1 rounded-lg border border-white/5">
                {activeTimetable.length} Slots Scheduled
              </span>
            </div>
            <div className="divide-y divide-[#12313B] text-xs">
              {activeTimetable.map(tt => (
                <div key={tt.id} className="py-3 flex justify-between items-center hover:bg-[#12313B]/30 px-2 rounded-lg transition-colors">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{tt.subjectName}</span>
                      <span className="font-mono text-[10px] text-[#35D6E8] bg-[#12313B] px-1.5 py-0.5 rounded">
                        {tt.subjectCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#91B8C0] mt-0.5">
                      {tt.dayOfWeek} · Room: {tt.roomNumber} · Faculty: {tt.facultyName}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#6EEAF5] bg-[#12313B] px-2.5 py-1 rounded border border-white/5">
                    {tt.timeSlot}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* TAB: GATE PASS */}
      {currentTab === 'gatepasses' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateGatePass} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-[#12313B]">
              Apply for Digital QR Gate Pass
            </h3>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Destination & Purpose</label>
              <input
                type="text"
                required
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="e.g. Central Library, City Center"
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Departure Time</label>
                <input
                  type="datetime-local"
                  required
                  value={exitTime}
                  onChange={e => setExitTime(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Expected Return Time</label>
                <input
                  type="datetime-local"
                  required
                  value={expectedReturnTime}
                  onChange={e => setExpectedReturnTime(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Detailed Reason</label>
              <input
                type="text"
                required
                value={passReason}
                onChange={e => setPassReason(e.target.value)}
                placeholder="Visiting library for study materials"
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
            >
              Submit Gate Pass Application
            </button>
          </form>

          {/* List */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
              Your Requested Gate Passes
            </div>
            <div className="divide-y divide-[#12313B] text-xs">
              {gatePasses.map(gp => (
                <div key={gp.id} className="p-4 hover:bg-[#12313B]/30 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-[#35D6E8]">{gp.passCode}</span>
                      <span>{gp.destination}</span>
                    </div>
                    <div className="text-[11px] text-[#91B8C0] mt-0.5">
                      Return by: {new Date(gp.expectedReturnTime).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      gp.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      gp.status === 'used' ? 'bg-blue-500/20 text-blue-400' :
                      gp.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {gp.status}
                    </span>

                    {gp.status === 'approved' && (
                      <button
                        onClick={() => setActiveModalPass(gp)}
                        className="px-2.5 py-1 rounded bg-[#35D6E8] text-[#081820] text-xs font-bold"
                      >
                        Show QR
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: LEAVE */}
      {currentTab === 'leave' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateLeave} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-[#12313B]">
              Submit Leave Request
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as any)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="Medical">Medical</option>
                  <option value="Personal">Personal</option>
                  <option value="Family Emergency">Family Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">From Date</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">To Date</label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Specific Reason</label>
              <textarea
                required
                rows={2}
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                placeholder="State reason for absence..."
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
            >
              Submit Application
            </button>
          </form>

          {/* Leave Records List */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
              Leave Application History
            </div>
            <div className="divide-y divide-[#12313B] text-xs">
              {leaveRequests.map(lr => (
                <div key={lr.id} className="p-4 hover:bg-[#12313B]/30 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{lr.leaveType} Leave ({lr.fromDate} to {lr.toDate})</div>
                    <p className="text-[#91B8C0] text-[11px]">{lr.reason}</p>
                    {lr.comments && <p className="text-emerald-300 text-[10px] mt-0.5">Note: {lr.comments}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    lr.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    lr.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {lr.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CERTIFICATES */}
      {currentTab === 'certificates' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateCertificate} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-[#12313B]">
              Apply for Official Institutional Certificate
            </h3>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Certificate Type</label>
              <select
                value={certType}
                onChange={e => setCertType(e.target.value as any)}
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="Bonafide">Bonafide Certificate</option>
                <option value="Character">Character Certificate</option>
                <option value="Transfer">Transfer Certificate</option>
                <option value="Course Completion">Course Completion Certificate</option>
                <option value="No Objection Certificate (NOC)">No Objection Certificate (NOC)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Purpose of Certificate</label>
              <input
                type="text"
                required
                value={certPurpose}
                onChange={e => setCertPurpose(e.target.value)}
                placeholder="e.g. Passport application, Education Loan, Internship"
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
            >
              Submit Application to Registrar
            </button>
          </form>

          {/* List */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
              Certificate Requests
            </div>
            <div className="divide-y divide-[#12313B] text-xs">
              {certificates.map(c => (
                <div key={c.id} className="p-4 hover:bg-[#12313B]/30 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{c.certificateType} Certificate</div>
                    <div className="text-[11px] text-[#91B8C0]">Purpose: {c.purpose}</div>
                    {c.certificateNumber && (
                      <div className="font-mono text-emerald-400 text-[11px] mt-0.5">
                        Issued Doc: {c.certificateNumber}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    c.status === 'issued' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: HOSTEL & MESS */}
      {currentTab === 'hostel' && (
        <div className="space-y-6">
          {/* Hostel Details Card */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs">
            <h3 className="text-sm font-bold text-white mb-2">Hostel Residence Allocation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#12313B]">
              <div>
                <span className="text-[#91B8C0]">Residence Hall:</span>
                <div className="font-semibold text-white mt-0.5">Aryabhata Hall of Residence (Boys)</div>
              </div>
              <div>
                <span className="text-[#91B8C0]">Allocated Room:</span>
                <div className="font-mono font-bold text-[#35D6E8] mt-0.5">Room A-204 (2nd Floor)</div>
              </div>
              <div>
                <span className="text-[#91B8C0]">Night Curfew Time:</span>
                <div className="font-mono font-bold text-amber-300 mt-0.5">21:30 hrs</div>
              </div>
            </div>
          </div>

          {/* Dining Menu & Rating */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#35D6E8]" /> Today's Dining Hall Menu
              </h3>
              {messMenu.slice(0, 1).map(day => (
                <div key={day.dayOfWeek} className="space-y-2.5">
                  <div className="p-2.5 bg-[#12313B]/50 rounded-xl">
                    <span className="text-[#35D6E8] font-bold">Breakfast:</span>
                    <span className="text-white ml-2">{day.breakfast.join(', ')}</span>
                  </div>
                  <div className="p-2.5 bg-[#12313B]/50 rounded-xl">
                    <span className="text-[#35D6E8] font-bold">Lunch:</span>
                    <span className="text-white ml-2">{day.lunch.join(', ')}</span>
                  </div>
                  <div className="p-2.5 bg-[#12313B]/50 rounded-xl">
                    <span className="text-[#35D6E8] font-bold">Dinner:</span>
                    <span className="text-white ml-2">{day.dinner.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitMessFeedback} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-3">
              <h3 className="text-sm font-bold text-white pb-2 border-b border-[#12313B]">
                Submit Dining Feedback & Meal Rating
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#91B8C0] mb-1">Meal</label>
                  <select
                    value={mealType}
                    onChange={e => setMealType(e.target.value as any)}
                    className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#91B8C0] mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                  >
                    <option value={5}>★★★★★ (5 - Excellent)</option>
                    <option value={4}>★★★★☆ (4 - Good)</option>
                    <option value={3}>★★★☆☆ (3 - Average)</option>
                    <option value={2}>★★☆☆☆ (2 - Poor)</option>
                    <option value={1}>★☆☆☆☆ (1 - Very Bad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Feedback Comments</label>
                <input
                  type="text"
                  required
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  placeholder="Taste, hygiene, warmth, quantity..."
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
              >
                Submit Dining Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: COMPLAINTS */}
      {currentTab === 'complaints' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateComplaint} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-[#12313B]">
              Raise Campus Maintenance or Service Ticket
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Category</label>
                <select
                  value={compCat}
                  onChange={e => setCompCat(e.target.value as any)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                >
                  <option value="hostel">Hostel Living</option>
                  <option value="classroom">Classroom / Lab</option>
                  <option value="internet">Wi-Fi & Internet</option>
                  <option value="mess">Mess & Dining</option>
                  <option value="maintenance">Electrical / Plumbing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Ticket Subject</label>
                <input
                  type="text"
                  required
                  value={compSub}
                  onChange={e => setCompSub(e.target.value)}
                  placeholder="e.g. Wi-Fi dropping in Room A-204"
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Issue Details</label>
              <textarea
                required
                rows={3}
                value={compDesc}
                onChange={e => setCompDesc(e.target.value)}
                placeholder="Describe problem location and severity..."
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
            >
              Generate Ticket
            </button>
          </form>

          {/* List */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
              Your Complaints & Tickets
            </div>
            <div className="divide-y divide-[#12313B] text-xs">
              {complaints.map(c => (
                <div key={c.id} className="p-4 hover:bg-[#12313B]/30 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-[#35D6E8]">{c.ticketNumber}</span>
                      <span>{c.subject}</span>
                    </div>
                    <p className="text-[11px] text-[#91B8C0] mt-0.5">{c.description}</p>
                    {c.resolutionNotes && (
                      <p className="text-emerald-300 text-[10px] mt-0.5">Staff Note: {c.resolutionNotes}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: FEES */}
      {currentTab === 'fees' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden text-xs">
          <div className="px-5 py-3.5 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
            Verified Fee Accounts & Receipts
          </div>
          <div className="divide-y divide-[#12313B]">
            {fees.map(f => (
              <div key={f.id} className="p-4 hover:bg-[#12313B]/30 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{f.feeType} (Semester {f.semester})</div>
                  <div className="text-[11px] text-[#91B8C0]">
                    Total Amount: ₹{f.amount.toLocaleString()} · Paid: ₹{f.paidAmount.toLocaleString()} · Due: {f.dueDate}
                  </div>
                  {f.receiptNumber && (
                    <div className="font-mono text-emerald-400 text-[11px] mt-0.5">
                      Receipt #: {f.receiptNumber}
                    </div>
                  )}
                </div>
                <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                  f.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ALUMNI CAREER HUB */}
      {currentTab === 'alumni' && (
        <div className="space-y-4">
          <div className="bg-[#0D222B] p-4 rounded-2xl border border-[#12313B] text-xs">
            <h3 className="text-sm font-bold text-white">Alumni Placement & Workshop Opportunities</h3>
            <p className="text-[11px] text-[#91B8C0]">Exclusive career tracks, internships, and masterclasses hosted by campus alumni</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alumniPosts.map(p => {
              const alreadyApplied = p.applicants.some(a => a.studentId === user?.id);

              return (
                <div key={p.id} className="bg-[#0D222B] border border-[#12313B] hover:border-[#35D6E8]/40 rounded-2xl p-5 text-xs flex flex-col justify-between transition-colors">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#35D6E8]/10 text-[#35D6E8] font-bold">
                        {p.type}
                      </span>
                      <span className="text-[11px] text-[#91B8C0]">Deadline: {p.deadline}</span>
                    </div>

                    <h3 className="font-bold text-white text-sm">{p.title}</h3>
                    <p className="text-[#91B8C0]">
                      Organized by <span className="text-white font-medium">{p.alumniName}</span> ({p.company})
                    </p>
                    <p className="text-[#D9F7FA] leading-relaxed">{p.description}</p>

                    {p.stipendOrSalary && (
                      <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                        Stipend: {p.stipendOrSalary}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#12313B]">
                    {alreadyApplied ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Application Submitted
                      </span>
                    ) : applyPostId === p.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={applicantNote}
                          onChange={e => setApplicantNote(e.target.value)}
                          placeholder="Brief message to alumni mentor..."
                          className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2 text-xs text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApplyOpportunity(p.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
                          >
                            Send Application
                          </button>
                          <button
                            onClick={() => setApplyPostId(null)}
                            className="px-3 py-1.5 rounded-lg bg-[#12313B] text-[#91B8C0] text-xs hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setApplyPostId(p.id)}
                        className="py-2 px-4 rounded-xl bg-[#12313B] hover:bg-[#35D6E8] text-[#D9F7FA] hover:text-[#081820] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 w-full"
                      >
                        Apply / Register
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Pass Modal */}
      {activeModalPass && (
        <QRPassModal
          pass={activeModalPass}
          onClose={() => setActiveModalPass(null)}
        />
      )}
    </div>
  );
};
