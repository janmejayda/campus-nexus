import React, { useState } from 'react';
import { UserRole, StudentBranch, SUPPORTED_BRANCHES } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Building,
  UserCheck,
  Shield,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  BookOpen
} from 'lucide-react';

interface SignupPageProps {
  role: UserRole;
  onNavigateLogin: (role: UserRole) => void;
  onNavigateRoleSelect: () => void;
  onSignupSuccess: (role: UserRole) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  role,
  onNavigateLogin,
  onNavigateRoleSelect,
  onSignupSuccess
}) => {
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<StudentBranch>('B.Tech');
  const [department, setDepartment] = useState<string>('Computer Science & Engineering');
  const [rollNumber, setRollNumber] = useState<string>('');
  const [staffId, setStaffId] = useState<string>('');
  const [course, setCourse] = useState<string>('B.Tech Computer Science');
  const [year, setYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [graduationYear, setGraduationYear] = useState<number>(2022);
  const [company, setCompany] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [adminMasterKey, setAdminMasterKey] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; pending?: boolean } | null>(null);

  const handleBranchChange = (newBranch: StudentBranch) => {
    setSelectedBranch(newBranch);
    const branchMeta = SUPPORTED_BRANCHES[newBranch];
    const defaultDept = branchMeta.departments[0];
    setDepartment(defaultDept);
    
    if (newBranch === 'B.Tech') {
      setCourse('B.Tech Computer Science');
      setYear(1);
      setSemester(1);
    } else if (newBranch === 'MBA') {
      setCourse('MBA');
      setYear(1);
      setSemester(1);
    } else if (newBranch === 'MCA') {
      setCourse('MCA');
      setYear(1);
      setSemester(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      let finalRollNumber = rollNumber;
      if (role === 'student' && !finalRollNumber) {
        const randNum = Math.floor(100 + Math.random() * 900);
        if (selectedBranch === 'MBA') {
          finalRollNumber = `MBA-2024-${randNum}`;
        } else if (selectedBranch === 'MCA') {
          finalRollNumber = `MCA-2024-${randNum}`;
        } else {
          finalRollNumber = `BTECH-CSE-2024-${randNum}`;
        }
      }

      const res = await signup({
        name,
        email,
        password,
        role,
        department,
        rollNumber: role === 'student' ? finalRollNumber : undefined,
        staffId: ['faculty', 'security', 'warden', 'admin'].includes(role) ? staffId || `STF-${Math.floor(100 + Math.random() * 900)}` : undefined,
        course: role === 'student' ? (course || selectedBranch) : undefined,
        year: role === 'student' ? year : undefined,
        semester: role === 'student' ? semester : undefined,
        graduationYear: role === 'alumni' ? graduationYear : undefined,
        company: role === 'alumni' ? company : undefined,
        designation: role === 'alumni' ? designation : undefined,
        adminMasterKey: role === 'admin' ? adminMasterKey : undefined
      });

      setSuccessInfo(res);
      if (!res.pending) {
        setTimeout(() => {
          onSignupSuccess(role);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  const roleMeta: Record<UserRole, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
    admin: {
      title: 'Administrator Provisioning',
      subtitle: 'Secure institutional root setup protocol',
      icon: ShieldAlert
    },
    faculty: {
      title: 'Faculty Member Registration',
      subtitle: 'Academic staff enrollment subject to administrative verification',
      icon: GraduationCap
    },
    security: {
      title: 'Campus Security Staff Enrollment',
      subtitle: 'Vigilance personnel enrollment subject to administrative verification',
      icon: Shield
    },
    warden: {
      title: 'Hostel Warden Registration',
      subtitle: 'Hostel administration profile subject to institutional assignment',
      icon: Building
    },
    student: {
      title: 'Student Enrollment Registration',
      subtitle: 'Official academic record integration and campus access',
      icon: UserCheck
    },
    alumni: {
      title: 'Alumni Network Registration',
      subtitle: 'Join the campus alumni association for mentorship & placement',
      icon: Briefcase
    }
  };

  const meta = roleMeta[role];
  const Icon = meta.icon;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#081820] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg">
        {/* Back navigation */}
        <button
          onClick={onNavigateRoleSelect}
          className="inline-flex items-center gap-1.5 text-xs text-[#91B8C0] hover:text-[#35D6E8] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Selection</span>
        </button>

        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center pb-6 border-b border-[#12313B]">
            <div className="w-12 h-12 rounded-xl bg-[#12313B] flex items-center justify-center text-[#35D6E8] mx-auto mb-3 border border-[#35D6E8]/20">
              <Icon className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#35D6E8] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" /> Registration · {role.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{meta.title}</h2>
            <p className="mt-1 text-xs text-[#91B8C0]">{meta.subtitle}</p>
          </div>

          {/* Security policy notice for privileged roles */}
          {['faculty', 'security', 'warden'].includes(role) && (
            <div className="mt-4 p-3 bg-cyan-950/30 border border-[#35D6E8]/30 rounded-xl text-xs text-[#D9F7FA] flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#35D6E8] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#6EEAF5]">Institutional Verification Policy:</span>
                <p className="text-[11px] text-[#91B8C0] mt-0.5">
                  To prevent unauthorized elevated privileges, your account will be activated once an authorized institutional Administrator verifies your staff credentials.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successInfo && (
            <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{successInfo.message}</p>
                {successInfo.pending && (
                  <p className="text-[11px] text-emerald-400/80 mt-1">
                    An administrator can approve this account in the User Management tab. You can test existing pre-seeded accounts in the meantime.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Admin Policy Specific Warning */}
          {role === 'admin' && (
            <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Root Setup Restricted
              </div>
              <p className="text-[11px] text-amber-200/80">
                To prevent privilege escalation, public administrator registration is disabled. You must provide the Institutional Root Key (<span className="font-mono text-white">CAMPUS_NEXUS_ROOT_2026</span>) to provision an additional administrator.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dr. Ramesh Gupta"
                className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@campusnexus.edu"
                className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                Create Strong Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
              />
            </div>

            {/* Role-Specific Fields */}
            {role === 'student' && (
              <div className="space-y-4 pt-2 border-t border-[#12313B]">
                {/* Branch / Program Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#91B8C0] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#35D6E8]">
                      <BookOpen className="w-3.5 h-3.5" /> Select Academic Degree Branch
                    </span>
                    <span className="text-[11px] font-mono text-[#6EEAF5]">3 Programs Available</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['B.Tech', 'MBA', 'MCA'] as StudentBranch[]).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleBranchChange(b)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedBranch === b
                            ? 'bg-[#35D6E8]/15 border-[#35D6E8] text-white shadow-sm'
                            : 'bg-[#12313B]/60 border-white/10 text-[#91B8C0] hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{b}</span>
                          {selectedBranch === b && <span className="w-1.5 h-1.5 rounded-full bg-[#35D6E8]" />}
                        </div>
                        <div className="text-[10px] text-[#91B8C0] mt-0.5 truncate">
                          {b === 'B.Tech' ? '4 Years (8 Sem)' : '2 Years (4 Sem)'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department Dropdown for Selected Branch */}
                <div>
                  <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                    Academic Department / Specialization
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#35D6E8]"
                  >
                    {SUPPORTED_BRANCHES[selectedBranch].departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                      Degree Title / Course
                    </label>
                    <input
                      type="text"
                      required
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      placeholder={selectedBranch === 'MBA' ? 'MBA' : selectedBranch === 'MCA' ? 'MCA' : 'B.Tech Computer Science'}
                      className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                      Student Roll / Enrollment ID
                    </label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={e => setRollNumber(e.target.value)}
                      placeholder={
                        selectedBranch === 'MBA' ? 'e.g. MBA-2024-018' :
                        selectedBranch === 'MCA' ? 'e.g. MCA-2024-035' :
                        'e.g. CSE-2024-102'
                      }
                      className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                    />
                    <span className="text-[10px] text-[#66848C] mt-0.5 block">Leave blank to auto-generate</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={e => setYear(Number(e.target.value))}
                      className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#35D6E8]"
                    >
                      {Array.from({ length: SUPPORTED_BRANCHES[selectedBranch].durationYears }, (_, i) => i + 1).map(y => (
                        <option key={y} value={y}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : `${y}th`} Year</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                      Current Semester
                    </label>
                    <select
                      value={semester}
                      onChange={e => setSemester(Number(e.target.value))}
                      className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#35D6E8]"
                    >
                      {Array.from({ length: SUPPORTED_BRANCHES[selectedBranch].totalSemesters }, (_, i) => i + 1).map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {['faculty', 'security', 'warden'].includes(role) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                    Staff Identity Number
                  </label>
                  <input
                    type="text"
                    required
                    value={staffId}
                    onChange={e => setStaffId(e.target.value)}
                    placeholder="e.g. STF-CSE-091"
                    className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                  />
                </div>
              </div>
            )}

            {role === 'alumni' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={e => setGraduationYear(Number(e.target.value))}
                      className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                      Current Company / Org
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="e.g. Google AI Labs"
                      className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                    Job Title / Professional Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Systems Architect"
                    className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                  />
                </div>
              </>
            )}

            {role === 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                  Institutional Master Setup Key
                </label>
                <input
                  type="password"
                  value={adminMasterKey}
                  onChange={e => setAdminMasterKey(e.target.value)}
                  placeholder="Enter Root Setup Key"
                  className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
                />
                <p className="text-[11px] text-[#66848C] mt-1 font-mono">
                  Default root key for prototype: CAMPUS_NEXUS_ROOT_2026
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-md disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#081820] border-t-transparent rounded-full animate-spin" />
                  <span>Enrolling Account...</span>
                </>
              ) : (
                <span>Complete {role.toUpperCase()} Enrollment</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-4 border-t border-[#12313B] text-center text-xs">
            <p className="text-[#91B8C0]">
              Already have an account?{' '}
              <button
                onClick={() => onNavigateLogin(role)}
                className="text-[#35D6E8] hover:text-[#6EEAF5] font-semibold transition-colors"
              >
                Log in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
