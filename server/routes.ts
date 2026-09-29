import { Router, Response } from 'express';
import {
  getDatabase,
  saveDatabase,
  hashPassword,
  User,
  AttendanceRecord,
  TimetableEntry,
  LeaveRequest,
  GatePass,
  CertificateRequest,
  Complaint,
  Notice,
  FeeRecord,
  AlumniPost,
  GateActivity,
  MessFeedback
} from './db';
import {
  createToken,
  authMiddleware,
  requireRole,
  AuthenticatedRequest
} from './auth';
import { processAICampusQuery } from './ai';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & REGISTRATION
// ==========================================

apiRouter.post('/auth/login', (req, res) => {
  const { email, password, expectedRole } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Please provide both email and password.' });
    return;
  }

  const db = getDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials. User with this email does not exist.' });
    return;
  }

  if (user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    return;
  }

  if (user.status !== 'active') {
    res.status(403).json({
      error: `Your account status is ${user.status}. Please contact an institutional administrator for verification.`
    });
    return;
  }

  // Generate token with actual verified role from DB
  const token = createToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
      staffId: user.staffId,
      designation: user.designation,
      company: user.company,
      hostelId: user.hostelId,
      roomNumber: user.roomNumber
    }
  });
});

apiRouter.post('/auth/signup', (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    rollNumber,
    staffId,
    course,
    year,
    semester,
    graduationYear,
    company,
    designation,
    hostelId,
    adminMasterKey
  } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'Name, email, password, and role are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const db = getDatabase();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists.' });
    return;
  }

  // Security policy: Administrator accounts cannot be self-created unless master key is supplied
  if (role === 'admin') {
    const existingAdmins = db.users.filter(u => u.role === 'admin');
    if (existingAdmins.length > 0 && adminMasterKey !== 'CAMPUS_NEXUS_ROOT_2026') {
      res.status(403).json({
        error: 'Administrator accounts cannot be self-registered. Please contact the Institution Super-Admin.'
      });
      return;
    }
  }

  // Privileged roles (faculty, security, warden) start as "pending" unless created by an admin
  const isPrivileged = ['faculty', 'security', 'warden'].includes(role);
  const userStatus: User['status'] = isPrivileged ? 'pending' : 'active';

  const newUser: User = {
    id: `usr_${role}_${Date.now()}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    status: userStatus,
    department,
    rollNumber: role === 'student' ? rollNumber || `STD-${Date.now().toString().slice(-4)}` : undefined,
    staffId: ['faculty', 'security', 'warden', 'admin'].includes(role) ? staffId || `STF-${Date.now().toString().slice(-4)}` : undefined,
    course,
    year: year ? Number(year) : undefined,
    semester: semester ? Number(semester) : undefined,
    graduationYear: graduationYear ? Number(graduationYear) : undefined,
    company,
    designation,
    hostelId,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  // Add system notification for administrator if approval is pending
  if (newUser.status === 'pending') {
    db.notifications.push({
      id: `notif_${Date.now()}`,
      targetRoleOrId: 'role:admin',
      title: 'New Account Pending Verification',
      message: `${name} has registered for the ${role.toUpperCase()} role and requires approval.`,
      type: 'warning',
      link: '/admin?tab=users',
      readBy: [],
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);

  if (newUser.status === 'pending') {
    res.status(201).json({
      message: 'Account registered successfully. Your account is pending Administrator verification before login is enabled.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status }
    });
    return;
  }

  const token = createToken(newUser);
  res.status(201).json({
    message: 'Account created successfully!',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      department: newUser.department,
      rollNumber: newUser.rollNumber
    }
  });
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = db.users.find(u => u.id === req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User record not found.' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      rollNumber: user.rollNumber,
      staffId: user.staffId,
      designation: user.designation,
      company: user.company,
      hostelId: user.hostelId,
      roomNumber: user.roomNumber,
      course: user.course,
      semester: user.semester,
      year: user.year,
      phone: user.phone
    }
  });
});

apiRouter.post('/auth/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const db = getDatabase();
  const user = db.users.find(u => u.id === req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (user.passwordHash !== hashPassword(currentPassword)) {
    res.status(400).json({ error: 'Current password does not match.' });
    return;
  }

  user.passwordHash = hashPassword(newPassword);
  saveDatabase(db);
  res.json({ message: 'Password updated successfully.' });
});

// ==========================================
// 2. USER MANAGEMENT (Admin Only)
// ==========================================

apiRouter.get('/admin/users', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const { role, status, search } = req.query;

  let filtered = [...db.users];

  if (role) {
    filtered = filtered.filter(u => u.role === role);
  }
  if (status) {
    filtered = filtered.filter(u => u.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
      (u.staffId && u.staffId.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  }

  // Safe user representation (omit password hash)
  const safeUsers = filtered.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    department: u.department,
    rollNumber: u.rollNumber,
    staffId: u.staffId,
    phone: u.phone,
    designation: u.designation,
    course: u.course,
    year: u.year,
    semester: u.semester,
    hostelId: u.hostelId,
    roomNumber: u.roomNumber,
    createdAt: u.createdAt
  }));

  res.json({ users: safeUsers });
});

apiRouter.post('/admin/users', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, department, rollNumber, staffId, designation, hostelId, roomNumber, course, year, semester } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'Name, email, password, and role are required.' });
    return;
  }

  const db = getDatabase();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(400).json({ error: 'A user with this email already exists.' });
    return;
  }

  const newUser: User = {
    id: `usr_${role}_${Date.now()}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    status: 'active',
    department,
    rollNumber,
    staffId,
    designation,
    hostelId,
    roomNumber,
    course,
    year: year ? Number(year) : undefined,
    semester: semester ? Number(semester) : undefined,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  res.status(201).json({ message: 'User created successfully.', user: newUser });
});

