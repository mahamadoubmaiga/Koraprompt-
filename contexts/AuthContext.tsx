import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User } from '../types';

// This is a mock authentication service. Replace with a real backend (e.g., Supabase, Firebase).
const mockAuthService = {
  // Simulates user lookup
  getUser: (email: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem('kora-users') || '[]');
    return users.find(u => u.email === email) || null;
  },
  // Simulates user creation
  createUser: (email: string): User => {
    const users: User[] = JSON.parse(localStorage.getItem('kora-users') || '[]');
    const newUser: User = { id: `user_${Date.now()}`, email };
    localStorage.setItem('kora-users', JSON.stringify([...users, newUser]));
    return newUser;
  }
};

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  signup: (email: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    const sessionUser = sessionStorage.getItem('kora-session');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const existingUser = mockAuthService.getUser(email);
    if (existingUser) {
      setUser(existingUser);
      sessionStorage.setItem('kora-session', JSON.stringify(existingUser));
    } else {
      alert('User not found. Please sign up.');
    }
  };

  const signup = (email: string) => {
    let existingUser = mockAuthService.getUser(email);
    if (existingUser) {
      alert('User already exists. Please log in.');
      return;
    }
    const newUser = mockAuthService.createUser(email);
    setUser(newUser);
    sessionStorage.setItem('kora-session', JSON.stringify(newUser));
  };
  
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('kora-session');
    // Optionally redirect to home page after logout
    window.location.reload(); // Simple way to reset state
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
