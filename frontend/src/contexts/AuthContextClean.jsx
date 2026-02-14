import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../config/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Verify token with backend
          const response = await authAPI.getMe();
          
          if (response.status === 'success') {
            setUser(response.data.user);
          } else {
            // Invalid token
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Register with email and password
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Backend creates Firebase user AND MongoDB record
      const response = await authAPI.register({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        rollNumber: userData.rollNumber,
        hostelRoom: userData.hostelRoom
      });
      
      if (response.status === 'success') {
        // Store token from backend
        localStorage.setItem('authToken', response.data.idToken);
        setUser(response.data.user);
        toast.success('Registration successful!');
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract detailed error message
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(err => err.msg).join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUser(null);
      localStorage.removeItem('authToken');
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Backend handles authentication
      const response = await authAPI.login({ email, password });
      
      if (response.status === 'success') {
        // Store token from backend
        localStorage.setItem('authToken', response.data.idToken);
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Extract detailed error message
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(err => err.msg).join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Clear local state
      setUser(null);
      localStorage.removeItem('authToken');
      
      // Notify backend (optional)
      await authAPI.logout().catch(() => {});
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update user data in context (used after profile update)
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Google Login - Gets token from Google, sends to backend for validation
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Sign in with Google (frontend only to get the token)
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get the Google ID token
      const idToken = await result.user.getIdToken();
      
      console.log('Got Google token, sending to backend...'); // Debug
      
      // Send token to backend for validation and user creation/login
      const response = await authAPI.googleLogin(idToken);
      
      console.log('Backend response:', response); // Debug
      
      if (response.status === 'success') {
        const { user: userData, idToken: backendToken } = response.data;
        
        // Store backend token
        localStorage.setItem('authToken', backendToken);
        
        // Update user state
        setUser(userData);
        
        toast.success('Logged in with Google successfully!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      console.error('Error details:', error.response?.data); // Debug
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Google sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Please allow popups for this site');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
        toast.error(errorMessage);
      }
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