apiRouter.patch('/admin/users/:id', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role, status, department, designation, hostelId, roomNumber, rollNumber, staffId, name } = req.body;

  const db = getDatabase();
  const user = db.users.find(u => u.id === id);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (role) user.role = role;
  if (status) user.status = status;
  if (department !== undefined) user.department = department;
  if (designation !== undefined) user.designation = designation;
  if (hostelId !== undefined) user.hostelId = hostelId;
  if (roomNumber !== undefined) user.roomNumber = roomNumber;
  if (rollNumber !== undefined) user.rollNumber = rollNumber;
  if (staffId !== undefined) user.staffId = staffId;
  if (name !== undefined) user.name = name;

  saveDatabase(db);
  res.json({ message: 'User updated successfully.', user });
});

apiRouter.delete('/admin/users/:id', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  // Prevent deleting the last admin
  if (db.users[idx].role === 'admin') {
    const adminCount = db.users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      res.status(400).json({ error: 'Cannot delete the only remaining administrator.' });
      return;
    }
  }

  db.users.splice(idx, 1);
  saveDatabase(db);
  res.json({ message: 'User account removed successfully.' });
});

// ==========================================
// 3. ATTENDANCE MANAGEMENT
// ==========================================

apiRouter.get('/attendance/my', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = req.user!;

  if (user.role === 'student') {
    let total = 0;
    let attended = 0;
    const history: Array<{
      id: string;
      date: string;
      timeSlot: string;
      subjectCode: string;
      subjectName: string;
      facultyName: string;
      status: 'present' | 'absent' | 'late';
    }> = [];

    const subjectStats: Record<string, { code: string; name: string; total: number; present: number }> = {};

    db.attendance.forEach(session => {
      const rec = session.studentRecords.find(r => r.studentId === user.userId);
      if (rec) {
        total++;
        if (rec.status === 'present' || rec.status === 'late') attended++;

        if (!subjectStats[session.subjectCode]) {
          subjectStats[session.subjectCode] = {
            code: session.subjectCode,
            name: session.subjectName,
            total: 0,
            present: 0
          };
        }
        subjectStats[session.subjectCode].total++;
        if (rec.status === 'present' || rec.status === 'late') {
          subjectStats[session.subjectCode].present++;
        }

        history.push({
          id: `${session.id}_${rec.studentId}`,
          date: session.date,
          timeSlot: session.timeSlot,
          subjectCode: session.subjectCode,
          subjectName: session.subjectName,
          facultyName: session.facultyName,
          status: rec.status
        });
      }
    });

    const percentage = total > 0 ? (attended / total) * 100 : 100;
    const isBelowThreshold = percentage < db.settings.attendanceWarningThreshold;

    res.json({
      summary: {
        totalClasses: total,
        attendedClasses: attended,
        percentage: Number(percentage.toFixed(1)),
        isBelowThreshold,
        threshold: db.settings.attendanceWarningThreshold
      },
      subjectWise: Object.values(subjectStats).map(s => ({
        ...s,
        percentage: Number(((s.present / s.total) * 100).toFixed(1))
      })),
      history: history.reverse()
    });
  } else if (user.role === 'faculty') {
    const sessions = db.attendance.filter(a => a.facultyId === user.userId);
    res.json({ sessions });
  } else {
    // Admin overview
    res.json({ sessions: db.attendance });
  }
});

apiRouter.post('/attendance/session', authMiddleware, requireRole('faculty', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { subjectCode, subjectName, department, semester, date, timeSlot, studentRecords } = req.body;

  if (!subjectCode || !date || !studentRecords || !Array.isArray(studentRecords)) {
    res.status(400).json({ error: 'Missing required attendance session fields.' });
    return;
  }

  const db = getDatabase();

  // Prevent duplicate session for same subject, date and time
  const existingIdx = db.attendance.findIndex(
    a => a.subjectCode === subjectCode && a.date === date && a.timeSlot === timeSlot
  );

  const newSession: AttendanceRecord = {
    id: existingIdx >= 0 ? db.attendance[existingIdx].id : `att_${Date.now()}`,
    classId: `${subjectCode}_S${semester || 5}_${date.replace(/-/g, '')}`,
    className: `${department || 'CSE'} - Semester ${semester || 5}`,
    subjectCode,
    subjectName: subjectName || subjectCode,
    facultyId: req.user!.userId,
    facultyName: req.user!.name,
    department: department || 'Computer Science & Engineering',
    semester: Number(semester) || 5,
    date,
    timeSlot: timeSlot || '09:00 - 10:00',
    studentRecords
  };

  if (existingIdx >= 0) {
    db.attendance[existingIdx] = newSession;
  } else {
    db.attendance.push(newSession);
  }

  saveDatabase(db);
  res.json({ message: 'Attendance recorded successfully.', session: newSession });
});

apiRouter.get('/attendance/students-for-class', authMiddleware, requireRole('faculty', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const students = db.users.filter(u => u.role === 'student' && u.status === 'active');
  res.json({
    students: students.map(s => ({
      studentId: s.id,
      studentName: s.name,
      rollNumber: s.rollNumber || 'N/A',
      department: s.department
    }))
  });
});

// ==========================================
// 4. TIMETABLE
// ==========================================

apiRouter.get('/timetable', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ timetable: db.timetable });
});

