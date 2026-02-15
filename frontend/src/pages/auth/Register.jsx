import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaUtensils } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    hostelRoom: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Roll number validation
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required';
    }

    // Hostel room validation
    if (!formData.hostelRoom.trim()) {
      newErrors.hostelRoom = 'Hostel room is required';
    } else if (!/^[AB]-\d+$/.test(formData.hostelRoom.toUpperCase())) {
      newErrors.hostelRoom = 'Room format should be like A-101 or B-205';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Creating account..." />;
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
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join the Hostel Flavour platform
          </p>
        </div>

        {/* Register Form */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="form-error">{errors.name}</p>
                )}
              </div>

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

              {/* Roll Number */}
              <div>
                <label htmlFor="rollNumber" className="form-label">
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className={`form-input ${errors.rollNumber ? 'border-red-500' : ''}`}
                  placeholder="Enter your roll number"
                />
                {errors.rollNumber && (
                  <p className="form-error">{errors.rollNumber}</p>
                )}
              </div>

              {/* Hostel Room */}
              <div>
                <label htmlFor="hostelRoom" className="form-label">
                  Hostel Room
                </label>
                <input
                  id="hostelRoom"
                  name="hostelRoom"
                  type="text"
                  value={formData.hostelRoom}
                  onChange={handleChange}
                  className={`form-input ${errors.hostelRoom ? 'border-red-500' : ''}`}
                  placeholder="e.g., A-101, B-205"
                />
                {errors.hostelRoom && (
                  <p className="form-error">{errors.hostelRoom}</p>
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword}</p>
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
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Sign in here
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

export default Register;
