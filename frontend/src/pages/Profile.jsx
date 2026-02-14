import React, { useState, useEffect } from 'react';
import { userAPI } from '../config/api';
import { useAuth } from '../contexts/AuthContextClean';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-900/40 border-2 border-primary-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUser className="text-3xl text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-100">Profile</h1>
        <p className="text-gray-400">Manage your account information</p>
      </div>

      {/* Profile Form */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-200">Personal Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FaEdit />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-success flex items-center space-x-2"
              >
                <FaSave />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="btn-secondary flex items-center space-x-2"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        <div className="card-body space-y-4">
          {/* Name */}
          <div>
            <label className="form-label">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-200 py-2">{profileData.name}</p>
            )}
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="form-label">Email Address</label>
            <p className="text-gray-200 py-2">{profileData.email}</p>
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Roll Number (readonly) */}
          <div>
            <label className="form-label">Roll Number</label>
            <p className="text-gray-200 py-2">{profileData.rollNumber}</p>
            <p className="text-xs text-gray-500">Roll number cannot be changed</p>
          </div>

          {/* Hostel Room */}
          <div>
            <label className="form-label">Hostel Room</label>
            {isEditing ? (
              <input
                type="text"
                name="hostelRoom"
                value={profileData.hostelRoom}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., A-101, B-205"
              />
            ) : (
              <p className="text-gray-200 py-2">{profileData.hostelRoom}</p>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label className="form-label">Account Type</label>
            <div className="flex items-center space-x-2 py-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user?.isAdmin 
                  ? 'bg-purple-900/30 text-purple-400 border border-purple-700/30' 
                  : 'bg-blue-900/30 text-blue-400 border border-blue-700/30'
              }`}>
                {user?.isAdmin ? 'Administrator' : 'Student'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-200">Account Information</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Member since:</span>
              <p className="font-medium text-gray-200">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Last login:</span>
              <p className="font-medium text-gray-200">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