apiRouter.post('/timetable', authMiddleware, requireRole('admin', 'faculty'), (req: AuthenticatedRequest, res: Response) => {
  const { department, semester, dayOfWeek, timeSlot, subjectCode, subjectName, roomNumber, facultyId, facultyName } = req.body;

  if (!department || !dayOfWeek || !timeSlot || !subjectCode || !roomNumber) {
    res.status(400).json({ error: 'All timetable slot details are required.' });
    return;
  }

  const db = getDatabase();

  // Clash Detection 1: Room clash at same day and time
  const roomClash = db.timetable.find(
    t => t.dayOfWeek === dayOfWeek && t.timeSlot === timeSlot && t.roomNumber.toLowerCase() === roomNumber.toLowerCase()
  );
  if (roomClash) {
    res.status(400).json({
      error: `Room conflict! ${roomNumber} is already booked on ${dayOfWeek} at ${timeSlot} for ${roomClash.subjectName}.`
    });
    return;
  }

  // Clash Detection 2: Faculty clash at same day and time
  const targetFacultyId = facultyId || req.user!.userId;
  const facultyClash = db.timetable.find(
    t => t.dayOfWeek === dayOfWeek && t.timeSlot === timeSlot && t.facultyId === targetFacultyId
  );
  if (facultyClash) {
    res.status(400).json({
      error: `Faculty conflict! ${facultyClash.facultyName} already has a lecture on ${dayOfWeek} at ${timeSlot}.`
    });
    return;
  }

  const newEntry: TimetableEntry = {
    id: `tt_${Date.now()}`,
    department,
    semester: Number(semester) || 5,
    dayOfWeek,
    timeSlot,
    subjectCode,
    subjectName: subjectName || subjectCode,
    facultyId: targetFacultyId,
    facultyName: facultyName || req.user!.name,
    roomNumber
  };

  db.timetable.push(newEntry);
  saveDatabase(db);
  res.status(201).json({ message: 'Timetable entry added successfully.', entry: newEntry });
});

apiRouter.delete('/timetable/:id', authMiddleware, requireRole('admin', 'faculty'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const idx = db.timetable.findIndex(t => t.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Timetable entry not found.' });
    return;
  }

  db.timetable.splice(idx, 1);
  saveDatabase(db);
  res.json({ message: 'Timetable entry removed successfully.' });
});

// ==========================================
// 5. LEAVE REQUESTS
// ==========================================

apiRouter.get('/leave', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = req.user!;

  if (user.role === 'student') {
    const studentLeaves = db.leaveRequests.filter(l => l.studentId === user.userId);
    res.json({ leaveRequests: studentLeaves });
  } else {
    res.json({ leaveRequests: db.leaveRequests });
  }
});

apiRouter.post('/leave', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const { leaveType, fromDate, toDate, reason } = req.body;
  if (!leaveType || !fromDate || !toDate || !reason) {
    res.status(400).json({ error: 'Please specify leave type, from date, to date, and reason.' });
    return;
  }

  const db = getDatabase();
  const user = req.user!;

  const newLeave: LeaveRequest = {
    id: `lr_${Date.now()}`,
    studentId: user.userId,
    studentName: user.name,
    rollNumber: user.rollNumber || 'STD-001',
    department: user.department || 'General',
    leaveType,
    fromDate,
    toDate,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.leaveRequests.unshift(newLeave);

  // Notify faculty / admin
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: 'role:faculty',
    title: 'New Student Leave Request',
    message: `${user.name} submitted a leave request from ${fromDate} to ${toDate}.`,
    type: 'info',
    link: '/faculty?tab=leave',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.status(201).json({ message: 'Leave request submitted successfully.', request: newLeave });
});

apiRouter.patch('/leave/:id/status', authMiddleware, requireRole('faculty', 'warden', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, comments } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Status must be approved or rejected.' });
    return;
  }

  const db = getDatabase();
  const leave = db.leaveRequests.find(l => l.id === id);
  if (!leave) {
    res.status(404).json({ error: 'Leave request not found.' });
    return;
  }

  leave.status = status;
  leave.reviewedBy = req.user!.userId;
  leave.reviewerName = req.user!.name;
  leave.reviewedAt = new Date().toISOString();
  if (comments) leave.comments = comments;

  // Notify student
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: leave.studentId,
    title: `Leave Request ${status.toUpperCase()}`,
    message: `Your leave request for ${leave.fromDate} has been ${status} by ${req.user!.name}.`,
    type: status === 'approved' ? 'success' : 'alert',
    link: '/student?tab=leave',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ message: `Leave request ${status} successfully.`, leave });
});

// ==========================================
// 6. QR GATE-PASS SYSTEM
// ==========================================

apiRouter.get('/gatepasses', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = req.user!;

  if (user.role === 'student') {
    const passes = db.gatePasses.filter(g => g.studentId === user.userId);
    res.json({ gatePasses: passes });
  } else if (user.role === 'security') {
    // Return all passes for quick verification lookup
    res.json({ gatePasses: db.gatePasses });
  } else {
    res.json({ gatePasses: db.gatePasses });
  }
});

apiRouter.post('/gatepasses', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const { exitTime, expectedReturnTime, reason, destination } = req.body;

  if (!exitTime || !expectedReturnTime || !reason || !destination) {
    res.status(400).json({ error: 'Please provide exit time, expected return time, reason, and destination.' });
    return;
  }

  const db = getDatabase();
  const user = req.user!;
  const passId = `gp_${Date.now()}`;
  const passCode = `CN-GP-${Math.floor(10000 + Math.random() * 90000)}`;

  const newPass: GatePass = {
    id: passId,
    passCode,
    studentId: user.userId,
    studentName: user.name,
    rollNumber: user.rollNumber || 'STD-001',
    department: user.department || 'General',
    exitTime,
    expectedReturnTime,
    reason,
    destination,
    status: 'pending',
    qrPayload: JSON.stringify({
      passCode,
      studentId: user.userId,
      studentName: user.name,
      rollNumber: user.rollNumber,
      validUntil: expectedReturnTime
    }),
    createdAt: new Date().toISOString(),
    usageLogs: []
  };

  db.gatePasses.unshift(newPass);

  // Notify warden
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: 'role:warden',
    title: 'New Gate Pass Request',
    message: `${user.name} requested a gate pass for ${destination}.`,
    type: 'info',
    link: '/warden?tab=gatepasses',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.status(201).json({ message: 'Gate pass requested successfully.', gatePass: newPass });
});

