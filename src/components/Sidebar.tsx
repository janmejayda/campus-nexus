import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
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
  Shield,
  FileText,
  Clock,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  if (!user) return null;

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Control Center', icon: LayoutDashboard },
          { id: 'users', label: 'User Directory & Roles', icon: Users },
          { id: 'attendance', label: 'Campus Attendance', icon: CalendarCheck },
          { id: 'timetable', label: 'Institutional Timetable', icon: CalendarDays },
          { id: 'leave', label: 'Student Leave Records', icon: FileCheck },
          { id: 'gatepasses', label: 'Gate Passes & Audits', icon: QrCode },
          { id: 'certificates', label: 'Certificates Processing', icon: FileText },
          { id: 'hostels', label: 'Hostel Housing & Beds', icon: Building2 },
          { id: 'mess', label: 'Mess & Dining Board', icon: UtensilsCrossed },
          { id: 'complaints', label: 'Complaints & Tickets', icon: AlertCircle },
          { id: 'notices', label: 'Campus Announcements', icon: Megaphone },
          { id: 'fees', label: 'Fee Accounts & Dues', icon: CreditCard },
          { id: 'alumni', label: 'Alumni Opportunities', icon: Briefcase },
          { id: 'settings', label: 'System Configuration', icon: Sliders }
        ];

      case 'faculty':
        return [
          { id: 'overview', label: 'Faculty Overview', icon: LayoutDashboard },
          { id: 'attendance', label: 'Mark Class Attendance', icon: CalendarCheck },
          { id: 'timetable', label: 'Teaching Schedule', icon: CalendarDays },
          { id: 'leave', label: 'Academic Leave Review', icon: FileCheck },
          { id: 'notices', label: 'Class Notices', icon: Megaphone }
        ];

      case 'security':
        return [
          { id: 'overview', label: 'Gate Terminal & Scanner', icon: QrCode },
          { id: 'activity', label: 'Ingress & Egress Logs', icon: Clock },
          { id: 'incidents', label: 'Incident Desk', icon: Shield }
        ];

      case 'warden':
        return [
          { id: 'overview', label: 'Hostel Occupancy', icon: Building2 },
          { id: 'allocations', label: 'Room Allocations', icon: Users },
          { id: 'gatepasses', label: 'Pass Approvals', icon: QrCode },
          { id: 'complaints', label: 'Maintenance Issues', icon: AlertCircle },
          { id: 'mess', label: 'Dining Feedback', icon: UtensilsCrossed },
          { id: 'notices', label: 'Hostel Bulletins', icon: Megaphone }
        ];

      case 'student':
        return [
          { id: 'overview', label: 'Student Workspace', icon: LayoutDashboard },
          { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
          { id: 'timetable', label: 'Class Schedule', icon: CalendarDays },
          { id: 'gatepasses', label: 'QR Gate Pass', icon: QrCode },
          { id: 'leave', label: 'Leave Application', icon: FileCheck },
          { id: 'certificates', label: 'Certificate Services', icon: FileText },
          { id: 'hostel', label: 'Hostel & Mess', icon: Building2 },
          { id: 'complaints', label: 'Raise Complaint', icon: AlertCircle },
          { id: 'fees', label: 'Fee Records', icon: CreditCard },
          { id: 'alumni', label: 'Alumni Career Hub', icon: Briefcase }
        ];

      case 'alumni':
        return [
          { id: 'overview', label: 'Alumni Network Hub', icon: LayoutDashboard },
          { id: 'create', label: 'Publish Opportunity', icon: Briefcase },
          { id: 'applicants', label: 'Student Applicants', icon: Users }
        ];

      default:
        return [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems(user.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] bottom-0 left-0 z-50 lg:z-30 w-64 bg-[#081820] border-r border-[#12313B] flex flex-col h-[100dvh] lg:h-[calc(100vh-57px)] transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* User Mini Profile Header */}
        <div className="p-4 border-b border-[#12313B] flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{user.name}</div>
            <div className="text-[11px] text-[#35D6E8] font-mono capitalize">
              {user.role} {user.rollNumber || user.staffId ? `· ${user.rollNumber || user.staffId}` : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-[#91B8C0] hover:text-white"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#12313B] text-[#35D6E8] border border-[#35D6E8]/20 shadow-sm'
                    : 'text-[#91B8C0] hover:text-[#D9F7FA] hover:bg-[#0D222B]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#35D6E8]' : 'text-[#66848C]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Institutional Identifier Footer */}
        <div className="p-3 border-t border-[#12313B] text-[11px] text-[#66848C]">
          <div className="truncate font-semibold text-[#91B8C0]">Campus Nexus OS</div>
          <div className="truncate text-[10px]">Academic Year 2026–2027</div>
        </div>
      </aside>
    </>
  );
};
