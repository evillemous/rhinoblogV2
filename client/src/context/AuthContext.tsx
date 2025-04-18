import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  username: string;
  email?: string;
  avatarUrl?: string;
  isAdmin: boolean; // Keeping for backward compatibility
  role?: string;
  contributorType?: string;
  verified?: boolean;
  bio?: string;
  trustScore?: number;
}

// Define role and contributor type constants
export const UserRole = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  CONTRIBUTOR: 'contributor',
  USER: 'user',
  GUEST: 'guest',
} as const;

export const ContributorType = {
  SURGEON: 'surgeon',
  PATIENT: 'patient',
  INFLUENCER: 'influencer',
  BLOGGER: 'blogger',
} as const;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  // Role-based helper methods
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isContributor: () => boolean;
  hasRole: (role: string) => boolean;
  isContributorType: (type: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: () => {},
  isSuperAdmin: () => false,
  isAdmin: () => false,
  isContributor: () => false,
  hasRole: () => false,
  isContributorType: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid user data, clear storage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    
    setIsLoading(false);
  }, []);
  
  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Role-based helper functions
  const isSuperAdmin = () => {
    return user?.role === UserRole.SUPERADMIN || user?.isAdmin === true;
  };

  const isAdmin = () => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN || user?.isAdmin === true;
  };

  const isContributor = () => {
    return user?.role === UserRole.CONTRIBUTOR || isAdmin();
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    
    if (role === UserRole.SUPERADMIN) return isSuperAdmin();
    if (role === UserRole.ADMIN) return isAdmin();
    if (role === UserRole.CONTRIBUTOR) return isContributor();
    if (role === UserRole.USER) return true; // If authenticated, at least a user
    
    return user.role === role;
  };

  const isContributorType = (type: string) => {
    if (!user || !isContributor()) return false;
    return user.contributorType === type;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        isSuperAdmin,
        isAdmin,
        isContributor,
        hasRole,
        isContributorType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