apiRouter.patch('/gatepasses/:id/status', authMiddleware, requireRole('warden', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Status must be approved or rejected.' });
    return;
  }

  const db = getDatabase();
  const pass = db.gatePasses.find(g => g.id === id);
  if (!pass) {
    res.status(404).json({ error: 'Gate pass not found.' });
    return;
  }

  pass.status = status;
  pass.approvedBy = req.user!.userId;
  pass.approverName = req.user!.name;
  pass.approvedAt = new Date().toISOString();

  // Notify student
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: pass.studentId,
    title: `Gate Pass ${status.toUpperCase()}`,
    message: `Your gate pass ${pass.passCode} has been ${status}.`,
    type: status === 'approved' ? 'success' : 'alert',
    link: '/student?tab=gatepasses',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ message: `Gate pass ${status} successfully.`, gatePass: pass });
});

// Security Scan Verification
apiRouter.post('/gatepasses/verify', authMiddleware, requireRole('security', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { codeOrPayload } = req.body;

  if (!codeOrPayload) {
    res.status(400).json({ error: 'Code or QR payload is required.' });
    return;
  }

  const db = getDatabase();
  let passCode = String(codeOrPayload).trim();

  // If payload is JSON from QR
  try {
    const parsed = JSON.parse(codeOrPayload);
    if (parsed.passCode) passCode = parsed.passCode;
  } catch {
    // plain string
  }

  const pass = db.gatePasses.find(g => g.passCode.toUpperCase() === passCode.toUpperCase());

  if (!pass) {
    res.json({
      valid: false,
      reason: 'Pass identifier not recognized in institutional database.',
      passCode
    });
    return;
  }

  if (pass.status === 'rejected') {
    res.json({
      valid: false,
      reason: 'Gate pass was REJECTED by hostel administration.',
      gatePass: pass
    });
    return;
  }

  if (pass.status === 'pending') {
    res.json({
      valid: false,
      reason: 'Gate pass is PENDING approval from Warden / Administration.',
      gatePass: pass
    });
    return;
  }

  // Check expiration
  const now = new Date().getTime();
  const returnTime = new Date(pass.expectedReturnTime).getTime();

  if (now > returnTime + 3600 * 1000) { // 1 hr grace
    res.json({
      valid: false,
      reason: 'Gate pass is EXPIRED. Exceeded expected return window.',
      gatePass: pass
    });
    return;
  }

  res.json({
    valid: true,
    message: 'Gate pass is verified and authentic.',
    gatePass: pass
  });
});

// Security Record Exit or Entry
apiRouter.post('/gatepasses/record-action', authMiddleware, requireRole('security', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { passCode, action, gateNumber, remarks } = req.body;

  if (!passCode || !action || !['exit', 'entry'].includes(action)) {
    res.status(400).json({ error: 'Pass code and action (exit/entry) are required.' });
    return;
  }

  const db = getDatabase();
  const pass = db.gatePasses.find(g => g.passCode.toUpperCase() === passCode.toUpperCase());

  if (!pass) {
    res.status(404).json({ error: 'Gate pass not found.' });
    return;
  }

  const timestamp = new Date().toISOString();
  const securityName = req.user!.name;

  if (action === 'exit') {
    pass.exitRecordedAt = timestamp;
  } else if (action === 'entry') {
    pass.entryRecordedAt = timestamp;
    pass.status = 'used'; // Mark as used when returned
  }

  pass.usageLogs.push({
    action,
    timestamp,
    securityName,
    notes: remarks
  });

  // Record in global gate activity log
  const activityLog: GateActivity = {
    id: `ga_${Date.now()}`,
    passId: pass.id,
    passCode: pass.passCode,
    studentId: pass.studentId,
    studentName: pass.studentName,
    rollNumber: pass.rollNumber,
    action,
    timestamp,
    securityStaffName: securityName,
    gateNumber: gateNumber || 'Main Gate 1',
    valid: true,
    remarks
  };

  db.gateActivity.unshift(activityLog);

  saveDatabase(db);
  res.json({ message: `Student ${action.toUpperCase()} recorded successfully.`, gatePass: pass });
});

apiRouter.get('/gatepasses/activity', authMiddleware, requireRole('security', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ activity: db.gateActivity.slice(0, 50) });
});

// ==========================================
// 7. CERTIFICATE SERVICES
// ==========================================

apiRouter.get('/certificates', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = req.user!;

  if (user.role === 'student') {
    res.json({ certificates: db.certificates.filter(c => c.studentId === user.userId) });
  } else {
    res.json({ certificates: db.certificates });
  }
});

apiRouter.post('/certificates', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const { certificateType, purpose } = req.body;
  if (!certificateType || !purpose) {
    res.status(400).json({ error: 'Certificate type and purpose are required.' });
    return;
  }

  const db = getDatabase();
  const user = req.user!;

  const newCert: CertificateRequest = {
    id: `cert_${Date.now()}`,
    studentId: user.userId,
    studentName: user.name,
    rollNumber: user.rollNumber || 'STD-001',
    department: user.department || 'General',
    certificateType,
    purpose,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.certificates.unshift(newCert);
  saveDatabase(db);
  res.status(201).json({ message: 'Certificate application submitted successfully.', certificate: newCert });
});

