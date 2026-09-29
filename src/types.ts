export type UserRole = 'admin' | 'faculty' | 'security' | 'warden' | 'student' | 'alumni';

export type StudentBranch = 'B.Tech' | 'MBA' | 'MCA';

export interface BranchInfo {
  code: StudentBranch;
  name: string;
  durationYears: number;
  totalSemesters: number;
  departments: string[];
}

export const SUPPORTED_BRANCHES: Record<StudentBranch, BranchInfo> = {
  'B.Tech': {
    code: 'B.Tech',
    name: 'Bachelor of Technology',
    durationYears: 4,
    totalSemesters: 8,
    departments: [
      'Computer Science & Engineering',
      'Electronics & Communication Engineering',
      'Information Technology',
      'Mechanical Engineering'
    ]
  },
  'MBA': {
    code: 'MBA',
    name: 'Master of Business Administration',
    durationYears: 2,
    totalSemesters: 4,
    departments: [
      'Management & Business Administration',
      'Finance & Corporate Strategy',
      'Marketing & Digital Communications',
      'Operations & Business Analytics'
    ]
  },
  'MCA': {
    code: 'MCA',
    name: 'Master of Computer Applications',
    durationYears: 2,
    totalSemesters: 4,
    departments: [
      'Computer Applications & Software Systems',
      'Data Science & Cloud Computing',
      'Advanced Web & Mobile Computing'
    ]
  }
};

export function detectBranch(course?: string, department?: string, rollNumber?: string): StudentBranch {
  const str = `${course || ''} ${department || ''} ${rollNumber || ''}`.toUpperCase();
  if (str.includes('MBA') || str.includes('MANAGEMENT') || str.includes('BUSINESS')) return 'MBA';
  if (str.includes('MCA') || str.includes('APPLICATION')) return 'MCA';
  return 'B.Tech';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'pending' | 'inactive';
  department?: string;
  rollNumber?: string;
  staffId?: string;
  phone?: string;
  course?: string;
  year?: number;
  semester?: number;
  graduationYear?: number;
  designation?: string;
  company?: string;
  hostelId?: string;
  roomNumber?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  department: string;
  semester: number;
  date: string;
  timeSlot: string;
  studentRecords: Array<{
    studentId: string;
    studentName: string;
    rollNumber: string;
    status: 'present' | 'absent' | 'late';
  }>;
}

export interface StudentAttendanceSummary {
  summary: {
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
    isBelowThreshold: boolean;
    threshold: number;
  };
  subjectWise: Array<{
    code: string;
    name: string;
    total: number;
    present: number;
    percentage: number;
  }>;
  history: Array<{
    id: string;
    date: string;
    timeSlot: string;
    subjectCode: string;
    subjectName: string;
    facultyName: string;
    status: 'present' | 'absent' | 'late';
  }>;
}

export interface TimetableEntry {
  id: string;
  department: string;
  semester: number;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  leaveType: 'Medical' | 'Personal' | 'Academic' | 'Family Emergency' | 'Other';
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  comments?: string;
  createdAt: string;
}

export interface GatePass {
  id: string;
  passCode: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  hostelName?: string;
  roomNumber?: string;
  exitTime: string;
  expectedReturnTime: string;
  reason: string;
  destination: string;
  status: 'pending' | 'approved' | 'rejected' | 'used' | 'expired';
  approvedBy?: string;
  approverName?: string;
  approvedAt?: string;
  entryRecordedAt?: string;
  exitRecordedAt?: string;
  qrPayload: string;
  createdAt: string;
  usageLogs?: Array<{
    action: 'exit' | 'entry' | 'denied';
    timestamp: string;
    securityName: string;
    notes?: string;
  }>;
}

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  certificateType: 'Bonafide' | 'Character' | 'Transfer' | 'Course Completion' | 'No Objection Certificate (NOC)';
  purpose: string;
  status: 'pending' | 'processing' | 'issued' | 'rejected';
  issuedAt?: string;
  certificateNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface HostelRoom {
  roomNumber: string;
  floor: number;
  capacity: number;
  occupied: number;
  occupantIds: string[];
  occupants?: Array<{
    id: string;
    name: string;
    rollNumber: string;
    department?: string;
    email?: string;
    phone?: string;
  }>;
}

export interface HostelResident {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  course: string;
  year: number;
  semester: number;
  email: string;
  phone: string;
  hostelId: string | null;
  hostelName: string | null;
  roomNumber: string | null;
  isAllocated: boolean;
}

export interface Hostel {
  id: string;
  name: string;
  type: 'Boys' | 'Girls';
  wardenId: string;
  wardenName: string;
  totalRooms: number;
  rooms: HostelRoom[];
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  category: 'hostel' | 'classroom' | 'internet' | 'mess' | 'maintenance' | 'security' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'assigned' | 'in_progress' | 'resolved';
  assignedToName?: string;
  resolutionTargetDate: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface MessMenuDay {
  dayOfWeek: string;
  breakfast: string[];
  lunch: string[];
  snacks: string[];
  dinner: string[];
  specialItem?: string;
}

export interface MessFeedback {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'hostel' | 'event' | 'urgent' | 'general' | 'placement';
  targetAudience: 'all' | 'students' | 'faculty' | 'wardens' | 'hostelers';
  publishedById: string;
  publishedByName: string;
  publishedRole: string;
  isPinned: boolean;
  createdAt: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  semester: number;
  feeType: 'Tuition Fee' | 'Hostel & Mess' | 'Examination Fee' | 'Library & Lab' | 'Development Fund';
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'pending';
  receiptNumber?: string;
  paidAt?: string;
}

export interface AlumniPost {
  id: string;
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  graduationYear: number;
  company: string;
  designation: string;
  type: 'job' | 'internship' | 'workshop' | 'event' | 'mentoring';
  title: string;
  description: string;
  requirements: string[];
  location: string;
  stipendOrSalary?: string;
  deadline: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  applicants: Array<{
    studentId: string;
    studentName: string;
    email: string;
    rollNumber: string;
    note: string;
    appliedAt: string;
  }>;
}

export interface GateActivity {
  id: string;
  passId?: string;
  passCode: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  action: 'exit' | 'entry' | 'denied';
  timestamp: string;
  securityStaffName: string;
  gateNumber: string;
  valid: boolean;
  remarks?: string;
}

export interface CampusNotification {
  id: string;
  targetRoleOrId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
  readBy: string[];
  createdAt: string;
}

export interface LiveStats {
  users: {
    totalStudents: number;
    totalFaculty: number;
    totalSecurity: number;
    totalWardens: number;
    totalAlumni: number;
    pendingRegistrations: number;
  };
  operations: {
    pendingLeaves: number;
    pendingGatePasses: number;
    openComplaints: number;
    pendingAlumniPosts: number;
    totalBeds: number;
    occupiedBeds: number;
    hostelOccupancyPercent: number;
  };
  settings: {
    attendanceWarningThreshold: number;
    complaintResolutionTargetDays: number;
    institutionName: string;
    academicYear: string;
    currentSemester: number;
    curfewTime: string;
  };
}
