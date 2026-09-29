import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  AttendanceRecord,
  TimetableEntry,
  LeaveRequest,
  Notice,
  User
} from '../../types';
import {
  CalendarCheck,
  CalendarDays,
  FileCheck,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Clock,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';

interface FacultyDashboardProps {
  currentTab: string;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ currentTab }) => {
  const { user } = useAuth();

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [students, setStudents] = useState<Array<{ studentId: string; studentName: string; rollNumber: string }>>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceRecord[]>([]);

  // Attendance Marking State
  const [selectedSubject, setSelectedSubject] = useState<{ code: string; name: string }>({
    code: 'CS501',
    name: 'Distributed Systems & Cloud Computing'
  });
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState<string>('09:00 - 10:00');
  const [studentStatusMap, setStudentStatusMap] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [markingSuccess, setMarkingSuccess] = useState<string | null>(null);

  // New Notice state
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');

  const loadData = async () => {
    try {
      const [ttRes, leaveRes, noticeRes, stdRes, attRes] = await Promise.all([
        apiRequest<{ timetable: TimetableEntry[] }>('/api/timetable'),
        apiRequest<{ leaveRequests: LeaveRequest[] }>('/api/leave'),
        apiRequest<{ notices: Notice[] }>('/api/notices'),
        apiRequest<{ students: any[] }>('/api/attendance/students-for-class'),
        apiRequest<{ sessions: AttendanceRecord[] }>('/api/attendance/my')
      ]);

      const myTimetable = (ttRes.timetable || []).filter(t => t.facultyId === user?.id || t.facultyName === user?.name);
      setTimetable(myTimetable.length > 0 ? myTimetable : ttRes.timetable || []);
      setLeaveRequests(leaveRes.leaveRequests || []);
      setNotices(noticeRes.notices || []);
      setStudents(stdRes.students || []);
      setAttendanceSessions(attRes.sessions || []);

      // Initialize students status map to 'present'
      const initialMap: Record<string, 'present' | 'absent' | 'late'> = {};
      (stdRes.students || []).forEach((s: any) => {
        initialMap[s.studentId] = 'present';
      });
      setStudentStatusMap(initialMap);
    } catch (err) {
      console.error('Failed to load faculty data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudentStatusMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const records = students.map(s => ({
      studentId: s.studentId,
      studentName: s.studentName,
      rollNumber: s.rollNumber,
      status: studentStatusMap[s.studentId] || 'present'
    }));

    try {
      await apiRequest('/api/attendance/session', {
        method: 'POST',
        body: JSON.stringify({
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          date: sessionDate,
          timeSlot: sessionTime,
          semester: 5,
          department: user?.department || 'Computer Science & Engineering',
          studentRecords: records
        })
      });

      setMarkingSuccess(`Attendance for ${selectedSubject.code} recorded successfully!`);
      setTimeout(() => setMarkingSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance.');
    }
  };

  const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await apiRequest(`/api/leave/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, comments: `Reviewed by ${user?.name}` })
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublishClassNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    try {
      await apiRequest('/api/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          category: 'academic',
          targetAudience: 'students',
          isPinned: false
        })
      });
      setNoticeTitle('');
      setNoticeContent('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Faculty Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#12313B]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Faculty Academic Command</h1>
          <p className="text-xs text-[#91B8C0] mt-0.5">
            {user?.name} · {user?.department || 'Computer Science'} · Staff ID: <span className="font-mono text-[#6EEAF5]">{user?.staffId || 'FAC-001'}</span>
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12313B] text-xs font-semibold text-[#D9F7FA] hover:bg-[#1a4452] border border-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#35D6E8]" /> Sync Records
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
              <div className="text-xs text-[#91B8C0]">Assigned Weekly Lectures</div>
              <div className="text-3xl font-bold text-white font-mono mt-1">{timetable.length}</div>
              <div className="text-[11px] text-[#35D6E8] mt-1">CS501, CS502, CS503, CS504, CS505P</div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
              <div className="text-xs text-[#91B8C0]">Enrolled Class Students</div>
              <div className="text-3xl font-bold text-white font-mono mt-1">{students.length}</div>
              <div className="text-[11px] text-[#91B8C0] mt-1">Section 5-A & 5-B</div>
            </div>

            <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
              <div className="text-xs text-[#91B8C0]">Pending Leave Requests</div>
              <div className="text-3xl font-bold text-amber-300 font-mono mt-1">
                {leaveRequests.filter(l => l.status === 'pending').length}
              </div>
              <div className="text-[11px] text-amber-400 mt-1">Academic Approvals Needed</div>
            </div>
          </div>

          {/* Today's Teaching Schedule */}
          <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#35D6E8]" /> Your Teaching Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {timetable.map(t => (
                <div key={t.id} className="p-3.5 bg-[#12313B]/60 rounded-xl border border-white/5 text-xs">
                  <div className="font-bold text-white text-sm">{t.subjectName}</div>
                  <div className="text-[11px] text-[#35D6E8] font-mono mt-0.5">{t.subjectCode}</div>
                  <div className="text-[#91B8C0] text-[11px] mt-2">
                    {t.dayOfWeek} · <span className="text-white font-mono">{t.timeSlot}</span>
                  </div>
                  <div className="text-[#91B8C0] text-[11px] mt-0.5">Location: {t.roomNumber}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MARK CLASS ATTENDANCE */}
      {currentTab === 'attendance' && (
        <div className="space-y-5">
          <form onSubmit={handleSaveAttendance} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4">
            <div className="pb-3 border-b border-[#12313B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Lecture Attendance Register</h3>
                <p className="text-[11px] text-[#91B8C0]">Instant attendance calculation with threshold alerts</p>
              </div>

              {markingSuccess && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {markingSuccess}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Subject Lecture</label>
                <select
                  value={selectedSubject.code}
                  onChange={e => {
                    const code = e.target.value;
                    const name = code === 'CS501' ? 'Distributed Systems & Cloud Computing' : 'Artificial Intelligence & Machine Learning';
                    setSelectedSubject({ code, name });
                  }}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="CS501">CS501 - Distributed Systems & Cloud Computing</option>
                  <option value="CS502">CS502 - Artificial Intelligence & Machine Learning</option>
                  <option value="CS503">CS503 - Compiler Design</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Lecture Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#91B8C0] mb-1">Time Slot</label>
                <select
                  value={sessionTime}
                  onChange={e => setSessionTime(e.target.value)}
                  className="w-full bg-[#12313B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="09:00 - 10:00">09:00 - 10:00</option>
                  <option value="10:15 - 11:15">10:15 - 11:15</option>
                  <option value="11:30 - 12:30">11:30 - 12:30</option>
                </select>
              </div>
            </div>

            {/* Student Grid */}
            <div className="border border-[#12313B] rounded-xl overflow-hidden mt-4">
              <div className="bg-[#081820] px-4 py-2.5 flex justify-between items-center text-[11px] text-[#91B8C0] font-semibold border-b border-[#12313B]">
                <span>Enrolled Student</span>
                <span>Attendance Status Toggle</span>
              </div>

              <div className="divide-y divide-[#12313B]">
                {students.map(s => {
                  const currentStatus = studentStatusMap[s.studentId] || 'present';
                  return (
                    <div key={s.studentId} className="p-3.5 hover:bg-[#12313B]/30 flex items-center justify-between text-xs transition-colors">
                      <div>
                        <div className="font-semibold text-white">{s.studentName}</div>
                        <div className="font-mono text-[11px] text-[#6EEAF5]">{s.rollNumber}</div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.studentId, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            currentStatus === 'present'
                              ? 'bg-emerald-500 text-[#081820] font-bold shadow-sm'
                              : 'bg-[#12313B] text-[#91B8C0] hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.studentId, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            currentStatus === 'absent'
                              ? 'bg-rose-500 text-white font-bold shadow-sm'
                              : 'bg-[#12313B] text-[#91B8C0] hover:text-white'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.studentId, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-[#081820] font-bold shadow-sm'
                              : 'bg-[#12313B] text-[#91B8C0] hover:text-white'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] font-bold text-xs transition-all shadow-md"
            >
              Submit & Commit Attendance Session
            </button>
          </form>
        </div>
      )}

      {/* TAB: TIMETABLE */}
      {currentTab === 'timetable' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden p-5">
          <h3 className="text-sm font-bold text-white mb-4">Official Department Timetable</h3>
          <div className="divide-y divide-[#12313B] text-xs">
            {timetable.map(tt => (
              <div key={tt.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{tt.subjectName} ({tt.subjectCode})</div>
                  <div className="text-[11px] text-[#91B8C0]">{tt.dayOfWeek} · {tt.timeSlot} · Room: {tt.roomNumber}</div>
                </div>
                <span className="font-mono text-[11px] text-[#35D6E8] bg-[#12313B] px-2 py-1 rounded">
                  Semester {tt.semester}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: LEAVE REVIEW */}
      {currentTab === 'leave' && (
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#12313B] text-xs font-bold text-white uppercase tracking-wider">
            Student Academic Leave Requests
          </div>
          <div className="divide-y divide-[#12313B]">
            {leaveRequests.map(lr => (
              <div key={lr.id} className="p-4 hover:bg-[#12313B]/30 text-xs flex justify-between items-start gap-4">
                <div>
                  <div className="font-bold text-white">
                    {lr.studentName} ({lr.rollNumber}) · <span className="text-[#35D6E8]">{lr.leaveType}</span>
                  </div>
                  <p className="text-xs text-[#D9F7FA] mt-1">{lr.reason}</p>
                  <div className="text-[11px] text-[#91B8C0] mt-1">
                    Dates: {lr.fromDate} to {lr.toDate}
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
                        onClick={() => handleLeaveAction(lr.id, 'approved')}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(lr.id, 'rejected')}
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

      {/* TAB: NOTICES */}
      {currentTab === 'notices' && (
        <form onSubmit={handlePublishClassNotice} className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-5 text-xs space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-[#12313B]">
            Publish Academic Notice to Class
          </h3>
          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Headline</label>
            <input
              type="text"
              required
              value={noticeTitle}
              onChange={e => setNoticeTitle(e.target.value)}
              placeholder="e.g. Extra Lab Session for Distributed Systems"
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#91B8C0] mb-1">Announcement Body</label>
            <textarea
              required
              rows={3}
              value={noticeContent}
              onChange={e => setNoticeContent(e.target.value)}
              placeholder="Details regarding syllabus, assignment deadlines, or lab schedule..."
              className="w-full bg-[#12313B] border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5]"
          >
            Publish Notice
          </button>
        </form>
      )}
    </div>
  );
};