apiRouter.patch('/certificates/:id/status', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const db = getDatabase();
  const cert = db.certificates.find(c => c.id === id);
  if (!cert) {
    res.status(404).json({ error: 'Certificate request not found.' });
    return;
  }

  cert.status = status;
  if (notes) cert.notes = notes;

  if (status === 'issued') {
    cert.issuedAt = new Date().toISOString();
    cert.certificateNumber = `CN-${cert.certificateType.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  }

  // Notify student
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: cert.studentId,
    title: `Certificate ${status === 'issued' ? 'Issued' : 'Updated'}`,
    message: `Your ${cert.certificateType} certificate status is now ${status.toUpperCase()}.`,
    type: status === 'issued' ? 'success' : 'info',
    link: '/student?tab=certificates',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ message: 'Certificate status updated.', certificate: cert });
});

// ==========================================
// 8. HOSTEL MANAGEMENT
// ==========================================

apiRouter.get('/hostels', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();

  // Synchronize room occupants and counts with actual users in DB
  const enrichedHostels = db.hostels.map(hostel => {
    const enrichedRooms = hostel.rooms.map(room => {
      // Find students whose hostelId and roomNumber match this room
      const studentsInRoom = db.users.filter(
        u => u.role === 'student' && u.hostelId === hostel.id && u.roomNumber === room.roomNumber
      );

      const occupantIds = studentsInRoom.map(s => s.id);
      return {
        ...room,
        occupied: occupantIds.length,
        occupantIds,
        occupants: studentsInRoom.map(s => ({
          id: s.id,
          name: s.name,
          rollNumber: s.rollNumber || 'N/A',
          department: s.department || 'N/A',
          email: s.email,
          phone: s.phone
        }))
      };
    });

    return {
      ...hostel,
      rooms: enrichedRooms
    };
  });

  res.json({ hostels: enrichedHostels });
});

apiRouter.get('/hostels/residents', authMiddleware, requireRole('warden', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const students = db.users
    .filter(u => u.role === 'student' && u.status === 'active')
    .map(s => {
      const hostel = db.hostels.find(h => h.id === s.hostelId);
      return {
        id: s.id,
        name: s.name,
        rollNumber: s.rollNumber || 'N/A',
        department: s.department || 'N/A',
        course: s.course || 'B.Tech',
        year: s.year || 1,
        semester: s.semester || 1,
        email: s.email,
        phone: s.phone || 'N/A',
        hostelId: s.hostelId || null,
        hostelName: hostel ? hostel.name : null,
        roomNumber: s.roomNumber || null,
        isAllocated: Boolean(s.hostelId && s.roomNumber)
      };
    });

  res.json({ residents: students });
});

apiRouter.post('/hostels/allocate', authMiddleware, requireRole('warden', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { hostelId, roomNumber, studentId } = req.body;

  if (!hostelId || !roomNumber || !studentId) {
    res.status(400).json({ error: 'Hostel ID, Room Number, and Student identifier are required.' });
    return;
  }

  const db = getDatabase();
  const hostel = db.hostels.find(h => h.id === hostelId);
  if (!hostel) {
    res.status(404).json({ error: 'Target hostel not found.' });
    return;
  }

  const room = hostel.rooms.find(r => r.roomNumber === roomNumber);
  if (!room) {
    res.status(404).json({ error: `Room ${roomNumber} does not exist in ${hostel.name}.` });
    return;
  }

  // Find student by ID or Roll Number or Email
  const student = db.users.find(
    u => u.role === 'student' && (u.id === studentId || u.rollNumber === studentId || u.email.toLowerCase() === studentId.toLowerCase())
  );
  if (!student) {
    res.status(404).json({ error: `Student '${studentId}' not found in active student records.` });
    return;
  }

  // If student is already in this exact room
  if (student.hostelId === hostelId && student.roomNumber === roomNumber) {
    res.json({ message: `${student.name} is already allocated to Room ${roomNumber}.`, hostel });
    return;
  }

  // Check capacity of target room (count actual students assigned there)
  const currentInRoom = db.users.filter(
    u => u.role === 'student' && u.id !== student.id && u.hostelId === hostelId && u.roomNumber === roomNumber
  );

  if (currentInRoom.length >= room.capacity) {
    res.status(400).json({
      error: `Room ${roomNumber} is at maximum capacity (${room.capacity}/${room.capacity} beds occupied). Please select another room or vacate an existing occupant.`
    });
    return;
  }

  // If student was previously allocated to another room, clean up previous room
  const prevHostelId = student.hostelId;
  const prevRoomNumber = student.roomNumber;
  if (prevHostelId && prevRoomNumber) {
    const prevHostel = db.hostels.find(h => h.id === prevHostelId);
    const prevRoom = prevHostel?.rooms.find(r => r.roomNumber === prevRoomNumber);
    if (prevRoom) {
      prevRoom.occupantIds = prevRoom.occupantIds.filter(id => id !== student.id);
      prevRoom.occupied = Math.max(0, prevRoom.occupantIds.length);
    }
  }

  // Assign to new room
  student.hostelId = hostelId;
  student.roomNumber = roomNumber;

  if (!room.occupantIds.includes(student.id)) {
    room.occupantIds.push(student.id);
  }
  room.occupied = room.occupantIds.length;

  // Add notification for the student
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: student.id,
    title: 'Hostel Room Allocated',
    message: `You have been allocated Room ${roomNumber} in ${hostel.name} by ${req.user!.name}.`,
    type: 'success',
    link: '/student?tab=hostel',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({
    message: `Room ${roomNumber} allocated to ${student.name} (${student.rollNumber || student.id}) successfully!`,
    student: {
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      hostelId: student.hostelId,
      roomNumber: student.roomNumber
    }
  });
});

apiRouter.post('/hostels/deallocate', authMiddleware, requireRole('warden', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { studentId } = req.body;

  if (!studentId) {
    res.status(400).json({ error: 'Student ID or Roll Number is required to deallocate.' });
    return;
  }

  const db = getDatabase();
  const student = db.users.find(
    u => u.role === 'student' && (u.id === studentId || u.rollNumber === studentId)
  );

  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  const prevHostelId = student.hostelId;
  const prevRoomNumber = student.roomNumber;

  if (prevHostelId && prevRoomNumber) {
    const prevHostel = db.hostels.find(h => h.id === prevHostelId);
    const prevRoom = prevHostel?.rooms.find(r => r.roomNumber === prevRoomNumber);
    if (prevRoom) {
      prevRoom.occupantIds = prevRoom.occupantIds.filter(id => id !== student.id);
      prevRoom.occupied = Math.max(0, prevRoom.occupantIds.length);
    }
  }

  student.hostelId = undefined;
  student.roomNumber = undefined;

  // Notify student
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: student.id,
    title: 'Hostel Bed Vacated',
    message: `Your allocation for Room ${prevRoomNumber || 'N/A'} has been released.`,
    type: 'info',
    link: '/student?tab=hostel',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({
    message: `Bed in Room ${prevRoomNumber || 'N/A'} vacated for ${student.name}. Student is now unallocated.`
  });
});

// ==========================================
// 9. MESS MANAGEMENT
// ==========================================

apiRouter.get('/mess/menu', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ menu: db.messMenu });
});

apiRouter.put('/mess/menu', authMiddleware, requireRole('warden', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { dayOfWeek, breakfast, lunch, snacks, dinner, specialItem } = req.body;

  const db = getDatabase();
  const idx = db.messMenu.findIndex(m => m.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());

  if (idx >= 0) {
    db.messMenu[idx] = { dayOfWeek, breakfast, lunch, snacks, dinner, specialItem };
  } else {
    db.messMenu.push({ dayOfWeek, breakfast, lunch, snacks, dinner, specialItem });
  }

  saveDatabase(db);
  res.json({ message: 'Mess menu updated successfully.' });
});

apiRouter.get('/mess/feedback', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ feedback: db.messFeedback.slice(-30).reverse() });
});

apiRouter.post('/mess/feedback', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const { mealType, rating, comment } = req.body;

  const db = getDatabase();
  const user = req.user!;

  const newFeedback: MessFeedback = {
    id: `mf_${Date.now()}`,
    studentId: user.userId,
    studentName: user.name,
    date: new Date().toISOString().split('T')[0],
    mealType,
    rating: Number(rating) || 5,
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  db.messFeedback.push(newFeedback);
  saveDatabase(db);
  res.status(201).json({ message: 'Thank you for your dining feedback!', feedback: newFeedback });
});

// ==========================================
// 10. COMPLAINTS & TICKETS
// ==========================================

apiRouter.get('/complaints', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = req.user!;

  if (user.role === 'student') {
    res.json({ complaints: db.complaints.filter(c => c.studentId === user.userId) });
  } else {
    res.json({ complaints: db.complaints });
  }
});

apiRouter.post('/complaints', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const { category, subject, description, priority } = req.body;

  if (!category || !subject || !description) {
    res.status(400).json({ error: 'Please provide category, subject, and description.' });
    return;
  }

  const db = getDatabase();
  const user = req.user!;
  const targetDays = db.settings.complaintResolutionTargetDays || 3;
  const targetDate = new Date(Date.now() + targetDays * 24 * 3600 * 1000).toISOString().split('T')[0];

  const newComplaint: Complaint = {
    id: `cmp_${Date.now()}`,
    ticketNumber: `TKT-${category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
    studentId: user.userId,
    studentName: user.name,
    rollNumber: user.rollNumber || 'STD-001',
    category,
    subject,
    description,
    priority: priority || 'medium',
    status: 'submitted',
    resolutionTargetDate: targetDate,
    createdAt: new Date().toISOString()
  };

  db.complaints.unshift(newComplaint);
  saveDatabase(db);
  res.status(201).json({ message: 'Complaint registered successfully.', complaint: newComplaint });
});

