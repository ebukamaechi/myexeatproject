import React, { useState } from 'react';
import axios from 'axios';
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const Settings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    notifications: true,
    theme: 'light',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    console.log('Profile Settings Saved:', profileData);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);
 
    const { currentPassword, newPassword, confirmPassword } = passwordData;
   
  if (newPassword !== confirmPassword) {
    setError("New passwords don't match!");
    setLoading(false);
    return;
  }
    try {
      // 

      const res = await axios.put(
        `${BACKEND_API}/api/users/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError(''); // Clear any previous error
      setSuccess('Password updated successfully.');

      console.log('Password Changed:', res);
    } catch (error) {
      console.log(error?.response?.data?.message);
      setError('Error: ', error?.response?.data?.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl" style={{ padding: '20px', margin: '20px auto' }}>
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

      {/* Tabs */}
      <div className="flex border-b mb-6" >
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          style={{ margin: '10px' }}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`ml-4 px-4 py-2 font-medium ${activeTab === 'password' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
        >
          Password
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="notifications"
              checked={profileData.notifications}
              onChange={handleProfileChange}
              className="mr-2"
            />
            <label className="font-medium">Enable notifications</label>
          </div>

          <div>
            <label className="block mb-1 font-medium">Theme</label>
            <select
              name="theme"
              value={profileData.theme}
              onChange={handleProfileChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>

          <div className="text-right">
            <button
              disabled={loading}
              type="submit"
              className={`text-white px-6 py-2 rounded hover:bg-green-700 ${loading ? 'bg-gray-600' : 'bg-green-600 '}`} style={{ cursor: 'pointer', padding: '10px 10px', }}
            >
              {loading ? 'Updating' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
      {error && <p className='text-red-500'>{error}</p>}{success && <p className='text-green-500'>{success}</p>}

    </div>
  );
};

export default Settings;
