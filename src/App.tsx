import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIAssistantModal } from './components/AIAssistantModal';

import { RoleSelectPage } from './pages/auth/RoleSelectPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { SecurityDashboard } from './pages/security/SecurityDashboard';
import { WardenDashboard } from './pages/warden/WardenDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AlumniDashboard } from './pages/alumni/AlumniDashboard';
import { PublicPages } from './pages/PublicPages';

import { ShieldAlert, ArrowLeft } from 'lucide-react';

function CampusNexusApp() {
  const { user, isLoading } = useAuth();

  // Current URL path
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Sidebar tab state
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is authenticated and on root `/`, navigate to their role dashboard
  useEffect(() => {
    if (!isLoading) {
      if (user && (currentPath === '/' || currentPath === '/login')) {
        navigate(`/${user.role}`);
      }
    }
  }, [user, isLoading, currentPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#081820] flex flex-col items-center justify-center text-[#D9F7FA]">
        <div className="w-10 h-10 border-3 border-[#35D6E8] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono text-[#91B8C0]">Authenticating Campus Nexus Session...</span>
      </div>
    );
  }

  // 1. DEDICATED SIGNUP ROUTES (/signup/:role)
  if (currentPath.startsWith('/signup/')) {
    const roleParam = currentPath.replace('/signup/', '').split('/')[0] as UserRole;
    const validRoles: UserRole[] = ['admin', 'faculty', 'security', 'warden', 'student', 'alumni'];
    const targetRole = validRoles.includes(roleParam) ? roleParam : 'student';

    return (
      <div className="min-h-screen bg-[#081820] flex flex-col text-[#D9F7FA]">
        <Navbar
          onOpenAIAssistant={() => setShowAIAssistant(true)}
          activePath={currentPath}
          onNavigate={navigate}
        />
        <main className="flex-1">
          <SignupPage
            role={targetRole}
            onNavigateLogin={r => navigate(`/login/${r}`)}
            onNavigateRoleSelect={() => navigate('/login')}
            onSignupSuccess={r => navigate(`/${r}`)}
          />
        </main>
      </div>
    );
  }

  // 2. DEDICATED LOGIN ROUTES (/login/:role)
  if (currentPath.startsWith('/login/')) {
    const roleParam = currentPath.replace('/login/', '').split('/')[0] as UserRole;
    const validRoles: UserRole[] = ['admin', 'faculty', 'security', 'warden', 'student', 'alumni'];
    const targetRole = validRoles.includes(roleParam) ? roleParam : 'student';

    return (
      <div className="min-h-screen bg-[#081820] flex flex-col text-[#D9F7FA]">
        <Navbar
          onOpenAIAssistant={() => setShowAIAssistant(true)}
          activePath={currentPath}
          onNavigate={navigate}
        />
        <main className="flex-1">
          <LoginPage
            role={targetRole}
            onNavigateRoleSelect={() => navigate('/login')}
            onNavigateSignup={r => navigate(`/signup/${r}`)}
            onLoginSuccess={r => navigate(`/${r}`)}
          />
        </main>
      </div>
    );
  }

  // 3. MAIN AUTHENTICATION SELECTION PAGE (/login or unauthenticated root)
  if (currentPath === '/login' || (!user && (currentPath === '/' || currentPath === ''))) {
    return (
      <div className="min-h-screen bg-[#081820] flex flex-col text-[#D9F7FA]">
        <Navbar
          onOpenAIAssistant={() => setShowAIAssistant(true)}
          activePath={currentPath}
          onNavigate={navigate}
        />
        <main className="flex-1">
          <RoleSelectPage
            onSelectRole={role => navigate(`/login/${role}`)}
            onSelectSignup={role => navigate(`/signup/${role}`)}
          />
        </main>
      </div>
    );
  }

  // 4. PUBLIC PAGES (/notices, /timetable, /dining)
  if (currentPath === '/notices' || currentPath === '/timetable' || currentPath === '/dining') {
    const pageType = currentPath.replace('/', '') as 'notices' | 'timetable' | 'dining';
    return (
      <div className="min-h-screen bg-[#081820] flex flex-col text-[#D9F7FA]">
        <Navbar
          onOpenAIAssistant={() => setShowAIAssistant(true)}
          activePath={currentPath}
          onNavigate={navigate}
        />
        <main className="flex-1">
          <PublicPages
            page={pageType}
            onBack={() => navigate(user ? `/${user.role}` : '/login')}
          />
        </main>
        {showAIAssistant && (
          <AIAssistantModal onClose={() => setShowAIAssistant(false)} />
        )}
      </div>
    );
  }

  // 5. PROTECTED PORTAL ACCESS CHECKS
  if (!user) {
    // If attempting to visit a portal without login, redirect to login
    const requestedRole = currentPath.replace('/', '') as UserRole;
    navigate(`/login/${requestedRole || 'student'}`);
    return null;
  }

  // Role Mismatch Protection:
  // If authenticated user visits another role's path (e.g. student visits /admin)
  const pathRole = currentPath.replace('/', '').split('/')[0] as UserRole;
  const isRolePath = ['admin', 'faculty', 'security', 'warden', 'student', 'alumni'].includes(pathRole);

  if (isRolePath && user.role !== pathRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#081820] flex flex-col text-[#D9F7FA]">
        <Navbar
          onOpenAIAssistant={() => setShowAIAssistant(true)}
          activePath={currentPath}
          onNavigate={navigate}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Access Restricted</h2>
          <p className="text-xs text-[#91B8C0] max-w-md mb-6 leading-relaxed">
            Your authenticated role is <span className="font-mono text-[#35D6E8] uppercase">{user.role}</span>. You do not possess institutional clearance to view the <span className="font-mono text-rose-300 uppercase">{pathRole}</span> control portal.
          </p>
          <button
            onClick={() => navigate(`/${user.role}`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#35D6E8] text-[#081820] font-bold text-xs hover:bg-[#6EEAF5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to My Verified Portal
          </button>
        </div>
      </div>
    );
  }

  // Render Portal with Sidebar & Dashboard
  return (
    <div className="min-h-screen bg-[#081820] flex flex-col text-[#D9F7FA]">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAIAssistant={() => setShowAIAssistant(true)}
        activePath={currentPath}
        onNavigate={navigate}
      />

      <div className="flex-1 flex">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 bg-[#081820]">
          {user.role === 'admin' && <AdminDashboard currentTab={currentTab} />}
          {user.role === 'faculty' && <FacultyDashboard currentTab={currentTab} />}
          {user.role === 'security' && <SecurityDashboard currentTab={currentTab} />}
          {user.role === 'warden' && <WardenDashboard currentTab={currentTab} />}
          {user.role === 'student' && (
            <StudentDashboard
              currentTab={currentTab}
              onOpenAIAssistant={() => setShowAIAssistant(true)}
            />
          )}
          {user.role === 'alumni' && <AlumniDashboard currentTab={currentTab} />}
        </main>
      </div>

      {showAIAssistant && (
        <AIAssistantModal onClose={() => setShowAIAssistant(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusNexusApp />
    </AuthProvider>
  );
}
