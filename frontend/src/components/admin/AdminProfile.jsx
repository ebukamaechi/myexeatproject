import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const AdminProfile = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_API}/api/auth/me`, {
                withCredentials: true,
            });
            const user = response.data.user;
            setProfile(user);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // console.log('Submitting form data:', formData,  user._id);
            const res = await axios.put(`${BACKEND_API}/api/users/${user._id}`, formData, {
                withCredentials: true,
            });
            toast.success(`Profile updated! ${res.data.message}`);
            setEditMode(false);
            fetchProfile(); // refresh profile
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <section style={{ padding: '20px' }}>
            <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl">
                <div
                style={{
                    // margin:'10px',
                    padding: '10px'
                }}
                className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-green-700">Admin Profile</h2>
                    <button
                        style={{
                            cursor: loading ? 'not-allowed' : 'pointer',
                            padding: '10px',
                            backgroundColor: loading ? '#d1d5db' : '#16a34a',
                            color: '#fff',
                            borderRadius: '6px'
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => setEditMode(true)}
                    >
                        Edit Profile
                    </button>
                </div>

                {loading && <p className="text-gray-600">Loading...</p>}

                {!loading && profile && (
                    <div style={{padding:'10px'}} className="space-y-4">
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
                        <p><strong>Role:</strong> {profile.role}</p>
                    </div>
                )}
            </div>

            {editMode && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        style={{
                            animation: 'fadeIn 0.5s ease-in',
                            backgroundColor: '#fff',
                            padding: '24px',
                            borderRadius: '10px',
                            maxWidth: '700px',
                            width: '100%',
                            margin: '10px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3"
                    >
                        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>
                            <div
                                style={{
                                    marginTop: '24px',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px'
                                }}
                                className="flex justify-end gap-2 pt-4">
                                <button
                                    style={{
                                        padding: '10px 16px',
                                        // backgroundColor: '#e5e7eb',
                                        borderRadius: '6px'
                                    }}
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    style={{
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        padding: '10px 20px',
                                        backgroundColor: loading ? '#d1d5db' : '#16a34a',
                                        color: '#fff',
                                        borderRadius: '6px'
                                    }}
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminProfile;
