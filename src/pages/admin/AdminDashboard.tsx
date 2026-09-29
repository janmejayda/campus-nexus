import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  LiveStats,
  User,
  LeaveRequest,
  GatePass,
  CertificateRequest,
  Complaint,
  Notice,
  Hostel,
  FeeRecord,
  AlumniPost,
  AttendanceRecord,
  TimetableEntry,
  GateActivity,
  StudentBranch,
  detectBranch
} from '../../types';
import { HostelManagementView } from '../../components/HostelManagementView';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  FileCheck,
  QrCode,
  Building2,
  UtensilsCrossed,
  AlertCircle,
  Megaphone,
  CreditCard,
  Briefcase,
  Sliders,
  Download,
  Search,
  Check,
  X,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  UserPlus
} from 'lucide-react';

interface AdminDashboardProps {
  currentTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentTab }) => {
  const { user } = useAuth();

  // State for all data slices
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [activity, setActivity] = useState<Array<{ id: string; time: string; message: string; type: string }>>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('');

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [certificates, setCertificates] = useState<CertificateRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [alumniPosts, setAlumniPosts] = useState<AlumniPost[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [gateActivity, setGateActivity] = useState<GateActivity[]>([]);

  // Settings
  const [thresholdInput, setThresholdInput] = useState<number>(75);
  const [resolutionDaysInput, setResolutionDaysInput] = useState<number>(3);
  const [curfewTimeInput, setCurfewTimeInput] = useState<string>('21:30');

  // Loading & Action states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Notice Modal / Form state
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');
  const [noticeCategory, setNoticeCategory] = useState<string>('academic');
  const [noticeAudience, setNoticeAudience] = useState<string>('all');

  // New Timetable Slot state
  const [ttDept, setTtDept] = useState<string>('Computer Science & Engineering');
  const [ttSem, setTtSem] = useState<number>(5);
  const [ttDay, setTtDay] = useState<string>('Monday');
  const [ttTime, setTtTime] = useState<string>('09:00 - 10:00');
  const [ttSubCode, setTtSubCode] = useState<string>('CS506');
  const [ttSubName, setTtSubName] = useState<string>('Operating Systems Internals');
  const [ttRoom, setTtRoom] = useState<string>('LH 201');
  const [ttFacultyName, setTtFacultyName] = useState<string>('Prof. Ananya Sharma');

  // New User Form state
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserPass, setNewUserPass] = useState<string>('Nexus@123');
  const [newUserRole, setNewUserRole] = useState<string>('student');
  const [newUserDept, setNewUserDept] = useState<string>('Computer Science & Engineering');
  const [newUserIdField, setNewUserIdField] = useState<string>('');
  const [adminBranchFilter, setAdminBranchFilter] = useState<'all' | StudentBranch>('all');

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        apiRequest<LiveStats>('/api/live/stats'),
        apiRequest<{ events: any[] }>('/api/live/activity'),
        apiRequest<{ users: User[] }>('/api/admin/users'),
        apiRequest<{ leaveRequests: LeaveRequest[] }>('/api/leave'),
        apiRequest<{ gatePasses: GatePass[] }>('/api/gatepasses'),
        apiRequest<{ certificates: CertificateRequest[] }>('/api/certificates'),
        apiRequest<{ complaints: Complaint[] }>('/api/complaints'),
        apiRequest<{ notices: Notice[] }>('/api/notices'),
        apiRequest<{ hostels: Hostel[] }>('/api/hostels'),
        apiRequest<{ fees: FeeRecord[] }>('/api/fees'),
        apiRequest<{ posts: AlumniPost[] }>('/api/alumni/posts'),
        apiRequest<{ sessions: AttendanceRecord[] }>('/api/attendance/my'),
        apiRequest<{ timetable: TimetableEntry[] }>('/api/timetable'),
        apiRequest<{ activity: GateActivity[] }>('/api/gatepasses/activity')
      ]);

      const getVal = <T,>(res: PromiseSettledResult<T>): T | null =>
        res.status === 'fulfilled' ? res.value : null;

      const statsRes = getVal<LiveStats>(results[0]);
      const activityRes = getVal<{ events: any[] }>(results[1]);
      const usersRes = getVal<{ users: User[] }>(results[2]);
      const leaveRes = getVal<{ leaveRequests: LeaveRequest[] }>(results[3]);
      const passesRes = getVal<{ gatePasses: GatePass[] }>(results[4]);
      const certsRes = getVal<{ certificates: CertificateRequest[] }>(results[5]);
      const complaintsRes = getVal<{ complaints: Complaint[] }>(results[6]);
      const noticesRes = getVal<{ notices: Notice[] }>(results[7]);
      const hostelsRes = getVal<{ hostels: Hostel[] }>(results[8]);
      const feesRes = getVal<{ fees: FeeRecord[] }>(results[9]);
      const alumniRes = getVal<{ posts: AlumniPost[] }>(results[10]);
      const attendanceRes = getVal<{ sessions: AttendanceRecord[] }>(results[11]);
      const timetableRes = getVal<{ timetable: TimetableEntry[] }>(results[12]);
      const gateActRes = getVal<{ activity: GateActivity[] }>(results[13]);

      if (statsRes) {
        setStats(statsRes);
        if (statsRes.settings) {
          setThresholdInput(statsRes.settings.attendanceWarningThreshold);
          setResolutionDaysInput(statsRes.settings.complaintResolutionTargetDays);
          setCurfewTimeInput(statsRes.settings.curfewTime || '21:30');
        }
      }
      if (activityRes?.events) setActivity(activityRes.events);
      if (usersRes?.users) setUsersList(usersRes.users);
      if (leaveRes?.leaveRequests) setLeaveRequests(leaveRes.leaveRequests);
      if (passesRes?.gatePasses) setGatePasses(passesRes.gatePasses);
      if (certsRes?.certificates) setCertificates(certsRes.certificates);
      if (complaintsRes?.complaints) setComplaints(complaintsRes.complaints);
      if (noticesRes?.notices) setNotices(noticesRes.notices);
      if (hostelsRes?.hostels) setHostels(hostelsRes.hostels);
      if (feesRes?.fees) setFees(feesRes.fees);
      if (alumniRes?.posts) setAlumniPosts(alumniRes.posts);
      if (attendanceRes?.sessions) setAttendanceSessions(attendanceRes.sessions);
      if (timetableRes?.timetable) setTimetable(timetableRes.timetable);
      if (gateActRes?.activity) setGateActivity(gateActRes.activity);
      setLoadError(null);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const triggerFeedback = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
    loadAllData();
  };

  // User Actions
  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      triggerFeedback(`User account status updated to ${newStatus}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      triggerFeedback(`User role changed to ${newRole}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPass,
          role: newUserRole,
          department: newUserDept,
          rollNumber: newUserRole === 'student' ? newUserIdField : undefined,
          staffId: ['faculty', 'security', 'warden', 'admin'].includes(newUserRole) ? newUserIdField : undefined
        })
      });
      setShowAddUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserIdField('');
      triggerFeedback('New institutional user provisioned successfully.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Leave Actions
  const handleLeaveDecision = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await apiRequest(`/api/leave/${leaveId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, comments: `Processed by Administrator` })
      });
      triggerFeedback(`Leave request marked as ${status}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Gate Pass Actions
  const handlePassDecision = async (passId: string, status: 'approved' | 'rejected') => {
    try {
      await apiRequest(`/api/gatepasses/${passId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      triggerFeedback(`Gate pass ${status}. Student notified.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Certificate Actions
  const handleCertificateStatus = async (certId: string, status: 'issued' | 'rejected') => {
    try {
      await apiRequest(`/api/certificates/${certId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes: `Verified by Registrar Office` })
      });
      triggerFeedback(`Certificate status updated to ${status}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Alumni Post Actions
  const handleAlumniPostStatus = async (postId: string, status: 'approved' | 'rejected') => {
    try {
      await apiRequest(`/api/alumni/posts/${postId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      triggerFeedback(`Alumni opportunity marked as ${status}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Publish Notice Action
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    try {
      await apiRequest('/api/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          category: noticeCategory,
          targetAudience: noticeAudience,
          isPinned: true
        })
      });
      setNoticeTitle('');
      setNoticeContent('');
      triggerFeedback('Campus bulletin published successfully to selected recipients.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Timetable Slot with Clash Detection
  const handleAddTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/timetable', {
        method: 'POST',
        body: JSON.stringify({
          department: ttDept,
          semester: ttSem,
          dayOfWeek: ttDay,
          timeSlot: ttTime,
          subjectCode: ttSubCode,
          subjectName: ttSubName,
          roomNumber: ttRoom,
          facultyName: ttFacultyName
        })
      });
      triggerFeedback('Timetable slot registered without conflict.');
    } catch (err: any) {
      alert(err.message); // Displays clash error directly
    }
  };

  // Save Institutional Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          attendanceWarningThreshold: thresholdInput,
          complaintResolutionTargetDays: resolutionDaysInput,
          curfewTime: curfewTimeInput
        })
      });
      triggerFeedback('Institutional operational rules updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtered Users List
  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.staffId && u.staffId.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.course && u.course.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = !userRoleFilter || u.role === userRoleFilter;
    const matchesStatus = !userStatusFilter || u.status === userStatusFilter;

    if (adminBranchFilter !== 'all' && u.role === 'student') {
      const b = detectBranch(u.course, u.department, u.rollNumber);
      if (b !== adminBranchFilter) return false;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center justify-between animate-fade-in shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {actionMessage}
          </span>
          <button onClick={() => setActionMessage(null)}>
            <X className="w-4 h-4 text-emerald-400 hover:text-white" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#12313B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Control Center</h1>
            <span className="text-[11px] font-mono text-[#35D6E8] bg-[#35D6E8]/10 px-2 py-0.5 rounded border border-[#35D6E8]/20">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-xs text-[#91B8C0] mt-0.5">
            Supervisory overview of institutional operations, RBAC directory, academic records, and security perimeter
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#12313B] hover:bg-[#1a4452] text-xs font-semibold text-[#D9F7FA] border border-white/5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#35D6E8] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live DB</span>
          </button>

          <a
            href="/api/reports/export/users"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#35D6E8]/10 hover:bg-[#35D6E8]/20 text-xs font-semibold text-[#35D6E8] border border-[#35D6E8]/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export User Directory</span>
          </a>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & CONTROL CENTER */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-[11px] text-[#91B8C0] font-medium">Total Students</div>
              <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
                {stats?.users.totalStudents ?? 0}
              </div>
              <div className="text-[10px] text-[#35D6E8] mt-1">Active Enrolled</div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-[11px] text-[#91B8C0] font-medium">Faculty & Staff</div>
              <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
                {(stats?.users.totalFaculty ?? 0) + (stats?.users.totalSecurity ?? 0) + (stats?.users.totalWardens ?? 0)}
              </div>
              <div className="text-[10px] text-[#91B8C0] mt-1">
                {stats?.users.totalFaculty} Fac · {stats?.users.totalSecurity} Sec · {stats?.users.totalWardens} Wrd
              </div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-[11px] text-[#91B8C0] font-medium">Pending Gate Passes</div>
              <div className="text-2xl font-bold text-amber-300 font-mono mt-1 tabular-nums">
                {stats?.operations.pendingGatePasses ?? 0}
              </div>
              <div className="text-[10px] text-amber-400 mt-1">Requires Approval</div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-[11px] text-[#91B8C0] font-medium">Pending Leaves</div>
              <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
                {stats?.operations.pendingLeaves ?? 0}
              </div>
              <div className="text-[10px] text-[#91B8C0] mt-1">Awaiting Review</div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-[11px] text-[#91B8C0] font-medium">Open Complaints</div>
              <div className="text-2xl font-bold text-rose-300 font-mono mt-1 tabular-nums">
                {stats?.operations.openComplaints ?? 0}
              </div>
              <div className="text-[10px] text-rose-400 mt-1">Target: 3 Days</div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-4">
              <div className="text-[11px] text-[#91B8C0] font-medium">Hostel Occupancy</div>
              <div className="text-2xl font-bold text-[#6EEAF5] font-mono mt-1 tabular-nums">
                {stats?.operations.hostelOccupancyPercent ?? 0}%
              </div>
              <div className="text-[10px] text-[#91B8C0] mt-1">
                {stats?.operations.occupiedBeds ?? 0}/{stats?.operations.totalBeds ?? 0} Beds
              </div>
            </div>
          </div>

          {/* Pending Registrations Notice */}
          {stats?.users.pendingRegistrations ? (
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">
                    {stats.users.pendingRegistrations} Staff Registration(s) Pending Administrative Approval
                  </div>
                  <div className="text-amber-200/80">
                    Faculty, security, and warden self-registrations require your activation before they can log in.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setUserStatusFilter('pending')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#081820] font-bold text-xs transition-colors shrink-0"
              >
                Review Registrations
              </button>
            </div>
          ) : null}

          {/* Dual Panel: Real-Time Activity Feed & Recent Gate Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Campus Event Stream */}
            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#12313B] mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#35D6E8]" />
                  <h3 className="text-sm font-bold text-white">Live Institutional Activity Stream</h3>
                </div>
                <span className="text-[11px] text-[#91B8C0] font-mono">Real-Time DB Sync</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
                {activity.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#66848C]">No recent events</div>
                ) : (
                  activity.map(evt => (
                    <div
                      key={evt.id}
                      className="p-3 bg-[#12313B]/50 hover:bg-[#12313B] rounded-xl border border-white/5 text-xs flex items-start justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="text-white font-medium">{evt.message}</div>
                        <div className="text-[10px] text-[#91B8C0] font-mono mt-0.5">
                          {new Date(evt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                        evt.type === 'entry' ? 'bg-emerald-500/20 text-emerald-400' :
                        evt.type === 'exit' ? 'bg-amber-500/20 text-amber-400' :
                        evt.type === 'complaint' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {evt.type}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Perimeter Gate Audit */}
            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#12313B] mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#35D6E8]" />
                  <h3 className="text-sm font-bold text-white">Gate Perimeter Verification Log</h3>
                </div>
                <span className="text-[11px] text-[#91B8C0] font-mono">Latest Scans</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
                {gateActivity.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#66848C]">No gate movements recorded yet</div>
                ) : (
                  gateActivity.slice(0, 10).map(ga => (
                    <div
                      key={ga.id}
                      className="p-3 bg-[#12313B]/50 hover:bg-[#12313B] rounded-xl border border-white/5 text-xs flex items-center justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          <span>{ga.studentName}</span>
                          <span className="text-[#91B8C0] font-mono text-[11px]">({ga.rollNumber})</span>
                        </div>
                        <div className="text-[11px] text-[#91B8C0]">
                          Pass: <span className="font-mono text-[#6EEAF5]">{ga.passCode}</span> · {ga.gateNumber} by {ga.securityStaffName}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          ga.action === 'entry' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ga.action}
                        </span>
                        <div className="text-[10px] text-[#66848C] font-mono mt-1">
                          {new Date(ga.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & ROLE MANAGEMENT */}
      {currentTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search Bar */}
              <div className="relative min-w-[220px] flex-1">
                <Search className="w-4 h-4 text-[#66848C] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, roll number, staff ID..."
                  className="w-full bg-[#12313B] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                />
              </div>

              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="bg-[#12313B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#35D6E8]"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="security">Security</option>
                <option value="warden">Warden</option>
                <option value="admin">Administrator</option>
                <option value="alumni">Alumni</option>
              </select>

              {/* Status Filter */}
              <select
                value={userStatusFilter}
                onChange={e => setUserStatusFilter(e.target.value)}
                className="bg-[#12313B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#35D6E8]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending Approval</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Student Branch Filter */}
              <select
                value={adminBranchFilter}
                onChange={e => setAdminBranchFilter(e.target.value as any)}
                className="bg-[#12313B] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#6EEAF5] focus:outline-none focus:border-[#35D6E8]"
              >
                <option value="all">All Branches</option>
                <option value="B.Tech">B.Tech Students</option>
                <option value="MBA">MBA Students</option>
                <option value="MCA">MCA Students</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="px-3.5 py-2 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision User</span>
            </button>
          </div>

          {/* Provision New User Modal/Panel */}
          {showAddUser && (
            <form onSubmit={handleCreateUser} className="bg-[#0D222B] border border-[#35D6E8]/30 rounded-2xl p-5 text-xs animate-fade-in space-y-4">
              <div className="font-bold text-sm text-white flex items-center justify-between pb-2 border-b border-[#12313B]">
                <span>Provision New Institutional User</span>
                <button type="button" onClick={() => setShowAddUser(false)}>
                  <X className="w-4 h-4 text-[#91B8C0]" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#91B8C0] mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="e.g. Prof. Arvind Mehta"
                    className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#91B8C0] mb-1">Campus Email</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="arvind.mehta@campusnexus.edu"
                    className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#91B8C0] mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={newUserPass}
                    onChange={e => setNewUserPass(e.target.value)}
                    className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#91B8C0] mb-1">Assigned Institutional Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="security">Security</option>
                    <option value="warden">Warden</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#91B8C0] mb-1">Roll Number or Staff ID</label>
                  <input
                    type="text"
                    value={newUserIdField}
                    onChange={e => setNewUserIdField(e.target.value)}
                    placeholder="e.g. STF-CSE-088 or CSE-2024-001"
                    className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#91B8C0] mb-1">Academic Department</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={e => setNewUserDept(e.target.value)}
                    className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#12313B] text-xs text-[#91B8C0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          )}

          {/* User Table */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#081820] text-[#91B8C0] border-b border-[#12313B]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">User Profile</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Identifier</th>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#12313B] text-[#D9F7FA]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#66848C]">
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const uBranch = u.role === 'student' ? detectBranch(u.course, u.department, u.rollNumber) : null;
                      return (
                        <tr key={u.id} className="hover:bg-[#12313B]/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {uBranch && (
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                  uBranch === 'MBA' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                  uBranch === 'MCA' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                  'bg-[#35D6E8]/20 text-[#6EEAF5] border border-[#35D6E8]/30'
                                }`}>
                                  {uBranch}
                                </span>
                              )}
                              <span>{u.name}</span>
                            </div>
                            <div className="text-[11px] text-[#91B8C0]">{u.email}</div>
                          </td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={e => handleUpdateUserRole(u.id, e.target.value)}
                            className="bg-[#12313B] border border-white/10 rounded px-2 py-1 text-xs text-white capitalize focus:border-[#35D6E8]"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="security">Security</option>
                            <option value="warden">Warden</option>
                            <option value="alumni">Alumni</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#6EEAF5]">
                          {u.rollNumber || u.staffId || '—'}
                        </td>
                        <td className="py-3 px-4 text-[#91B8C0]">
                          {u.department || 'Institutional General'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                            u.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {u.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'active')}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                            >
                              Approve
                            </button>
                          )}
                          {u.status === 'active' && u.id !== user?.id && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'inactive')}
                              className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs"
                            >
                              Deactivate
                            </button>
                          )}
                          {u.status === 'inactive' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'active')}
                              className="px-2.5 py-1 rounded bg-[#12313B] text-[#35D6E8] hover:bg-[#1a4452] text-xs"
                            >
                              Re-activate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE MANAGEMENT */}
      {currentTab === 'attendance' && (
        <div className="space-y-5">
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Campus Attendance Configuration</h3>
                <p className="text-xs text-[#91B8C0]">Configured threshold for low-attendance alerts across all departments</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#91B8C0]">Warning Threshold:</span>
                <span className="text-base font-bold font-mono text-[#35D6E8]">{thresholdInput}%</span>
                <a
                  href="/api/reports/export/attendance"
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12313B] text-xs text-[#D9F7FA] border border-white/5 hover:bg-[#1a4452]"
                >
                  <Download className="w-3.5 h-3.5 text-[#35D6E8]" /> Export CSV
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recorded Class Attendance Sessions</h3>
              <span className="text-xs text-[#91B8C0]">{attendanceSessions.length} Sessions Logged</span>
            </div>

            <div className="divide-y divide-[#12313B]">
              {attendanceSessions.map(session => (
                <div key={session.id} className="p-4 hover:bg-[#12313B]/30 transition-colors text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {session.subjectName} ({session.subjectCode})
                      </div>
                      <div className="text-[11px] text-[#91B8C0]">
                        Faculty: {session.facultyName} · Date: {session.date} · {session.timeSlot}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px]">
                        Present: {session.studentRecords.filter(r => r.status === 'present').length}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[11px]">
                        Absent: {session.studentRecords.filter(r => r.status === 'absent').length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TIMETABLE MANAGEMENT */}
      {currentTab === 'timetable' && (
        <div className="space-y-6">
          {/* Add Slot Form */}
          <form onSubmit={handleAddTimetableSlot} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4">
            <div className="pb-2 border-b border-[#12313B]">
              <h3 className="text-sm font-bold text-white">Add Lecture Slot (With Collision Detection)</h3>
              <p className="text-[11px] text-[#91B8C0]">Prevents double-booking of lecture halls and faculty simultaneously</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Day of Week</label>
                <select
                  value={ttDay}
                  onChange={e => setTtDay(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Time Window</label>
                <select
                  value={ttTime}
                  onChange={e => setTtTime(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white font-mono"
                >
                  <option value="09:00 - 10:00">09:00 - 10:00</option>
                  <option value="10:15 - 11:15">10:15 - 11:15</option>
                  <option value="11:30 - 12:30">11:30 - 12:30</option>
                  <option value="14:00 - 15:00">14:00 - 15:00</option>
                  <option value="15:15 - 16:15">15:15 - 16:15</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Classroom / Lab</label>
                <input
                  type="text"
                  required
                  value={ttRoom}
                  onChange={e => setTtRoom(e.target.value)}
                  placeholder="e.g. LH 302"
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Assigned Faculty</label>
                <input
                  type="text"
                  required
                  value={ttFacultyName}
                  onChange={e => setTtFacultyName(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={ttSubCode}
                  onChange={e => setTtSubCode(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-[#91B8C0] mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={ttSubName}
                  onChange={e => setTtSubName(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5] transition-colors"
            >
              Verify & Add Timetable Slot
            </button>
          </form>

          {/* Current Timetable List */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] font-bold text-xs text-white uppercase tracking-wider">
              Configured Institutional Timetable Entries
            </div>
            <div className="divide-y divide-[#12313B]">
              {timetable.map(tt => (
                <div key={tt.id} className="p-4 hover:bg-[#12313B]/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">
                      {tt.subjectName} ({tt.subjectCode})
                    </div>
                    <div className="text-[11px] text-[#91B8C0]">
                      {tt.dayOfWeek} · <span className="font-mono text-[#6EEAF5]">{tt.timeSlot}</span> · {tt.roomNumber} · Faculty: {tt.facultyName}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await apiRequest(`/api/timetable/${tt.id}`, { method: 'DELETE' });
                      triggerFeedback('Slot removed.');
                    }}
                    className="p-1.5 rounded text-[#91B8C0] hover:text-rose-400 hover:bg-[#12313B]"
                    title="Remove Slot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LEAVE REQUESTS */}
      {currentTab === 'leave' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#12313B] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Student Leave Applications</h3>
            <span className="text-xs text-[#91B8C0]">{leaveRequests.length} Total Records</span>
          </div>

          <div className="divide-y divide-[#12313B]">
            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#66848C]">No leave requests on file.</div>
            ) : (
              leaveRequests.map(lr => (
                <div key={lr.id} className="p-4 hover:bg-[#12313B]/40 text-xs transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{lr.studentName}</span>
                        <span className="font-mono text-[11px] text-[#35D6E8]">({lr.rollNumber})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#12313B] text-[#91B8C0]">
                          {lr.leaveType}
                        </span>
                      </div>
                      <p className="text-xs text-[#D9F7FA] mt-1">{lr.reason}</p>
                      <div className="text-[11px] text-[#91B8C0] mt-1">
                        Duration: <span className="font-mono text-white">{lr.fromDate}</span> to <span className="font-mono text-white">{lr.toDate}</span>
                        {lr.reviewerName && ` · Decision by: ${lr.reviewerName}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        lr.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        lr.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {lr.status}
                      </span>

                      {lr.status === 'pending' && (
                        <div className="flex gap-1.5 ml-2">
                          <button
                            onClick={() => handleLeaveDecision(lr.id, 'approved')}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveDecision(lr.id, 'rejected')}
                            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: GATE PASS AUDITS */}
      {currentTab === 'gatepasses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0D222B] p-4 border border-[#12313B] rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white">Campus Gate Passes Management</h3>
              <p className="text-xs text-[#91B8C0]">Review and authorize student movement requests</p>
            </div>
            <a
              href="/api/reports/export/gatepasses"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12313B] text-xs text-[#D9F7FA] border border-white/5 hover:bg-[#1a4452]"
            >
              <Download className="w-3.5 h-3.5 text-[#35D6E8]" /> Export CSV
            </a>
          </div>

          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="divide-y divide-[#12313B]">
              {gatePasses.map(gp => (
                <div key={gp.id} className="p-4 hover:bg-[#12313B]/30 text-xs transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="font-mono text-[#35D6E8]">{gp.passCode}</span>
                        <span>{gp.studentName}</span>
                        <span className="text-[#91B8C0]">({gp.rollNumber})</span>
                      </div>
                      <p className="text-xs text-[#D9F7FA] mt-1">Destination: <span className="font-semibold text-white">{gp.destination}</span></p>
                      <p className="text-[11px] text-[#91B8C0]">Reason: {gp.reason}</p>
                      <div className="text-[11px] text-[#6EEAF5] font-mono mt-1">
                        Exit: {new Date(gp.exitTime).toLocaleString()} · Expected Return: {new Date(gp.expectedReturnTime).toLocaleString()}
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
                            onClick={() => handlePassDecision(gp.id, 'approved')}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePassDecision(gp.id, 'rejected')}
                            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CERTIFICATES PROCESSING */}
      {currentTab === 'certificates' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#12313B] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Official Certificate Applications</h3>
            <span className="text-xs text-[#91B8C0]">{certificates.length} Applications</span>
          </div>

          <div className="divide-y divide-[#12313B]">
            {certificates.map(cert => (
              <div key={cert.id} className="p-4 hover:bg-[#12313B]/30 text-xs transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-[#35D6E8]">{cert.certificateType} Certificate</span>
                      <span>· {cert.studentName} ({cert.rollNumber})</span>
                    </div>
                    <p className="text-xs text-[#91B8C0] mt-1">Purpose: {cert.purpose}</p>
                    {cert.certificateNumber && (
                      <div className="text-[11px] text-emerald-400 font-mono mt-1">
                        Issued Doc #: {cert.certificateNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      cert.status === 'issued' ? 'bg-emerald-500/20 text-emerald-400' :
                      cert.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {cert.status}
                    </span>

                    {cert.status === 'pending' && (
                      <div className="flex gap-1.5 ml-2">
                        <button
                          onClick={() => handleCertificateStatus(cert.id, 'issued')}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                        >
                          Issue & Sign
                        </button>
                        <button
                          onClick={() => handleCertificateStatus(cert.id, 'rejected')}
                          className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: HOSTEL HOUSING & BEDS */}
      {currentTab === 'hostels' && (
        <HostelManagementView userRole="admin" userName={user?.name} />
      )}

      {/* TAB 9: COMPLAINTS & TICKETS */}
      {currentTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0D222B] p-4 border border-[#12313B] rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white">Student & Campus Maintenance Complaints</h3>
              <p className="text-xs text-[#91B8C0]">Assigned tracking, SLA target resolution, and closure verification</p>
            </div>
            <a
              href="/api/reports/export/complaints"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12313B] text-xs text-[#D9F7FA] border border-white/5 hover:bg-[#1a4452]"
            >
              <Download className="w-3.5 h-3.5 text-[#35D6E8]" /> Export CSV
            </a>
          </div>

          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="divide-y divide-[#12313B]">
              {complaints.map(c => (
                <div key={c.id} className="p-4 hover:bg-[#12313B]/30 text-xs transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#35D6E8] font-bold">{c.ticketNumber}</span>
                        <span className="font-semibold text-white">{c.subject}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#12313B] text-[#91B8C0]">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#D9F7FA] mt-1">{c.description}</p>
                      <div className="text-[11px] text-[#91B8C0] mt-1">
                        Reported by: {c.studentName} ({c.rollNumber}) · Target Date: <span className="font-mono text-white">{c.resolutionTargetDate}</span>
                        {c.resolutionNotes && ` · Notes: ${c.resolutionNotes}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={c.status}
                        onChange={async e => {
                          await apiRequest(`/api/complaints/${c.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ status: e.target.value, resolutionNotes: 'Status updated by administrator' })
                          });
                          triggerFeedback(`Ticket ${c.ticketNumber} updated to ${e.target.value}.`);
                        }}
                        className="bg-[#12313B] border border-white/10 rounded px-2.5 py-1 text-xs text-white capitalize"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: NOTICES & ANNOUNCEMENTS */}
      {currentTab === 'notices' && (
        <div className="space-y-6">
          <form onSubmit={handlePublishNotice} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4">
            <div className="pb-2 border-b border-[#12313B]">
              <h3 className="text-sm font-bold text-white">Broadcast Official Notice</h3>
              <p className="text-[11px] text-[#91B8C0]">Announcements propagate immediately to student and faculty portals</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-[#91B8C0] mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Schedule for Annual Tech Symposium & Hackathon"
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Target Audience</label>
                <select
                  value={noticeAudience}
                  onChange={e => setNoticeAudience(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="all">Everyone on Campus</option>
                  <option value="students">Students Only</option>
                  <option value="faculty">Faculty Members Only</option>
                  <option value="hostelers">Hostel Residents Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#91B8C0] mb-1">Detailed Content</label>
              <textarea
                required
                rows={3}
                value={noticeContent}
                onChange={e => setNoticeContent(e.target.value)}
                placeholder="Full notice text, guidelines, or instructions..."
                className="w-full bg-[#12313B] border border-white/10 rounded-lg p-3 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5] transition-colors"
            >
              Publish Campus Announcement
            </button>
          </form>

          {/* Published List */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
              Published Bulletins
            </div>
            <div className="divide-y divide-[#12313B]">
              {notices.map(n => (
                <div key={n.id} className="p-4 hover:bg-[#12313B]/30 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{n.title}</div>
                    <p className="text-xs text-[#D9F7FA] mt-1">{n.content}</p>
                    <div className="text-[11px] text-[#91B8C0] mt-1">
                      Audience: {n.targetAudience.toUpperCase()} · Published by: {n.publishedByName} · {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await apiRequest(`/api/notices/${n.id}`, { method: 'DELETE' });
                      triggerFeedback('Notice deleted.');
                    }}
                    className="p-1.5 rounded text-[#91B8C0] hover:text-rose-400 hover:bg-[#12313B]"
                    title="Delete Notice"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: FEE ACCOUNTS */}
      {currentTab === 'fees' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#12313B] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Institutional Fee Ledgers</h3>
              <p className="text-[11px] text-[#91B8C0]">Verified transaction receipts and semester dues</p>
            </div>
            <span className="text-xs text-[#91B8C0]">{fees.length} Total Ledgers</span>
          </div>

          <div className="divide-y divide-[#12313B]">
            {fees.map(fee => (
              <div key={fee.id} className="p-4 hover:bg-[#12313B]/30 text-xs flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white">
                    {fee.studentName} ({fee.rollNumber}) · <span className="text-[#35D6E8]">{fee.feeType}</span>
                  </div>
                  <div className="text-[11px] text-[#91B8C0]">
                    Total Amount: ₹{fee.amount.toLocaleString()} · Paid: ₹{fee.paidAmount.toLocaleString()} · Due: {fee.dueDate}
                  </div>
                  {fee.receiptNumber && (
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      Verified Receipt: {fee.receiptNumber}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    fee.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                    fee.status === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {fee.status}
                  </span>

                  {fee.status !== 'paid' && (
                    <button
                      onClick={async () => {
                        await apiRequest('/api/fees/record-payment', {
                          method: 'POST',
                          body: JSON.stringify({ feeId: fee.id, paidAmount: fee.amount - fee.paidAmount })
                        });
                        triggerFeedback(`Full payment recorded for ${fee.studentName}.`);
                      }}
                      className="px-2.5 py-1 rounded bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] font-bold text-xs"
                    >
                      Record Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 12: ALUMNI OPPORTUNITIES */}
      {currentTab === 'alumni' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#12313B] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Alumni Opportunities Moderation</h3>
            <span className="text-xs text-[#91B8C0]">{alumniPosts.length} Submissions</span>
          </div>

          <div className="divide-y divide-[#12313B]">
            {alumniPosts.map(post => (
              <div key={post.id} className="p-4 hover:bg-[#12313B]/30 text-xs transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#35D6E8]/10 text-[#35D6E8] font-bold">
                        {post.type}
                      </span>
                      <span className="font-bold text-white text-sm">{post.title}</span>
                    </div>
                    <p className="text-xs text-[#91B8C0] mt-1">
                      Posted by: <span className="text-white font-semibold">{post.alumniName}</span> ({post.company}) · Deadline: {post.deadline}
                    </p>
                    <p className="text-xs text-[#D9F7FA] mt-1">{post.description}</p>
                    <div className="text-[11px] text-[#6EEAF5] mt-1">
                      Applicants: {post.applicants.length} student(s) applied
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      post.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      post.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {post.status}
                    </span>

                    {post.status === 'pending' && (
                      <div className="flex gap-1.5 ml-2">
                        <button
                          onClick={() => handleAlumniPostStatus(post.id, 'approved')}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                        >
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleAlumniPostStatus(post.id, 'rejected')}
                          className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 13: SYSTEM CONFIGURATION */}
      {currentTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-6 text-xs space-y-5 max-w-2xl">
          <div className="pb-3 border-b border-[#12313B]">
            <h3 className="text-sm font-bold text-white">Institutional System Configuration</h3>
            <p className="text-[11px] text-[#91B8C0]">Define campus threshold rules, resolution SLAs, and security curfews</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#91B8C0] mb-1">
                Attendance Warning Threshold Percentage
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={thresholdInput}
                  onChange={e => setThresholdInput(Number(e.target.value))}
                  className="w-32 bg-[#12313B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
                <span className="text-[#91B8C0] text-xs">Students falling below this percentage receive automatic academic warnings</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91B8C0] mb-1">
                Complaint Resolution Target Window (Days)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={resolutionDaysInput}
                onChange={e => setResolutionDaysInput(Number(e.target.value))}
                className="w-32 bg-[#12313B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91B8C0] mb-1">
                Hostel Night Curfew Time
              </label>
              <input
                type="text"
                value={curfewTimeInput}
                onChange={e => setCurfewTimeInput(e.target.value)}
                placeholder="21:30"
                className="w-32 bg-[#12313B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5] transition-colors"
          >
            Save Institutional Settings
          </button>
        </form>
      )}
    </div>
  );
};