apiRouter.patch('/complaints/:id', authMiddleware, requireRole('warden', 'faculty', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, resolutionNotes, assignedToName } = req.body;

  const db = getDatabase();
  const complaint = db.complaints.find(c => c.id === id);
  if (!complaint) {
    res.status(404).json({ error: 'Complaint ticket not found.' });
    return;
  }

  if (status) complaint.status = status;
  if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
  if (assignedToName) complaint.assignedToName = assignedToName;
  if (status === 'resolved') complaint.resolvedAt = new Date().toISOString();

  // Notify student
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: complaint.studentId,
    title: `Complaint Ticket ${complaint.ticketNumber} Updated`,
    message: `Status is now ${status.toUpperCase()}. Notes: ${resolutionNotes || 'Status updated by staff.'}`,
    type: status === 'resolved' ? 'success' : 'info',
    link: '/student?tab=complaints',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ message: 'Complaint updated successfully.', complaint });
});

// ==========================================
// 11. NOTICES & NOTIFICATIONS
// ==========================================

apiRouter.get('/notices', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ notices: db.notices });
});

apiRouter.post('/notices', authMiddleware, requireRole('admin', 'faculty', 'warden'), (req: AuthenticatedRequest, res: Response) => {
  const { title, content, category, targetAudience, isPinned } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  const db = getDatabase();
  const user = req.user!;

  const newNotice: Notice = {
    id: `nt_${Date.now()}`,
    title,
    content,
    category: category || 'general',
    targetAudience: targetAudience || 'all',
    publishedById: user.userId,
    publishedByName: user.name,
    publishedRole: user.role,
    isPinned: Boolean(isPinned),
    createdAt: new Date().toISOString()
  };

  db.notices.unshift(newNotice);

  // Broadcast notification
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: 'all',
    title: `Notice: ${title}`,
    message: content.slice(0, 100) + '...',
    type: 'info',
    link: '/notices',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.status(201).json({ message: 'Notice published successfully.', notice: newNotice });
});

