import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
}

export interface AuthOrganization {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  role: string;
}

export interface BackendStatus {
  connected: boolean;
  message: string;
}

interface AuthContextType {
  user: AuthUser | null;
  activeOrganization: AuthOrganization | null;
  organizations: AuthOrganization[];
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendStatus: BackendStatus | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    organizationName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<boolean>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  refreshSession: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string; resetToken?: string }>;
  verifyResetToken: (token: string) => Promise<{ valid: boolean; email?: string; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeOrganization, setActiveOrganization] = useState<AuthOrganization | null>(null);
  const [organizations, setOrganizations] = useState<AuthOrganization[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const checkHealth = useCallback(async (): Promise<BackendStatus> => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const status: BackendStatus = {
        connected: Boolean(data?.database?.connected),
        message: data?.database?.message || 'Database status reported.',
      };
      setBackendStatus(status);
      return status;
    } catch (err: any) {
      const status: BackendStatus = {
        connected: false,
        message: 'Backend API unreachable or offline.',
      };
      setBackendStatus(status);
      return status;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('bettatraka_token');

    await checkHealth();

    if (!token) {
      setUser(null);
      setActiveOrganization(null);
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName || data.user.full_name,
          phone: data.user.phone,
        });

        if (data.activeMembership) {
          setActiveOrganization({
            id: data.activeMembership.organizationId || data.activeMembership.organization_id,
            name: data.activeMembership.organizationName || data.activeMembership.organization_name,
            slug: '',
            currency: 'NGN',
            timezone: 'Africa/Lagos',
            role: data.activeMembership.role,
          });
          setRole(data.activeMembership.role);
        }

        if (data.organizations) {
          setOrganizations(
            data.organizations.map((o: any) => ({
              id: o.id,
              name: o.name,
              slug: o.slug,
              currency: o.currency || 'NGN',
              timezone: o.timezone || 'Africa/Lagos',
              role: o.role,
            }))
          );
        }
      } else {
        // Token invalid or revoked
        localStorage.removeItem('bettatraka_token');
        setUser(null);
        setActiveOrganization(null);
        setRole(null);
      }
    } catch {
      // Offline fallback: keep token but set loading false
    } finally {
      setIsLoading(false);
    }
  }, [checkHealth]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      if (data.token) {
        localStorage.setItem('bettatraka_token', data.token);
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName || data.user.full_name,
        phone: data.user.phone,
      });

      if (data.activeOrganization) {
        setActiveOrganization({
          id: data.activeOrganization.id || data.activeOrganization.organizationId,
          name: data.activeOrganization.name || data.activeOrganization.organizationName,
          slug: data.activeOrganization.slug || '',
          currency: data.activeOrganization.currency || 'NGN',
          timezone: data.activeOrganization.timezone || 'Africa/Lagos',
          role: data.role || data.activeOrganization.role,
        });
      }

      setRole(data.role);
      setShowLoginModal(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    organizationName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registration failed.' };
      }

      if (resData.token) {
        localStorage.setItem('bettatraka_token', resData.token);
      }

      setUser({
        id: resData.user.id,
        email: resData.user.email,
        fullName: resData.user.fullName,
        phone: resData.user.phone,
      });

      if (resData.organization) {
        setActiveOrganization({
          id: resData.organization.id,
          name: resData.organization.name,
          slug: resData.organization.slug,
          currency: resData.organization.currency,
          timezone: resData.organization.timezone,
          role: 'Owner',
        });
      }

      setRole('Owner');
      setShowLoginModal(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('bettatraka_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem('bettatraka_token');
    setUser(null);
    setActiveOrganization(null);
    setRole(null);
  };

  const switchOrganization = async (orgId: string): Promise<boolean> => {
    const token = localStorage.getItem('bettatraka_token');
    if (!token) return false;

    try {
      const res = await fetch('/api/auth/switch-org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (!res.ok) return false;
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('bettatraka_token', data.token);
      }
      await refreshSession();
      return true;
    } catch {
      return false;
    }
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string; resetToken?: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Failed to request password reset.',
          message: data.details || data.error,
        };
      }

      return {
        success: true,
        message: data.message,
        resetToken: data.resetToken,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network connection failed.',
      };
    }
  };

  const verifyResetToken = async (
    token: string
  ): Promise<{ valid: boolean; email?: string; error?: string }> => {
    try {
      const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        return {
          valid: false,
          error: data.error || 'Verification token is invalid or has expired.',
        };
      }
      return { valid: true, email: data.email };
    } catch (err: any) {
      return {
        valid: false,
        error: err.message || 'Failed to verify reset token.',
      };
    }
  };

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Failed to reset password.',
          message: data.details || data.error,
        };
      }

      return {
        success: true,
        message: data.message || 'Password has been reset successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error occurred during password reset.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrganization,
        organizations,
        role,
        isAuthenticated: Boolean(user),
        isLoading,
        backendStatus,
        login,
        register,
        logout,
        switchOrganization,
        showLoginModal,
        setShowLoginModal,
        authModalMode,
        setAuthModalMode,
        refreshSession,
        requestPasswordReset,
        verifyResetToken,
        resetPassword,
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
