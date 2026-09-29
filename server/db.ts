import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'faculty' | 'security' | 'warden' | 'student' | 'alumni';
  status: 'active' | 'pending' | 'inactive';
  department?: string;
  rollNumber?: string;
  staffId?: string;
  phone?: string;
  avatar?: string;
  course?: string;
  semester?: number;
  year?: number;
  graduationYear?: number;
  hostelId?: string;
  roomNumber?: string;
  designation?: string;
  company?: string;
  createdAt: string;
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
  usageLogs: Array<{
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
  }>;
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
  reviewedBy?: string;
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
  targetRoleOrId: string; // 'all' or 'role:admin' or user id
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
  readBy: string[];
  createdAt: string;
}

export interface InstitutionalSettings {
  attendanceWarningThreshold: number; // default 75%
  complaintResolutionTargetDays: number; // default 3 days
  institutionName: string;
  academicYear: string;
  currentSemester: number;
  curfewTime: string;
}

export interface DatabaseSchema {
  users: User[];
  attendance: AttendanceRecord[];
  timetable: TimetableEntry[];
  leaveRequests: LeaveRequest[];
  gatePasses: GatePass[];
  certificates: CertificateRequest[];
  hostels: Hostel[];
  complaints: Complaint[];
  messMenu: MessMenuDay[];
  messFeedback: MessFeedback[];
  notices: Notice[];
  fees: FeeRecord[];
  alumniPosts: AlumniPost[];
  gateActivity: GateActivity[];
  notifications: CampusNotification[];
  settings: InstitutionalSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'campus_db.json');