apiRouter.delete('/notices/:id', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const idx = db.notices.findIndex(n => n.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Notice not found.' });
    return;
  }

  db.notices.splice(idx, 1);
  saveDatabase(db);
  res.json({ message: 'Notice removed successfully.' });
});

apiRouter.get('/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = req.user!;

  const userNotifs = db.notifications.filter(n =>
    n.targetRoleOrId === 'all' ||
    n.targetRoleOrId === `role:${user.role}` ||
    n.targetRoleOrId === user.userId
  );

  res.json({ notifications: userNotifs.slice(0, 25) });
});

// ==========================================
// 12. FEE MANAGEMENT
// ==========================================

apiRouter.get('/fees', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = req.user!;

  if (user.role === 'student') {
    res.json({ fees: db.fees.filter(f => f.studentId === user.userId) });
  } else {
    res.json({ fees: db.fees });
  }
});

apiRouter.post('/fees/record-payment', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { feeId, paidAmount } = req.body;
  const db = getDatabase();

  const fee = db.fees.find(f => f.id === feeId);
  if (!fee) {
    res.status(404).json({ error: 'Fee record not found.' });
    return;
  }

  fee.paidAmount += Number(paidAmount);
  if (fee.paidAmount >= fee.amount) {
    fee.status = 'paid';
  } else if (fee.paidAmount > 0) {
    fee.status = 'partial';
  }
  fee.paidAt = new Date().toISOString();
  fee.receiptNumber = `REC-FEE-${Date.now().toString().slice(-6)}`;

  saveDatabase(db);
  res.json({ message: 'Payment recorded successfully.', fee });
});

// ==========================================
// 13. ALUMNI OPPORTUNITY HUB
// ==========================================

apiRouter.get('/alumni/posts', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = req.user!;

  if (user.role === 'alumni') {
    // Alumni sees all approved + their own pending/rejected
    const posts = db.alumniPosts.filter(p => p.status === 'approved' || p.alumniId === user.userId);
    res.json({ posts });
  } else if (user.role === 'admin') {
    res.json({ posts: db.alumniPosts });
  } else {
    // Students & others see only approved
    res.json({ posts: db.alumniPosts.filter(p => p.status === 'approved') });
  }
});

apiRouter.post('/alumni/posts', authMiddleware, requireRole('alumni', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const { type, title, description, requirements, location, stipendOrSalary, deadline } = req.body;

  if (!title || !description || !type) {
    res.status(400).json({ error: 'Title, description, and opportunity type are required.' });
    return;
  }

  const db = getDatabase();
  const user = req.user!;
  const isAdmin = user.role === 'admin';

  const newPost: AlumniPost = {
    id: `alp_${Date.now()}`,
    alumniId: user.userId,
    alumniName: user.name,
    alumniEmail: user.email,
    graduationYear: 2021,
    company: 'Tech Partner',
    designation: 'Alumni Mentor',
    type,
    title,
    description,
    requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split(',') : []),
    location: location || 'Hybrid',
    stipendOrSalary,
    deadline: deadline || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: isAdmin ? 'approved' : 'pending',
    createdAt: new Date().toISOString(),
    applicants: []
  };

  db.alumniPosts.unshift(newPost);

  if (!isAdmin) {
    db.notifications.push({
      id: `notif_${Date.now()}`,
      targetRoleOrId: 'role:admin',
      title: 'New Alumni Opportunity Requires Review',
      message: `${user.name} submitted a ${type} opportunity: ${title}`,
      type: 'info',
      link: '/admin?tab=alumni',
      readBy: [],
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  res.status(201).json({ message: 'Opportunity posted successfully!', post: newPost });
});

apiRouter.patch('/alumni/posts/:id/status', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Status must be approved or rejected.' });
    return;
  }

  const db = getDatabase();
  const post = db.alumniPosts.find(p => p.id === id);
  if (!post) {
    res.status(404).json({ error: 'Post not found.' });
    return;
  }

  post.status = status;
  post.reviewedBy = req.user!.userId;

  // Notify alumni
  db.notifications.push({
    id: `notif_${Date.now()}`,
    targetRoleOrId: post.alumniId,
    title: `Opportunity ${status === 'approved' ? 'Approved & Published' : 'Rejected'}`,
    message: `Your post "${post.title}" has been ${status}.`,
    type: status === 'approved' ? 'success' : 'alert',
    link: '/alumni',
    readBy: [],
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ message: `Opportunity ${status} successfully.`, post });
});

apiRouter.delete('/alumni/posts/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const idx = db.alumniPosts.findIndex(p => p.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Post not found.' });
    return;
  }

  // Alumni can only delete their own; admin can delete any
  if (req.user!.role !== 'admin' && db.alumniPosts[idx].alumniId !== req.user!.userId) {
    res.status(403).json({ error: 'You can only delete your own posts.' });
    return;
  }

  db.alumniPosts.splice(idx, 1);
  saveDatabase(db);
  res.json({ message: 'Opportunity post deleted.' });
});

apiRouter.post('/alumni/posts/:id/apply', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;

  const db = getDatabase();
  const post = db.alumniPosts.find(p => p.id === id);
  if (!post) {
    res.status(404).json({ error: 'Opportunity not found.' });
    return;
  }

  const user = req.user!;
  const alreadyApplied = post.applicants.some(a => a.studentId === user.userId);
  if (alreadyApplied) {
    res.status(400).json({ error: 'You have already applied for this opportunity.' });
    return;
  }

  post.applicants.push({
    studentId: user.userId,
    studentName: user.name,
    email: user.email,
    rollNumber: user.rollNumber || 'STD-001',
    note: note || '',
    appliedAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ message: 'Application submitted successfully! The alumni organizer has received your profile.' });
});

