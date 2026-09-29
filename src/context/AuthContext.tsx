import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, StudentBranch } from '../types';
import { apiRequest, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<User>;
  signup: (payload: any) => Promise<{ user: User; message: string; pending?: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickLoginAs: (role: UserRole) => Promise<User>;
  quickLoginAsStudentBranch: (branch: StudentBranch) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; title: string }> = {
  admin: {
    email: 'admin@campusnexus.edu',
    pass: 'Admin@123',
    title: 'Administrator'
  },
  faculty: {
    email: 'faculty.sharma@campusnexus.edu',
    pass: 'Faculty@123',
    title: 'Faculty'
  },
  security: {
    email: 'security.gate1@campusnexus.edu',
    pass: 'Security@123',
    title: 'Security'
  },
  warden: {
    email: 'warden.singh@campusnexus.edu',
    pass: 'Warden@123',
    title: 'Hostel Warden'
  },
  student: {
    email: 'student.aarav@campusnexus.edu',
    pass: 'Student@123',
    title: 'Student'
  },
  alumni: {
    email: 'alumni.priya@campusnexus.edu',
    pass: 'Alumni@123',
    title: 'Alumni'
  }
};

export const STUDENT_BRANCH_CREDENTIALS: Record<StudentBranch, { email: string; pass: string; name: string; course: string; rollNumber: string }> = {
  'B.Tech': {
    email: 'student.aarav@campusnexus.edu',
    pass: 'Student@123',
    name: 'Aarav Patel',
    course: 'B.Tech Computer Science',
    rollNumber: 'CSE-2023-042'
  },
  'MBA': {
    email: 'student.tanya.mba@campusnexus.edu',
    pass: 'Student@123',
    name: 'Tanya Mehra',
    course: 'MBA',
    rollNumber: 'MBA-2024-018'
  },
  'MCA': {
    email: 'student.kunal.mca@campusnexus.edu',
    pass: 'Student@123',
    name: 'Kunal Saxena',
    course: 'MCA',
    rollNumber: 'MCA-2024-035'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ user: User }>('/api/auth/me');
      setUser(res.user);
    } catch {
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, expectedRole?: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, expectedRole })
      });

      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: any): Promise<{ user: User; message: string; pending?: boolean }> => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ user: User; token?: string; message: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.token) {
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
        return { user: res.user, message: res.message, pending: false };
      }

      return { user: res.user, message: res.message, pending: true };
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginAs = async (role: UserRole): Promise<User> => {
    const cred = DEMO_CREDENTIALS[role];
    return login(cred.email, cred.pass, role);
  };

  const quickLoginAsStudentBranch = async (branch: StudentBranch): Promise<User> => {
    const cred = STUDENT_BRANCH_CREDENTIALS[branch];
    return login(cred.email, cred.pass, 'student');
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        quickLoginAs,
        quickLoginAsStudentBranch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
