import React from 'react';
import { UserRole, StudentBranch } from '../../types';
import { DEMO_CREDENTIALS, STUDENT_BRANCH_CREDENTIALS, useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  GraduationCap,
  Briefcase,
  KeyRound,
  Building,
  UserCheck,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface RoleSelectPageProps {
  onSelectRole: (role: UserRole) => void;
  onSelectSignup: (role: UserRole) => void;
}

interface RoleConfig {
  role: UserRole;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  canSelfRegister: boolean;
  demoUser: string;
}

export const RoleSelectPage: React.FC<RoleSelectPageProps> = ({
  onSelectRole,
  onSelectSignup
}) => {
  const { quickLoginAs, quickLoginAsStudentBranch } = useAuth();

  const roles: RoleConfig[] = [
    {
      role: 'admin',
      title: 'Administrator',
      tagline: 'Institutional Governance',
      description: 'Campus control center, role provisioning, user directory, system thresholds, fee ledgers, and audit logs.',
      icon: ShieldAlert,
      canSelfRegister: false,
      demoUser: 'admin@campusnexus.edu'
    },
    {
      role: 'faculty',
      title: 'Faculty',
      tagline: 'Academic Command',
      description: 'Class attendance marking, subject-wise threshold tracking, timetables, and academic leave decisions.',
      icon: GraduationCap,
      canSelfRegister: true,
      demoUser: 'faculty.sharma@campusnexus.edu'
    },
    {
      role: 'security',
      title: 'Security',
      tagline: 'Gate Pass & Vigilance',
      description: 'Real-time optical QR pass verification, manual code audits, student entry/exit timestamps, and perimeter alerts.',
      icon: Shield,
      canSelfRegister: true,
      demoUser: 'security.gate1@campusnexus.edu'
    },
    {
      role: 'warden',
      title: 'Warden',
      tagline: 'Hostel & Housing Board',
      description: 'Hostel room allocations, occupancy analytics, maintenance complaints resolution, and night curfew logs.',
      icon: Building,
      canSelfRegister: true,
      demoUser: 'warden.singh@campusnexus.edu'
    },
    {
      role: 'student',
      title: 'Student (B.Tech · MBA · MCA)',
      tagline: 'Multi-Branch Academic & Services Portal',
      description: 'Unified services for B.Tech, MBA & MCA students: lecture timetables, subject attendance, QR gate passes, hostel rooms, and AI assistance.',
      icon: UserCheck,
      canSelfRegister: true,
      demoUser: 'student.aarav@campusnexus.edu'
    },
    {
      role: 'alumni',
      title: 'Alumni',
      tagline: 'Career & Industry Hub',
      description: 'Recruitment listings, masterclass workshops, summer internships, student applicant reviews, and mentorship.',
      icon: Briefcase,
      canSelfRegister: true,
      demoUser: 'alumni.priya@campusnexus.edu'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#081820] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        {/* Brand Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12313B] text-[#35D6E8] text-xs font-semibold mb-3 border border-[#35D6E8]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#35D6E8]" />
            One Campus · One Platform · Real-Time Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Institutional Access Gateways
          </h1>
          <p className="mt-3 text-sm text-[#91B8C0]">
            Select your campus role to enter your dedicated high-security portal. All communications and permissions are verified by the institutional authority.
          </p>
        </div>

        {/* 6 Role Gateway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map(r => {
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                className="bg-[#0D222B] border border-[#12313B] hover:border-[#35D6E8]/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 group shadow-lg hover:shadow-cyan-950/30"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#12313B] flex items-center justify-center text-[#35D6E8] group-hover:scale-105 transition-transform border border-white/5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono text-[#91B8C0] uppercase tracking-wider">
                      {r.tagline}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#6EEAF5] transition-colors">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#91B8C0] leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#12313B]/80 space-y-2.5">
                  <button
                    onClick={() => onSelectRole(r.role)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#12313B] hover:bg-[#35D6E8] text-[#D9F7FA] hover:text-[#081820] text-xs font-bold transition-all shadow-sm group-hover:bg-[#35D6E8] group-hover:text-[#081820]"
                  >
                    <span>Login to {r.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] px-1">
                    {r.canSelfRegister ? (
                      <button
                        onClick={() => onSelectSignup(r.role)}
                        className="text-[#91B8C0] hover:text-[#35D6E8] transition-colors"
                      >
                        Create Account
                      </button>
                    ) : (
                      <span className="text-[#66848C]">Admin setup required</span>
                    )}

                    {/* Quick Demo Access Button */}
                    <button
                      onClick={() => quickLoginAs(r.role)}
                      className="text-[#35D6E8] hover:text-[#6EEAF5] font-semibold underline underline-offset-2 decoration-[#35D6E8]/30 transition-colors"
                    >
                      Instant Demo
                    </button>
                  </div>

                  {r.role === 'student' && (
                    <div className="pt-2.5 border-t border-[#12313B]">
                      <div className="text-[10px] text-[#91B8C0] font-semibold mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#35D6E8]">
                          <BookOpen className="w-3 h-3" /> Instant Branch Demo:
                        </span>
                        <span className="text-[10px] text-[#6EEAF5] font-mono">1-Click Login</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['B.Tech', 'MBA', 'MCA'] as StudentBranch[]).map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => quickLoginAsStudentBranch(b)}
                            className="py-1 px-2 rounded-lg bg-[#35D6E8]/10 hover:bg-[#35D6E8] text-[#6EEAF5] hover:text-[#081820] border border-[#35D6E8]/30 font-bold text-[11px] transition-all text-center"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Credentials Quick Panel */}
        <div className="mt-10 bg-[#0D222B]/70 border border-[#12313B] rounded-2xl p-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#12313B]">
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#35D6E8]" /> Pre-Configured Campus Credentials
              </div>
              <div className="text-[11px] text-[#91B8C0]">
                All institutional roles and multi-branch student accounts are pre-seeded for instant evaluation.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
            {(Object.keys(DEMO_CREDENTIALS) as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => quickLoginAs(role)}
                className="bg-[#12313B]/60 hover:bg-[#12313B] p-2.5 rounded-xl border border-white/5 text-left transition-colors"
              >
                <div className="font-bold text-white capitalize">{role}</div>
                <div className="text-[10px] text-[#91B8C0] truncate">{DEMO_CREDENTIALS[role].email}</div>
                <div className="text-[10px] text-[#35D6E8] font-mono mt-0.5">{DEMO_CREDENTIALS[role].pass}</div>
              </button>
            ))}
          </div>

          {/* Student Branch Accounts Panel */}
          <div className="mt-4 pt-3.5 border-t border-[#12313B]">
            <div className="text-[11px] font-bold text-[#35D6E8] mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> 3 Supported Student Branches (B.Tech, MBA, MCA) — Click to Login Instantly:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['B.Tech', 'MBA', 'MCA'] as StudentBranch[]).map(b => {
                const cred = STUDENT_BRANCH_CREDENTIALS[b];
                return (
                  <button
                    key={b}
                    onClick={() => quickLoginAsStudentBranch(b)}
                    className="bg-[#12313B]/70 hover:bg-[#12313B] p-3 rounded-xl border border-[#35D6E8]/20 hover:border-[#35D6E8]/60 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#35D6E8] text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#35D6E8]" />
                        {b} Student
                      </span>
                      <span className="text-[10px] text-[#91B8C0] font-mono group-hover:text-white">{cred.rollNumber}</span>
                    </div>
                    <div className="text-white text-xs font-semibold mt-1">{cred.name}</div>
                    <div className="text-[10px] text-[#91B8C0] truncate">{cred.email}</div>
                    <div className="text-[10px] text-[#6EEAF5] font-mono mt-1">Pass: {cred.pass}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
