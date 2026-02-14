import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaUtensils, FaGoogle } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Login = () => {
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result); // Debug log
      
      if (result.success) {
        console.log('Login successful, waiting before navigation...'); // Debug log
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          console.log('Navigating to dashboard...'); // Debug log
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        console.error('Login failed:', result.error); // Debug log
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      console.log('Google login result:', result); // Debug log
      
      if (result.success) {
        console.log('Google login successful, navigating to dashboard...'); // Debug log
        navigate('/dashboard', { replace: true });
      } else {
        console.error('Google login failed:', result.error); // Debug log
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Signing in..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-primary-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <FaUtensils className="text-4xl text-accent-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">GVP</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-200">
            Hostel Flavour
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to submit your food feedback
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-navy-800 text-gray-400">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Login (Production) */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-navy-700 rounded-lg shadow-sm text-sm font-medium text-gray-200 bg-navy-900 hover:bg-navy-800 transition-all duration-200"
            >
              <FaGoogle className="mr-2 text-red-500" />
              Sign in with Google (GVPCE)
            </button>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 Hostel Food Analysis Platform</p>
          <p>For GVPCE Students</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