// ==========================================
// 14. LIVE CAMPUS CONTROL CENTER & STATS
// ==========================================

apiRouter.get('/live/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();

  const totalStudents = db.users.filter(u => u.role === 'student' && u.status === 'active').length;
  const totalFaculty = db.users.filter(u => u.role === 'faculty' && u.status === 'active').length;
  const totalSecurity = db.users.filter(u => u.role === 'security' && u.status === 'active').length;
  const totalWardens = db.users.filter(u => u.role === 'warden' && u.status === 'active').length;
  const totalAlumni = db.users.filter(u => u.role === 'alumni' && u.status === 'active').length;

  const pendingLeaves = db.leaveRequests.filter(l => l.status === 'pending').length;
  const pendingGatePasses = db.gatePasses.filter(g => g.status === 'pending').length;
  const openComplaints = db.complaints.filter(c => c.status !== 'resolved').length;
  const pendingAlumniPosts = db.alumniPosts.filter(p => p.status === 'pending').length;
  const pendingRegistrations = db.users.filter(u => u.status === 'pending').length;

  // Hostel stats
  let totalBeds = 0;
  let occupiedBeds = 0;
  db.hostels.forEach(h => {
    h.rooms.forEach(r => {
      totalBeds += r.capacity;
      occupiedBeds += r.occupied;
    });
  });

  res.json({
    users: {
      totalStudents,
      totalFaculty,
      totalSecurity,
      totalWardens,
      totalAlumni,
      pendingRegistrations
    },
    operations: {
      pendingLeaves,
      pendingGatePasses,
      openComplaints,
      pendingAlumniPosts,
      totalBeds,
      occupiedBeds,
      hostelOccupancyPercent: totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0
    },
    settings: db.settings
  });
});

apiRouter.get('/live/activity', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();

  // Combine gate activity + recent passes + complaints into unified stream
  const events: Array<{ id: string; time: string; message: string; type: string }> = [];

  db.gateActivity.slice(0, 10).forEach(g => {
    events.push({
      id: g.id,
      time: g.timestamp,
      message: `${g.studentName} recorded ${g.action.toUpperCase()} at ${g.gateNumber}`,
      type: g.action === 'entry' ? 'entry' : 'exit'
    });
  });

  db.leaveRequests.slice(0, 5).forEach(l => {
    events.push({
      id: l.id,
      time: l.createdAt,
      message: `${l.studentName} requested ${l.leaveType} leave (${l.status.toUpperCase()})`,
      type: 'leave'
    });
  });

  db.complaints.slice(0, 5).forEach(c => {
    events.push({
      id: c.id,
      time: c.createdAt,
      message: `New ticket ${c.ticketNumber} registered: ${c.subject}`,
      type: 'complaint'
    });
  });

  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  res.json({ events: events.slice(0, 20) });
});

// ==========================================
// 15. AI CAMPUS ASSISTANT
// ==========================================

apiRouter.post('/ai/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Query message is required.' });
    return;
  }

  try {
    const result = await processAICampusQuery(message, req.user!);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'AI Assistant failed to process query: ' + err.message });
  }
});

// ==========================================
// 16. CSV EXPORTS & SETTINGS
// ==========================================

apiRouter.get('/settings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ settings: db.settings });
});

apiRouter.put('/settings', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { attendanceWarningThreshold, complaintResolutionTargetDays, institutionName, curfewTime } = req.body;
  const db = getDatabase();

  if (attendanceWarningThreshold !== undefined) {
    db.settings.attendanceWarningThreshold = Number(attendanceWarningThreshold);
  }
  if (complaintResolutionTargetDays !== undefined) {
    db.settings.complaintResolutionTargetDays = Number(complaintResolutionTargetDays);
  }
  if (institutionName) db.settings.institutionName = institutionName;
  if (curfewTime) db.settings.curfewTime = curfewTime;

  saveDatabase(db);
  res.json({ message: 'Institutional settings updated successfully.', settings: db.settings });
});

apiRouter.get('/reports/export/:type', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.params;
  const db = getDatabase();

  let csv = '';
  let filename = `campus_nexus_${type}_${Date.now()}.csv`;

  if (type === 'attendance') {
    csv = 'Date,Subject Code,Subject Name,Faculty,Student Name,Roll Number,Status\n';
    db.attendance.forEach(session => {
      session.studentRecords.forEach(rec => {
        csv += `"${session.date}","${session.subjectCode}","${session.subjectName}","${session.facultyName}","${rec.studentName}","${rec.rollNumber}","${rec.status}"\n`;
      });
    });
  } else if (type === 'gatepasses') {
    csv = 'Pass Code,Student Name,Roll Number,Destination,Reason,Exit Time,Return Time,Status\n';
    db.gatePasses.forEach(g => {
      csv += `"${g.passCode}","${g.studentName}","${g.rollNumber}","${g.destination}","${g.reason}","${g.exitTime}","${g.expectedReturnTime}","${g.status}"\n`;
    });
  } else if (type === 'complaints') {
    csv = 'Ticket Number,Category,Priority,Student Name,Subject,Status,Created At,Resolved At\n';
    db.complaints.forEach(c => {
      csv += `"${c.ticketNumber}","${c.category}","${c.priority}","${c.studentName}","${c.subject}","${c.status}","${c.createdAt}","${c.resolvedAt || ''}"\n`;
    });
  } else if (type === 'users') {
    csv = 'Name,Email,Role,Status,Department,Roll/Staff ID,Created At\n';
    db.users.forEach(u => {
      csv += `"${u.name}","${u.email}","${u.role}","${u.status}","${u.department || ''}","${u.rollNumber || u.staffId || ''}","${u.createdAt}"\n`;
    });
  } else {
    res.status(400).json({ error: 'Invalid report type.' });
    return;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});
