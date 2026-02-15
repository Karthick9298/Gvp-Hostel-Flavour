import React, { useState, useEffect } from 'react';
import { userAPI } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaUser, FaEdit, FaSave, FaTimes, FaEnvelope, FaIdCard, FaDoorOpen, FaShieldAlt, FaCalendar, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    hostelRoom: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        rollNumber: user.rollNumber || '',
        hostelRoom: user.hostelRoom || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: profileData.name,
        hostelRoom: profileData.hostelRoom
      };

      const response = await userAPI.updateProfile(updateData);
      
      if (response.status === 'success') {
        updateUser(response.data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      rollNumber: user.rollNumber || '',
      hostelRoom: user.hostelRoom || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header with Avatar */}
      <div className="bg-navy-800 rounded-2xl p-6 border border-navy-700 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <FaUser className="text-4xl text-white" />
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-100">{profileData.name}</h1>
            <p className="text-gray-400 mt-1">{profileData.email}</p>
            
            {/* Role Badge */}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
                user?.isAdmin 
                  ? 'bg-purple-900/30 text-purple-400 border border-purple-700/30' 
                  : 'bg-blue-900/30 text-blue-400 border border-blue-700/30'
              }`}>
                <FaShieldAlt className="text-xs" />
                {user?.isAdmin ? 'Administrator' : 'Student'}
              </span>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="flex-shrink-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-navy-700 hover:bg-navy-600 text-gray-200 font-medium rounded-lg transition-all border border-navy-600 flex items-center gap-2"
              >
                <FaEdit />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-success-600 hover:bg-success-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSave />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-5 py-2.5 bg-navy-700 hover:bg-navy-600 text-gray-200 font-medium rounded-lg transition-all border border-navy-600 flex items-center gap-2"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <FaUser className="text-primary-400" />
            Personal Information
          </h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1.5">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-200 font-medium py-2">{profileData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1.5 flex items-center gap-2">
                <FaEnvelope className="text-xs" />
                Email Address
              </label>
              <p className="text-gray-200 font-medium py-2">{profileData.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Hostel Information */}
        <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <FaDoorOpen className="text-accent-400" />
            Hostel Information
          </h2>
          <div className="space-y-4">
            {/* Roll Number */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1.5 flex items-center gap-2">
                <FaIdCard className="text-xs" />
                Roll Number
              </label>
              <p className="text-gray-200 font-medium py-2">{profileData.rollNumber}</p>
              <p className="text-xs text-gray-500 mt-1">Roll number cannot be changed</p>
            </div>

            {/* Hostel Room */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1.5">Room Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="hostelRoom"
                  value={profileData.hostelRoom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="e.g., A-101, B-205"
                />
              ) : (
                <p className="text-gray-200 font-medium py-2">{profileData.hostelRoom}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Activity */}
      <div className="bg-navy-800 rounded-xl p-6 border border-navy-700">
        <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <FaClock className="text-success-400" />
          Account Activity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-4 bg-navy-900/50 rounded-lg border border-navy-700/50">
            <div className="p-3 bg-primary-900/30 rounded-lg">
              <FaCalendar className="text-primary-400 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Member Since</p>
              <p className="text-gray-200 font-semibold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-navy-900/50 rounded-lg border border-navy-700/50">
            <div className="p-3 bg-success-900/30 rounded-lg">
              <FaClock className="text-success-400 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Login</p>
              <p className="text-gray-200 font-semibold">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