// Simple deterministic hash for demo / prototype
export function hashPassword(plain: string): string {
  let hash = 0;
  for (let i = 0; i < plain.length; i++) {
    const char = plain.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'pw_' + Math.abs(hash).toString(16) + '_' + plain.slice(0, 3);
}

function getInitialDatabase(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'usr_admin_1',
      name: 'Dr. Rajesh Kulkarni',
      email: 'admin@campusnexus.edu',
      passwordHash: hashPassword('Admin@123'),
      role: 'admin',
      status: 'active',
      department: 'Administration',
      staffId: 'ADM-001',
      phone: '+91 98765 43210',
      designation: 'Registrar & Chief Administrator',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_faculty_1',
      name: 'Prof. Ananya Sharma',
      email: 'faculty.sharma@campusnexus.edu',
      passwordHash: hashPassword('Faculty@123'),
      role: 'faculty',
      status: 'active',
      department: 'Computer Science & Engineering',
      staffId: 'FAC-CSE-012',
      phone: '+91 98765 43211',
      designation: 'Associate Professor & HOD',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_security_1',
      name: 'Officer Vikram Rathore',
      email: 'security.gate1@campusnexus.edu',
      passwordHash: hashPassword('Security@123'),
      role: 'security',
      status: 'active',
      department: 'Campus Security & Vigilance',
      staffId: 'SEC-G1-004',
      phone: '+91 98765 43212',
      designation: 'Main Gate Supervisor',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_warden_1',
      name: 'Dr. Mahendra Singh',
      email: 'warden.singh@campusnexus.edu',
      passwordHash: hashPassword('Warden@123'),
      role: 'warden',
      status: 'active',
      department: 'Student Affairs & Hostel Board',
      staffId: 'WRD-H1-002',
      phone: '+91 98765 43213',
      designation: 'Chief Hostel Warden',
      hostelId: 'hostel_b1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_student_1',
      name: 'Aarav Patel',
      email: 'student.aarav@campusnexus.edu',
      passwordHash: hashPassword('Student@123'),
      role: 'student',
      status: 'active',
      department: 'Computer Science & Engineering',
      rollNumber: 'CSE-2023-042',
      course: 'B.Tech Computer Science',
      year: 3,
      semester: 5,
      phone: '+91 98765 43214',
      hostelId: 'hostel_b1',
      roomNumber: 'A-204',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_student_2',
      name: 'Sneha Iyer',
      email: 'sneha.iyer@campusnexus.edu',
      passwordHash: hashPassword('Student@123'),
      role: 'student',
      status: 'active',
      department: 'Computer Science & Engineering',
      rollNumber: 'CSE-2023-089',
      course: 'B.Tech Computer Science',
      year: 3,
      semester: 5,
      phone: '+91 98765 43215',
      hostelId: 'hostel_g1',
      roomNumber: 'B-108',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_student_3',
      name: 'Rohan Verma',
      email: 'rohan.verma@campusnexus.edu',
      passwordHash: hashPassword('Student@123'),
      role: 'student',
      status: 'active',
      department: 'Computer Science & Engineering',
      rollNumber: 'CSE-2023-115',
      course: 'B.Tech Computer Science',
      year: 3,
      semester: 5,
      phone: '+91 98765 43217',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_student_4',
      name: 'Meera Deshmukh',
      email: 'meera.deshmukh@campusnexus.edu',
      passwordHash: hashPassword('Student@123'),
      role: 'student',
      status: 'active',
      department: 'Electronics & Communication',
      rollNumber: 'ECE-2023-054',
      course: 'B.Tech Electronics',
      year: 3,
      semester: 5,
      phone: '+91 98765 43218',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_student_mba_1',
      name: 'Tanya Mehra',
      email: 'student.tanya.mba@campusnexus.edu',
      passwordHash: hashPassword('Student@123'),
      role: 'student',
      status: 'active',
      department: 'Management & Business Administration',
      rollNumber: 'MBA-2024-018',
      course: 'MBA',
      year: 2,
      semester: 3,
      phone: '+91 98765 43220',
      hostelId: 'hostel_g1',
      roomNumber: 'B-102',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_student_mca_1',
      name: 'Kunal Saxena',
      email: 'student.kunal.mca@campusnexus.edu',
      passwordHash: hashPassword('Student@123'),
      role: 'student',
      status: 'active',
      department: 'Computer Applications & Software Systems',
      rollNumber: 'MCA-2024-035',
      course: 'MCA',
      year: 2,
      semester: 3,
      phone: '+91 98765 43221',
      hostelId: 'hostel_b1',
      roomNumber: 'A-203',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_alumni_1',
      name: 'Priya Nambiar',
      email: 'alumni.priya@campusnexus.edu',
      passwordHash: hashPassword('Alumni@123'),
      role: 'alumni',
      status: 'active',
      department: 'Computer Science & Engineering',
      graduationYear: 2021,
      company: 'Databricks AI Labs',
      designation: 'Senior Distributed Systems Engineer',
      phone: '+91 98765 43216',
      createdAt: new Date().toISOString()
    }
  ];

  const hostels: Hostel[] = [
    {
      id: 'hostel_b1',
      name: 'Aryabhata Hall of Residence (Boys)',
      type: 'Boys',
      wardenId: 'usr_warden_1',
      wardenName: 'Dr. Mahendra Singh',
      totalRooms: 120,
      rooms: [
        { roomNumber: 'A-201', floor: 2, capacity: 2, occupied: 0, occupantIds: [] },
        { roomNumber: 'A-202', floor: 2, capacity: 2, occupied: 0, occupantIds: [] },
        { roomNumber: 'A-203', floor: 2, capacity: 2, occupied: 0, occupantIds: [] },
        { roomNumber: 'A-204', floor: 2, capacity: 2, occupied: 1, occupantIds: ['usr_student_1'] },
        { roomNumber: 'A-205', floor: 2, capacity: 2, occupied: 0, occupantIds: [] },
        { roomNumber: 'A-206', floor: 2, capacity: 2, occupied: 0, occupantIds: [] },
        { roomNumber: 'B-301', floor: 3, capacity: 3, occupied: 0, occupantIds: [] },
        { roomNumber: 'B-302', floor: 3, capacity: 3, occupied: 0, occupantIds: [] }
      ]
    },
    {
      id: 'hostel_g1',
      name: 'Gargi Hall of Residence (Girls)',
      type: 'Girls',
      wardenId: 'usr_warden_1',
      wardenName: 'Dr. Mahendra Singh',
      totalRooms: 110,
      rooms: [
        { roomNumber: 'B-101', floor: 1, capacity: 2, occupied: 0, occupantIds: [] },
        { roomNumber: 'B-102', floor: 1, capacity: 2, occupied: 0, occupantIds: [] },
        { roomNumber: 'B-108', floor: 1, capacity: 2, occupied: 1, occupantIds: ['usr_student_2'] },
        { roomNumber: 'B-201', floor: 2, capacity: 2, occupied: 0, occupantIds: [] }
      ]
    }
  ];

  const timetable: TimetableEntry[] = [
    {
      id: 'tt_1',
      department: 'Computer Science & Engineering',
      semester: 5,
      dayOfWeek: 'Monday',
      timeSlot: '09:00 - 10:00',
      subjectCode: 'CS501',
      subjectName: 'Distributed Systems & Cloud Computing',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'Lecture Hall 302'
    },
    {
      id: 'tt_2',
      department: 'Computer Science & Engineering',
      semester: 5,
      dayOfWeek: 'Monday',
      timeSlot: '10:15 - 11:15',
      subjectCode: 'CS502',
      subjectName: 'Artificial Intelligence & Machine Learning',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'Lecture Hall 302'
    },
    {
      id: 'tt_3',
      department: 'Computer Science & Engineering',
      semester: 5,
      dayOfWeek: 'Monday',
      timeSlot: '11:30 - 12:30',
      subjectCode: 'CS503',
      subjectName: 'Compiler Design',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'Computing Lab 4'
    },
    {
      id: 'tt_4',
      department: 'Computer Science & Engineering',
      semester: 5,
      dayOfWeek: 'Tuesday',
      timeSlot: '09:00 - 10:00',
      subjectCode: 'CS504',
      subjectName: 'Database Engineering & Scaling',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'Lecture Hall 302'
    },
    {
      id: 'tt_5',
      department: 'Computer Science & Engineering',
      semester: 5,
      dayOfWeek: 'Wednesday',
      timeSlot: '14:00 - 16:00',
      subjectCode: 'CS505P',
      subjectName: 'Cloud & AI Practical Lab',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'High Performance Computing Lab'
    },
    // MBA Department Timetable
    {
      id: 'tt_mba_1',
      department: 'Management & Business Administration',
      semester: 3,
      dayOfWeek: 'Monday',
      timeSlot: '10:00 - 11:30',
      subjectCode: 'MBA201',
      subjectName: 'Financial Management & Corporate Valuation',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'Management Hall 101'
    },
    {
      id: 'tt_mba_2',
      department: 'Management & Business Administration',
      semester: 3,
      dayOfWeek: 'Tuesday',
      timeSlot: '11:45 - 13:15',
      subjectCode: 'MBA202',
      subjectName: 'Strategic Marketing & Brand Leadership',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'Management Hall 101'
    },
    {
      id: 'tt_mba_3',
      department: 'Management & Business Administration',
      semester: 3,
      dayOfWeek: 'Thursday',
      timeSlot: '14:00 - 15:30',
      subjectCode: 'MBA203',
      subjectName: 'Operations Research & Business Analytics',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'Executive Boardroom B'
    },
    // MCA Department Timetable
    {
      id: 'tt_mca_1',
      department: 'Computer Applications & Software Systems',
      semester: 3,
      dayOfWeek: 'Monday',
      timeSlot: '09:00 - 10:30',
      subjectCode: 'MCA201',
      subjectName: 'Advanced Full-Stack Web & Microservices Architecture',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'MCA Computing Lab 2'
    },
    {
      id: 'tt_mca_2',
      department: 'Computer Applications & Software Systems',
      semester: 3,
      dayOfWeek: 'Wednesday',
      timeSlot: '11:00 - 12:30',
      subjectCode: 'MCA202',
      subjectName: 'Enterprise Cloud Infrastructure & DevOps',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'Cloud Systems Lab'
    },
    {
      id: 'tt_mca_3',
      department: 'Computer Applications & Software Systems',
      semester: 3,
      dayOfWeek: 'Friday',
      timeSlot: '14:00 - 16:00',
      subjectCode: 'MCA203',
      subjectName: 'Machine Learning & Big Data Analytics',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      roomNumber: 'AI Innovation Center'
    }
  ];

  const attendance: AttendanceRecord[] = [
    {
      id: 'att_1',
      classId: 'CS501_S5_20260925',
      className: 'B.Tech CSE - Sem 5',
      subjectCode: 'CS501',
      subjectName: 'Distributed Systems & Cloud Computing',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      department: 'Computer Science & Engineering',
      semester: 5,
      date: '2026-09-25',
      timeSlot: '09:00 - 10:00',
      studentRecords: [
        { studentId: 'usr_student_1', studentName: 'Aarav Patel', rollNumber: 'CSE-2023-042', status: 'present' },
        { studentId: 'usr_student_2', studentName: 'Sneha Iyer', rollNumber: 'CSE-2023-089', status: 'present' }
      ]
    },
    {
      id: 'att_2',
      classId: 'CS502_S5_20260926',
      className: 'B.Tech CSE - Sem 5',
      subjectCode: 'CS502',
      subjectName: 'Artificial Intelligence & Machine Learning',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      department: 'Computer Science & Engineering',
      semester: 5,
      date: '2026-09-26',
      timeSlot: '10:15 - 11:15',
      studentRecords: [
        { studentId: 'usr_student_1', studentName: 'Aarav Patel', rollNumber: 'CSE-2023-042', status: 'present' },
        { studentId: 'usr_student_2', studentName: 'Sneha Iyer', rollNumber: 'CSE-2023-089', status: 'present' }
      ]
    },
    {
      id: 'att_3',
      classId: 'CS501_S5_20260928',
      className: 'B.Tech CSE - Sem 5',
      subjectCode: 'CS501',
      subjectName: 'Distributed Systems & Cloud Computing',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      department: 'Computer Science & Engineering',
      semester: 5,
      date: '2026-09-28',
      timeSlot: '09:00 - 10:00',
      studentRecords: [
        { studentId: 'usr_student_1', studentName: 'Aarav Patel', rollNumber: 'CSE-2023-042', status: 'present' },
        { studentId: 'usr_student_2', studentName: 'Sneha Iyer', rollNumber: 'CSE-2023-089', status: 'absent' }
      ]
    },
    // MBA Attendance Sessions
    {
      id: 'att_mba_1',
      classId: 'MBA201_S3_20260925',
      className: 'MBA - Semester 3',
      subjectCode: 'MBA201',
      subjectName: 'Financial Management & Corporate Valuation',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      department: 'Management & Business Administration',
      semester: 3,
      date: '2026-09-25',
      timeSlot: '10:00 - 11:30',
      studentRecords: [
        { studentId: 'usr_student_mba_1', studentName: 'Tanya Mehra', rollNumber: 'MBA-2024-018', status: 'present' }
      ]
    },
    {
      id: 'att_mba_2',
      classId: 'MBA202_S3_20260926',
      className: 'MBA - Semester 3',
      subjectCode: 'MBA202',
      subjectName: 'Strategic Marketing & Brand Leadership',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      department: 'Management & Business Administration',
      semester: 3,
      date: '2026-09-26',
      timeSlot: '11:45 - 13:15',
      studentRecords: [
        { studentId: 'usr_student_mba_1', studentName: 'Tanya Mehra', rollNumber: 'MBA-2024-018', status: 'present' }
      ]
    },
    // MCA Attendance Sessions
    {
      id: 'att_mca_1',
      classId: 'MCA201_S3_20260925',
      className: 'MCA - Semester 3',
      subjectCode: 'MCA201',
      subjectName: 'Advanced Full-Stack Web & Microservices Architecture',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      department: 'Computer Applications & Software Systems',
      semester: 3,
      date: '2026-09-25',
      timeSlot: '09:00 - 10:30',
      studentRecords: [
        { studentId: 'usr_student_mca_1', studentName: 'Kunal Saxena', rollNumber: 'MCA-2024-035', status: 'present' },
        { studentId: 'usr_student_1790671798967', studentName: 'janmejaya das', rollNumber: 'mca0034', status: 'present' }
      ]
    },
    {
      id: 'att_mca_2',
      classId: 'MCA202_S3_20260926',
      className: 'MCA - Semester 3',
      subjectCode: 'MCA202',
      subjectName: 'Enterprise Cloud Infrastructure & DevOps',
      facultyId: 'usr_faculty_1',
      facultyName: 'Prof. Ananya Sharma',
      department: 'Computer Applications & Software Systems',
      semester: 3,
      date: '2026-09-26',
      timeSlot: '11:00 - 12:30',
      studentRecords: [
        { studentId: 'usr_student_mca_1', studentName: 'Kunal Saxena', rollNumber: 'MCA-2024-035', status: 'present' },
        { studentId: 'usr_student_1790671798967', studentName: 'janmejaya das', rollNumber: 'mca0034', status: 'present' }
      ]
    }
  ];

  const gatePasses: GatePass[] = [
    {
      id: 'gp_1',
      passCode: 'CN-GP-84920',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      department: 'Computer Science & Engineering',
      hostelName: 'Aryabhata Hall',
      roomNumber: 'A-204',
      exitTime: '2026-09-29T16:00:00.000Z',
      expectedReturnTime: '2026-09-29T20:30:00.000Z',
      reason: 'Visit City Research Library and Technical Bookstore',
      destination: 'Central City Library, Sector 18',
      status: 'approved',
      approvedBy: 'usr_warden_1',
      approverName: 'Dr. Mahendra Singh',
      approvedAt: '2026-09-29T08:30:00.000Z',
      qrPayload: JSON.stringify({
        passCode: 'CN-GP-84920',
        studentId: 'usr_student_1',
        rollNumber: 'CSE-2023-042',
        studentName: 'Aarav Patel',
        validUntil: '2026-09-29T20:30:00.000Z'
      }),
      createdAt: '2026-09-29T08:00:00.000Z',
      usageLogs: []
    }
  ];

  const leaveRequests: LeaveRequest[] = [
    {
      id: 'lr_1',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      department: 'Computer Science & Engineering',
      leaveType: 'Academic',
      fromDate: '2026-10-05',
      toDate: '2026-10-07',
      reason: 'Attending National Autonomous Systems Hackathon at IIT Bombay',
      status: 'approved',
      reviewedBy: 'usr_faculty_1',
      reviewerName: 'Prof. Ananya Sharma',
      reviewedAt: '2026-09-28T14:20:00.000Z',
      comments: 'Approved. Ensure submission of conference report upon return.',
      createdAt: '2026-09-28T09:15:00.000Z'
    }
  ];

  const certificates: CertificateRequest[] = [
    {
      id: 'cert_1',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      department: 'Computer Science & Engineering',
      certificateType: 'Bonafide',
      purpose: 'Passport Renewal and National Identity Verification',
      status: 'issued',
      issuedAt: '2026-09-27T11:00:00.000Z',
      certificateNumber: 'CN-BONA-2026-0914',
      notes: 'Digitally verified and stamped by Registrar Office.',
      createdAt: '2026-09-26T10:00:00.000Z'
    }
  ];

  const complaints: Complaint[] = [
    {
      id: 'cmp_1',
      ticketNumber: 'TKT-NET-2026-081',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      category: 'internet',
      subject: 'Wi-Fi Access Point Frequent Disconnections in Aryabhata Block A',
      description: 'Hostel block A 2nd floor access point drops packet rate during peak study hours between 8 PM to 11 PM.',
      priority: 'high',
      status: 'in_progress',
      assignedToName: 'Campus IT Network Cell',
      resolutionTargetDate: '2026-10-01',
      resolutionNotes: 'Switch port reset performed. New dual-band antenna scheduled for replacement.',
      createdAt: '2026-09-27T16:45:00.000Z'
    }
  ];

  const messMenu: MessMenuDay[] = [
    {
      dayOfWeek: 'Monday',
      breakfast: ['Idli Sambar', 'Coconut Chutney', 'Boiled Eggs / Bananas', 'Tea & Coffee'],
      lunch: ['Steamed Rice', 'Dal Tadka', 'Paneer Butter Masala', 'Chapati', 'Cucumber Raita'],
      snacks: ['Samosa / Poha', 'Mint Dip', 'Masala Tea'],
      dinner: ['Jeera Rice', 'Rajma Masala', 'Aloo Gobi', 'Warm Roti', 'Gulab Jamun'],
      specialItem: 'Fresh Watermelon Juice'
    },
    {
      dayOfWeek: 'Tuesday',
      breakfast: ['Poha & Sev', 'Sprouted Moong', 'Omelette / Fruit Bowl', 'Filter Coffee'],
      lunch: ['Basmati Rice', 'Kadhi Pakora', 'Bhindi Masala', 'Phulka', 'Boondi Raita'],
      snacks: ['Veg Cutlets', 'Green Chutney', 'Cardamom Tea'],
      dinner: ['Lemon Rice', 'Mix Veg Curry', 'Tadka Dal', 'Rotis', 'Kheer'],
      specialItem: 'Sweet Lassi'
    },
    {
      dayOfWeek: 'Wednesday',
      breakfast: ['Masala Dosa', 'Sambar', 'Tomato Chutney', 'Milk / Tea'],
      lunch: ['Fried Rice', 'Chilli Paneer / Chicken Curry', 'Sweet Corn Soup', 'Kimchi'],
      snacks: ['Biscuits & Veg Sandwich', 'Ginger Tea'],
      dinner: ['Rice', 'Dal Makhani', 'Shahi Paneer', 'Naan / Roti', 'Ice Cream'],
      specialItem: 'Chef Special Paneer Lababdar'
    },
    {
      dayOfWeek: 'Thursday',
      breakfast: ['Upma', 'Chana Masala', 'Boiled Eggs / Bananas', 'Coffee'],
      lunch: ['Rice', 'Sambar', 'Palak Paneer', 'Chapati', 'Papad'],
      snacks: ['Corn Chaat', 'Lemon Tea'],
      dinner: ['Vegetable Pulao', 'Kashmiri Dum Aloo', 'Yellow Dal', 'Roti', 'Fruit Custard']
    },
    {
      dayOfWeek: 'Friday',
      breakfast: ['Aloo Paratha with Curd', 'Pickle', 'Sprouts', 'Tea / Milk'],
      lunch: ['Hyderabadi Veg / Egg Biryani', 'Mirchi Ka Salan', 'Onion Raita', 'Sweet Halwa'],
      snacks: ['Bhel Puri', 'Tea'],
      dinner: ['Steamed Rice', 'Dal Fry', 'Malai Kofta', 'Phulka', 'Rasgulla'],
      specialItem: 'Special Hyderabadi Biryani'
    },
    {
      dayOfWeek: 'Saturday',
      breakfast: ['Uttapam', 'Sambar', 'Chutney', 'Tea & Coffee'],
      lunch: ['Rice', 'Chole Masala', 'Bhature / Roti', 'Pulao', 'Sirka Onion Salad'],
      snacks: ['Dhokla', 'Chutney', 'Tea'],
      dinner: ['Khichdi / Rice', 'Moong Dal', 'Baingan Bharta', 'Papad', 'Moong Dal Halwa']
    },
    {
      dayOfWeek: 'Sunday',
      breakfast: ['Poori Bhaji', 'Halwa', 'Fresh Seasonal Fruits', 'Special Masala Chai'],
      lunch: ['Special Feast: Jeera Rice', 'Paneer Tikka Masala', 'Chicken Biryani', 'Raita', 'Gulab Jamun'],
      snacks: ['Pasta', 'Cold Coffee'],
      dinner: ['Light Rice', 'Dal Palak', 'Mixed Seasonal Veg', 'Phulka', 'Warm Milk']
    }
  ];

  const messFeedback: MessFeedback[] = [
    {
      id: 'mf_1',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      date: '2026-09-28',
      mealType: 'lunch',
      rating: 4,
      comment: 'Paneer gravy was fresh and warm. Overall meal quality is consistent.',
      createdAt: '2026-09-28T13:30:00.000Z'
    }
  ];

  const notices: Notice[] = [
    {
      id: 'nt_1',
      title: 'Mid-Semester Examination Schedule Autumn 2026 Released',
      content: 'The detailed timetable for Autumn 2026 mid-semester examinations across all departments has been published on the institutional portal. Examinations commence on October 12, 2026.',
      category: 'academic',
      targetAudience: 'all',
      publishedById: 'usr_admin_1',
      publishedByName: 'Dr. Rajesh Kulkarni (Registrar)',
      publishedRole: 'admin',
      isPinned: true,
      createdAt: '2026-09-28T09:00:00.000Z'
    },
    {
      id: 'nt_2',
      title: 'Hostel Maintenance & Water Conservation Inspection',
      content: 'Scheduled preventive maintenance of solar water heating systems in Aryabhata and Gargi halls will be conducted on Saturday between 10:00 AM and 2:00 PM.',
      category: 'hostel',
      targetAudience: 'hostelers',
      publishedById: 'usr_warden_1',
      publishedByName: 'Dr. Mahendra Singh (Chief Warden)',
      publishedRole: 'warden',
      isPinned: false,
      createdAt: '2026-09-27T14:00:00.000Z'
    },
    {
      id: 'nt_3',
      title: 'Campus Hackathon & Alumni AI Mentorship Workshop',
      content: 'Distinguished alumnus Priya Nambiar (Databricks AI Labs) will conduct a practical workshop on Building Large-Scale Distributed RAG Systems on October 3, 2026.',
      category: 'placement',
      targetAudience: 'students',
      publishedById: 'usr_admin_1',
      publishedByName: 'Dr. Rajesh Kulkarni',
      publishedRole: 'admin',
      isPinned: true,
      createdAt: '2026-09-29T07:30:00.000Z'
    }
  ];

  const fees: FeeRecord[] = [
    {
      id: 'fee_1',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      semester: 5,
      feeType: 'Tuition Fee',
      amount: 65000,
      paidAmount: 65000,
      dueDate: '2026-08-15',
      status: 'paid',
      receiptNumber: 'REC-TUI-2026-4401',
      paidAt: '2026-08-10T14:32:00.000Z'
    },
    {
      id: 'fee_2',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      semester: 5,
      feeType: 'Hostel & Mess',
      amount: 32000,
      paidAmount: 32000,
      dueDate: '2026-08-20',
      status: 'paid',
      receiptNumber: 'REC-HST-2026-1092',
      paidAt: '2026-08-12T11:15:00.000Z'
    },
    {
      id: 'fee_3',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      semester: 5,
      feeType: 'Examination Fee',
      amount: 4500,
      paidAmount: 0,
      dueDate: '2026-10-05',
      status: 'pending'
    },
    // MBA Student Fees
    {
      id: 'fee_mba_1',
      studentId: 'usr_student_mba_1',
      studentName: 'Tanya Mehra',
      rollNumber: 'MBA-2024-018',
      semester: 3,
      feeType: 'Tuition Fee',
      amount: 85000,
      paidAmount: 85000,
      dueDate: '2026-08-15',
      status: 'paid',
      receiptNumber: 'REC-MBA-2026-102',
      paidAt: '2026-08-11T12:00:00.000Z'
    },
    {
      id: 'fee_mba_2',
      studentId: 'usr_student_mba_1',
      studentName: 'Tanya Mehra',
      rollNumber: 'MBA-2024-018',
      semester: 3,
      feeType: 'Hostel & Mess',
      amount: 32000,
      paidAmount: 32000,
      dueDate: '2026-08-20',
      status: 'paid',
      receiptNumber: 'REC-HST-2026-2101',
      paidAt: '2026-08-12T14:10:00.000Z'
    },
    // MCA Student Fees
    {
      id: 'fee_mca_1',
      studentId: 'usr_student_mca_1',
      studentName: 'Kunal Saxena',
      rollNumber: 'MCA-2024-035',
      semester: 3,
      feeType: 'Tuition Fee',
      amount: 55000,
      paidAmount: 55000,
      dueDate: '2026-08-15',
      status: 'paid',
      receiptNumber: 'REC-MCA-2026-204',
      paidAt: '2026-08-12T10:30:00.000Z'
    },
    {
      id: 'fee_mca_2',
      studentId: 'usr_student_1790671798967',
      studentName: 'janmejaya das',
      rollNumber: 'mca0034',
      semester: 1,
      feeType: 'Tuition Fee',
      amount: 55000,
      paidAmount: 55000,
      dueDate: '2026-08-15',
      status: 'paid',
      receiptNumber: 'REC-MCA-2026-309',
      paidAt: '2026-08-15T15:00:00.000Z'
    }
  ];

  const alumniPosts: AlumniPost[] = [
    {
      id: 'alp_1',
      alumniId: 'usr_alumni_1',
      alumniName: 'Priya Nambiar',
      alumniEmail: 'alumni.priya@campusnexus.edu',
      graduationYear: 2021,
      company: 'Databricks AI Labs',
      designation: 'Senior Distributed Systems Engineer',
      type: 'workshop',
      title: 'Hands-on Masterclass: Architecting Production RAG & Vector Databases',
      description: 'A 3-hour deep-dive interactive lab on low-latency embeddings, semantic search caching, and scaling vector indexing in enterprise clusters. Open to 3rd & 4th year CSE/ECE students.',
      requirements: ['Basic Python proficiency', 'Familiarity with REST APIs', 'Laptop with Docker installed'],
      location: 'Seminar Hall 1 & Online Hybrid',
      deadline: '2026-10-02',
      status: 'approved',
      reviewedBy: 'usr_admin_1',
      createdAt: '2026-09-28T12:00:00.000Z',
      applicants: [
        {
          studentId: 'usr_student_1',
          studentName: 'Aarav Patel',
          email: 'student.aarav@campusnexus.edu',
          rollNumber: 'CSE-2023-042',
          note: 'Working on distributed query caching for our capstone project.',
          appliedAt: '2026-09-28T15:20:00.000Z'
        }
      ]
    },
    {
      id: 'alp_2',
      alumniId: 'usr_alumni_1',
      alumniName: 'Priya Nambiar',
      alumniEmail: 'alumni.priya@campusnexus.edu',
      graduationYear: 2021,
      company: 'Databricks AI Labs',
      designation: 'Senior Distributed Systems Engineer',
      type: 'internship',
      title: 'Systems & Cloud Infrastructure Summer Internship 2027',
      description: 'Join our Core Runtime team building next-generation distributed execution engines. 6-month stipend-backed internship with pre-placement offer opportunity for top performers.',
      requirements: ['Strong C++ or Go/Rust foundation', 'Operating Systems fundamentals', 'CGPA >= 7.5'],
      location: 'Bengaluru / Hybrid',
      stipendOrSalary: '₹85,000 / month',
      deadline: '2026-10-25',
      status: 'approved',
      reviewedBy: 'usr_admin_1',
      createdAt: '2026-09-28T13:30:00.000Z',
      applicants: []
    }
  ];

  const gateActivity: GateActivity[] = [
    {
      id: 'ga_1',
      passCode: 'CN-GP-84920',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      action: 'exit',
      timestamp: '2026-09-28T17:15:00.000Z',
      securityStaffName: 'Officer Vikram Rathore',
      gateNumber: 'Main Gate 1',
      valid: true,
      remarks: 'Biometric & QR Pass Verified. Student departed on time.'
    },
    {
      id: 'ga_2',
      passCode: 'CN-GP-84920',
      studentId: 'usr_student_1',
      studentName: 'Aarav Patel',
      rollNumber: 'CSE-2023-042',
      action: 'entry',
      timestamp: '2026-09-28T20:10:00.000Z',
      securityStaffName: 'Officer Vikram Rathore',
      gateNumber: 'Main Gate 1',
      valid: true,
      remarks: 'Returned before curfew. Pass completed.'
    }
  ];

  const notifications: CampusNotification[] = [
    {
      id: 'notif_1',
      targetRoleOrId: 'all',
      title: 'Autumn 2026 Examination Schedule Announced',
      message: 'Please review the exam dates in the Notices section.',
      type: 'info',
      link: '/notices',
      readBy: [],
      createdAt: new Date().toISOString()
    }
  ];

  const settings: InstitutionalSettings = {
    attendanceWarningThreshold: 75,
    complaintResolutionTargetDays: 3,
    institutionName: 'Campus Nexus Institute of Technology',
    academicYear: '2026-2027',
    currentSemester: 5,
    curfewTime: '21:30'
  };

  return {
    users,
    attendance,
    timetable,
    leaveRequests,
    gatePasses,
    certificates,
    hostels,
    complaints,
    messMenu,
    messFeedback,
    notices,
    fees,
    alumniPosts,
    gateActivity,
    notifications,
    settings
  };
}

let cachedDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(data) as DatabaseSchema;
      return cachedDb;
    }
  } catch (err) {
    console.error('Error reading campus_db.json, falling back to seed:', err);
  }

  const initial = getInitialDatabase();
  cachedDb = initial;
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    cachedDb = db;
  } catch (err) {
    console.error('Failed to persist campus_db.json:', err);
  }
}
