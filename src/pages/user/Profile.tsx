import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Save, 
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Bell,
  Shield,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    propertyAlerts: true,
    viewingReminders: true
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- CHANGE: This function now fetches the complete, up-to-date user profile from the database ---
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) {
      setIsPageLoading(false);
      setError("Could not identify user. Please log in again.");
      return;
    }
    
    setIsPageLoading(true);
    try {
      const { data: userProfile, errors } = await client.models.User.get({ id: user.id });
      if (errors || !userProfile) {
        throw new Error(errors?.[0]?.message || "User profile not found in the database.");
      }

      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        // --- FIX: Use the avatarUrl from the database as the primary source ---
        avatar: userProfile.avatarUrl || user?.avatar || ''
      });

    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load your profile data. Please try refreshing the page.");
    } finally {
      setIsPageLoading(false);
    }
  }, [user?.id, user?.avatar]);

  // --- CHANGE: This useEffect now triggers the data fetch when the component loads ---
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      alert("Cannot save profile. User not authenticated.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const { data: updatedUser, errors } = await client.models.User.update({
        id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      });

      if (errors || !updatedUser) {
        throw new Error(errors?.[0]?.message || "Failed to update profile.");
      }

      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Could not save your changes. Please try again.");
      alert(`Error: ${err.message || 'Could not save your changes.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
      alert('Password updated successfully!');
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      logout();
      navigate('/');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong.</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
                Refresh Page
            </button>
        </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="relative mb-6">
              <img
                src={formData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.email}`}
                alt={formData.name}
                className="w-24 h-24 rounded-full mx-auto border-4 border-primary-200"
              />
              <button className="absolute bottom-0 right-1/2 transform translate-x-12 translate-y-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.name}</h3>
            <p className="text-gray-600 mb-4">{formData.email}</p>
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-primary-600 font-medium">
                {user?.userType === 'lister' ? 'Property Lister' : 'Property Seeker'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-6 h-6 mr-3 text-primary-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input type="text" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all" placeholder="Tell us about yourself..." />
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button onClick={handleSaveProfile} disabled={isLoading} className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50">
                {isLoading ? (<Loader2 className="w-4 h-4 mr-2 animate-spin" />) : (<Save className="w-4 h-4 mr-2" />)}
                Save Changes
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-primary-600" />
              Security Settings
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                </div>
                <button onClick={() => setShowPasswordFields(!showPasswordFields)} className="flex items-center px-4 py-2 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Change Password
                </button>
              </div>
              {showPasswordFields && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input type={showCurrentPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-10 text-gray-400 hover:text-gray-600">
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input type={showNewPassword ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-10 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input type={showConfirmPassword ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-10 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setShowPasswordFields(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handlePasswordUpdate} disabled={isLoading} className="flex items-center px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all font-medium disabled:opacity-50">
                      {isLoading ? (<Loader2 className="w-4 h-4 mr-2 animate-spin" />) : (<Lock className="w-4 h-4 mr-2" />)}
                      Update Password
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Bell className="w-6 h-6 mr-3 text-primary-600" />
              Notification Preferences
            </h2>
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via text message' },
                { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive updates about new features and offers' },
                { key: 'propertyAlerts', label: 'Property Alerts', description: 'Get notified about new properties matching your criteria' },
                { key: 'viewingReminders', label: 'Viewing Reminders', description: 'Receive reminders about scheduled viewings' }
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <h3 className="font-medium text-gray-900">{pref.label}</h3>
                    <p className="text-sm text-gray-600">{pref.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={preferences[pref.key as keyof typeof preferences]} onChange={(e) => handlePreferenceChange(pref.key, e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
              <Trash2 className="w-6 h-6 mr-3" />
              Danger Zone
            </h2>
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="font-bold text-red-900 mb-2">Delete Account</h3>
              <p className="text-red-700 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button onClick={handleDeleteAccount} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
