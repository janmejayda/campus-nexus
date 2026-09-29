import React, { useState, useEffect } from 'react';
import { UserRole, StudentBranch } from '../../types';
import { useAuth, DEMO_CREDENTIALS, STUDENT_BRANCH_CREDENTIALS } from '../../context/AuthContext';
import {
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Building,
  UserCheck,
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  role: UserRole;
  onNavigateRoleSelect: () => void;
  onNavigateSignup: (role: UserRole) => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  role,
  onNavigateRoleSelect,
  onNavigateSignup,
  onLoginSuccess
}) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate demo credentials on mount if user clicks Quick Demo Fill
  const fillDemo = () => {
    const cred = DEMO_CREDENTIALS[role];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.pass);
      setError(null);
    }
  };

  useEffect(() => {
    // prefill demo for quick review
    fillDemo();
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your registered email and password.');
      return;
    }

    setError(null);
    try {
      const authenticatedUser = await login(email, password, role);
      onLoginSuccess(authenticatedUser.role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const roleMeta: Record<UserRole, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
    admin: {
      title: 'Administrator Access Portal',
      subtitle: 'Institution-wide management and control center authentication',
      icon: ShieldAlert
    },
    faculty: {
      title: 'Faculty Academic Portal',
      subtitle: 'Classroom attendance, grading, schedules, and leave oversight',
      icon: GraduationCap
    },
    security: {
      title: 'Campus Security & Gate Terminal',
      subtitle: 'QR pass scanner, biometric ingress/egress, and patrol logs',
      icon: Shield
    },
    warden: {
      title: 'Hostel Warden Portal',
      subtitle: 'Resident occupancy, room requests, and hostel maintenance board',
      icon: Building
    },
    student: {
      title: 'Student Services Portal',
      subtitle: 'Attendance, smart timetables, digital QR passes, and dining',
      icon: UserCheck
    },
    alumni: {
      title: 'Alumni Network & Career Hub',
      subtitle: 'Placement opportunities, workshops, mentorship, and events',
      icon: Briefcase
    }
  };

  const meta = roleMeta[role];
  const Icon = meta.icon;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#081820] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onNavigateRoleSelect}
          className="inline-flex items-center gap-1.5 text-xs text-[#91B8C0] hover:text-[#35D6E8] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Selection</span>
        </button>

        {/* Card */}
        <div className="bg-[#0D222B] border border-[#12313B] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center pb-6 border-b border-[#12313B]">
            <div className="w-12 h-12 rounded-xl bg-[#12313B] flex items-center justify-center text-[#35D6E8] mx-auto mb-3 border border-[#35D6E8]/20">
              <Icon className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#35D6E8] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" /> Campus Nexus · {role.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{meta.title}</h2>
            <p className="mt-1 text-xs text-[#91B8C0]">{meta.subtitle}</p>
          </div>

          {/* Quick Demo Pre-fill Pill */}
          {role === 'student' ? (
            <div className="mt-4 p-3 bg-[#12313B]/70 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#91B8C0] text-[11px] font-semibold">1-Click Demo Login by Branch:</span>
                <span className="text-[10px] font-mono text-[#35D6E8]">Pass: Student@123</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['B.Tech', 'MBA', 'MCA'] as StudentBranch[]).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      const cred = STUDENT_BRANCH_CREDENTIALS[b];
                      setEmail(cred.email);
                      setPassword(cred.pass);
                      setError(null);
                    }}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all text-center ${
                      email === STUDENT_BRANCH_CREDENTIALS[b].email
                        ? 'bg-[#35D6E8] text-[#081820] border-[#35D6E8]'
                        : 'bg-[#0D222B] text-[#D9F7FA] border-white/10 hover:border-[#35D6E8]/40 hover:text-white'
                    }`}
                  >
                    {b} Student
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-2.5 bg-[#12313B]/60 rounded-xl border border-white/5 flex items-center justify-between text-xs">
              <span className="text-[#91B8C0] text-[11px]">Demo account available:</span>
              <button
                type="button"
                onClick={fillDemo}
                className="text-[#35D6E8] hover:text-[#6EEAF5] font-semibold text-xs transition-colors"
              >
                Fill Demo Credentials
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#91B8C0] mb-1.5">
                Campus Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={`${role}@campusnexus.edu`}
                className="w-full bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#91B8C0]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full bg-[#12313B] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#91B8C0] hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-md disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#081820] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Authenticate into {meta.title.split(' ')[0]}</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-4 border-t border-[#12313B] text-center text-xs">
            {role !== 'admin' ? (
              <p className="text-[#91B8C0]">
                Don't have an institutional profile?{' '}
                <button
                  onClick={() => onNavigateSignup(role)}
                  className="text-[#35D6E8] hover:text-[#6EEAF5] font-semibold transition-colors"
                >
                  Create {role} account
                </button>
              </p>
            ) : (
              <p className="text-[#66848C] text-[11px]">
                Administrator self-registration is strictly restricted by institutional policy.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
