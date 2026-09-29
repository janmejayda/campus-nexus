import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_CREDENTIALS, STUDENT_BRANCH_CREDENTIALS } from '../context/AuthContext';
import { UserRole, StudentBranch, detectBranch } from '../types';
import { apiRequest } from '../services/api';
import {
  Bell,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  Check
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenAIAssistant: () => void;
  activePath?: string;
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenAIAssistant,
  activePath = '/',
  onNavigate
}) => {
  const { user, logout, quickLoginAs, quickLoginAsStudentBranch } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string }>>([]);

  useEffect(() => {
    if (user) {
      apiRequest('/api/notifications')
        .then(res => setNotifications(res.notifications || []))
        .catch(() => {});
    }
  }, [user]);

  const handleRoleSwitch = async (role: UserRole) => {
    setShowRoleMenu(false);
    try {
      await quickLoginAs(role);
      if (onNavigate) {
        onNavigate(`/${role}`);
      }
    } catch (err: any) {
      console.error('Role switch failed:', err);
    }
  };

  const handleStudentBranchSwitch = async (branch: StudentBranch) => {
    setShowRoleMenu(false);
    try {
      await quickLoginAsStudentBranch(branch);
      if (onNavigate) {
        onNavigate('/student');
      }
    } catch (err: any) {
      console.error('Student branch switch failed:', err);
    }
  };

  const roleDisplayName: Record<UserRole, string> = {
    admin: 'Administrator',
    faculty: 'Faculty',
    security: 'Security Force',
    warden: 'Hostel Warden',
    student: 'Student',
    alumni: 'Alumni Network'
  };

  const getActiveRoleLabel = () => {
    if (!user) return 'Select Demo Role';
    if (user.role === 'student') {
      const branch = detectBranch(user.course, user.department, user.rollNumber);
      return `Student (${branch})`;
    }
    return roleDisplayName[user.role];
  };

  return (
    <header className="sticky top-0 z-40 bg-[#081820]/95 backdrop-blur-md border-b border-[#12313B] px-4 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Single Text Element Brand Wordmark */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-[#91B8C0] hover:text-white hover:bg-[#12313B] transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onNavigate && onNavigate(user ? `/${user.role}` : '/login')}
            className="text-lg font-bold tracking-tight text-white hover:text-[#35D6E8] transition-colors flex items-center gap-2 text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-[#35D6E8] flex items-center justify-center text-[#081820] font-black text-sm">
              N
            </div>
            <span>Campus Nexus</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean text, single-line) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#91B8C0]">
          {user ? (
            <>
              <button
                onClick={() => onNavigate && onNavigate(`/${user.role}`)}
                className={`hover:text-[#D9F7FA] transition-colors ${
                  activePath.startsWith(`/${user.role}`) ? 'text-[#35D6E8]' : ''
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate && onNavigate('/notices')}
                className={`hover:text-[#D9F7FA] transition-colors ${
                  activePath === '/notices' ? 'text-[#35D6E8]' : ''
                }`}
              >
                Announcements
              </button>
              <button
                onClick={() => onNavigate && onNavigate('/timetable')}
                className={`hover:text-[#D9F7FA] transition-colors ${
                  activePath === '/timetable' ? 'text-[#35D6E8]' : ''
                }`}
              >
                Timetable
              </button>
              <button
                onClick={() => onNavigate && onNavigate('/dining')}
                className={`hover:text-[#D9F7FA] transition-colors ${
                  activePath === '/dining' ? 'text-[#35D6E8]' : ''
                }`}
              >
                Dining & Mess
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate && onNavigate('/login')}
                className="hover:text-[#D9F7FA] transition-colors"
              >
                Role Portal Selector
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Campus Assistant Launcher */}
          {user && (
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12313B] hover:bg-[#1a4452] text-[#35D6E8] hover:text-[#6EEAF5] text-xs font-semibold border border-[#35D6E8]/30 transition-all shadow-sm"
              title="Campus Nexus AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          )}

          {/* Role Switcher for Hackathon Reviewers */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12313B]/80 hover:bg-[#12313B] text-xs text-[#D9F7FA] border border-white/5 transition-colors"
              title="Test Any Portal Role"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#35D6E8]" />
              <span className="hidden sm:inline font-mono text-[11px]">
                {getActiveRoleLabel()}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#91B8C0]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0D222B] border border-[#12313B] rounded-xl shadow-2xl py-2 z-50 animate-fade-in text-xs">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#66848C] uppercase tracking-wider border-b border-[#12313B]">
                  Switch Portal Role (Demo)
                </div>
                {(['admin', 'faculty', 'security', 'warden', 'alumni'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#12313B] flex items-center justify-between text-[#D9F7FA] transition-colors"
                  >
                    <span>{roleDisplayName[r]}</span>
                    {user?.role === r && <Check className="w-3.5 h-3.5 text-[#35D6E8]" />}
                  </button>
                ))}

                <div className="mt-1 px-3 py-1 text-[10px] font-semibold text-[#35D6E8] uppercase tracking-wider border-t border-[#12313B] bg-[#12313B]/30">
                  Student Portals by Branch
                </div>
                {(['B.Tech', 'MBA', 'MCA'] as StudentBranch[]).map(b => {
                  const isCurrent = user?.role === 'student' && detectBranch(user.course, user.department, user.rollNumber) === b;
                  return (
                    <button
                      key={b}
                      onClick={() => handleStudentBranchSwitch(b)}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#12313B] flex items-center justify-between text-[#D9F7FA] transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#6EEAF5]">{b}</span>
                        <span className="text-[#91B8C0] text-[11px]">({STUDENT_BRANCH_CREDENTIALS[b].name})</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#35D6E8]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-lg text-[#91B8C0] hover:text-[#D9F7FA] hover:bg-[#12313B] transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#35D6E8]" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0D222B] border border-[#12313B] rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 text-xs font-bold text-white border-b border-[#12313B] flex justify-between items-center">
                    <span>Campus Alerts & Updates</span>
                    <span className="text-[10px] text-[#35D6E8] font-mono">{notifications.length} New</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-[#12313B]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-[#66848C]">No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 hover:bg-[#12313B]/60 transition-colors">
                          <div className="font-semibold text-white mb-0.5">{n.title}</div>
                          <div className="text-[11px] text-[#91B8C0]">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Logout */}
          {user ? (
            <button
              onClick={logout}
              className="p-2 rounded-lg text-[#91B8C0] hover:text-rose-400 hover:bg-[#12313B] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate && onNavigate('/login')}
              className="px-3.5 py-1.5 rounded-lg bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] text-xs font-bold transition-all shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
