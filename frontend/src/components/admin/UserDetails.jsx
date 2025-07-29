import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Logo from '../../assets/unnamed.png';

const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const HostelAdminDetails = ({ role }) => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    const fetchAdmin = async () => {
        try {
            const res = await axios.get(
                `${BACKEND_API}/api/users/users-by-role?role=${role}`,
                { withCredentials: true }
            );

            const found = res.data.find((user) => user._id === userId);
            if (!found) throw new Error("Admin not found");

            setAdmin(found);
        } catch (err) {
            toast.error(`Failed to load hostel admin details. ${err.response?.data?.error || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchAdmin();
    }, [userId, role]);


    const handleToggleClick = () => {
        setPendingAction(admin?.isDisabled ? "enable" : "disable");
        setShowConfirmModal(true);
    };

    const handleConfirmedAction = async () => {
        setActionLoading(true);
        try {
            await axios.put(`${BACKEND_API}/api/users/${pendingAction}-user/${admin._id}`, {}, {
                withCredentials: true,
            });
            toast.success(`Account ${pendingAction}d successfully.`);
            fetchAdmin();
        } catch (err) {
            toast.error(`Failed to ${pendingAction} account. ${err.response?.data?.error || "Unknown error"}`);
        } finally {
            setActionLoading(false);
            setShowConfirmModal(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await axios.put(
                `${BACKEND_API}/api/users/${admin._id}`,
                editData,
                { withCredentials: true }
            );
            toast.success(`Admin updated successfully ${res.data.user.name}`);
            setShowEditModal(false);
            fetchAdmin(); // Refresh data
        } catch (err) {
            toast.error(`Failed to update admin. ${err.response?.data?.error || "Unknown error"}`);
        } finally {
            setActionLoading(false);
        }
    };


    const handleDeleteUser = async () => {
        setActionLoading(true);
        try {
            await axios.delete(`${BACKEND_API}/api/users/${admin._id}`, {
                withCredentials: true,
                data: { password: confirmPassword },
            });
            toast.success("Hostel admin deleted successfully.");
            navigate("/super-admin-dashboard/users/hostel-admins");
        } catch (err) {
            toast.error(`Delete failed: ${err.response?.data?.error || "Unknown error"}`);
        } finally {
            setActionLoading(false);
            setShowDeleteModal(false);
            setConfirmPassword("");
        }
    };

    if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (!admin) return <p className="text-center py-10 text-red-500">Admin not found.</p>;

    return (
        <section style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '20px', margin: '20px' }} className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-8">
            <img src={Logo} alt="Logo" className="h-20 w-auto mb-4" />
            <h2 className="text-2xl font-semibold text-green-800 mb-4 border-b pb-2">Staff Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginTop:'10px'}}>
                <Field label="Full Name" value={admin.name} />
                <Field label="Email" value={admin.email} />
                <Field label="Phone" value={admin.phone || "N/A"} />
                {/* <Field label="Assigned Hostel(s)" value={admin.hostels?.join(", ") || "N/A"} /> */}
                <Field label="Role" value={admin.role || "Hostel Admin"} />
                <Field label="Status" value={admin.isDisabled ? "Disabled" : "Active"} />
            </div>

            <div 
            style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '10px auto', margin: '10px' }}
            className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                <button
                style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '10px', margin: '10px', cursor: actionLoading? 'not-allowed' :'pointer' }}
                    disabled={actionLoading}
                    onClick={() => {
                        setEditData(admin);
                        setShowEditModal(true);
                    }}

                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Edit Admin
                </button>

                <button
                style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '10px', margin: '10px', cursor: actionLoading? 'not-allowed' :'pointer' }}  
                    onClick={handleToggleClick}
                    disabled={actionLoading}
                    className={`px-4 py-2 text-white rounded ${admin.isDisabled
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-red-600 hover:bg-red-700"}`}
                >
                    {admin.isDisabled ? "Enable Account" : "Disable Account"}
                </button>

                <button
                style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '10px', margin: '10px', cursor: actionLoading? 'not-allowed' :'pointer' }}
                    onClick={() => setShowDeleteModal(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-red-900"
                >
                    Delete Admin
                </button>
            </div>

            {/* Confirm Disable/Enable Modal */}
            {showConfirmModal && (
                <Modal
                    title="Confirm Action"
                    content={`Are you sure you want to ${pendingAction} this account?`}
                    confirmText={`Yes, ${pendingAction}`}
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmedAction}
                    loading={actionLoading}
                    confirmColor="green"
                />
            )}
            {/* Edit Modal */}
            {showEditModal && (
                <Modal
                    title="Edit Admin"
                    content={
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={editData?.name || ""}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={editData?.email || ""}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={editData?.phone || ""}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                            </div>
                        </form>
                    }
                    confirmText="Save Changes"
                    onCancel={() => setShowEditModal(false)}
                    onConfirm={handleEditSubmit}
                    loading={actionLoading}
                    confirmColor="blue"
                />
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <Modal
                    title="Delete Admin?"
                    content={
                        <>
                            <p>This action is permanent. Enter your password to confirm deletion.</p>
                            <input
                                type="password"
                                className="mt-4 px-4 py-2 border rounded w-full"
                                placeholder="Enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </>
                    }
                    confirmText="Yes, Delete"
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteUser}
                    loading={actionLoading}
                    confirmColor="red"
                />
            )}
        </section>
    );
};

const Field = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-800">{value}</p>
    </div>
);

const Modal = ({ title, content, confirmText, onCancel, onConfirm, loading, confirmColor }) => (
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
        className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
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
            className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">{title}</h2>
            <div className="mb-4">{content}</div>
            <div
                style={{
                    marginTop: '24px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}
                className="flex justify-end gap-4">
                <button
                    style={{
                        padding: '10px 16px',
                        // backgroundColor: '#e5e7eb',
                        borderRadius: '6px'
                    }}
                    onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button
                    style={{
                        cursor: loading ? 'not-allowed' : 'pointer',
                        padding: '10px 20px',
                        backgroundColor: loading ? '#d1d5db' : '#16a34a',
                        color: '#fff',
                        borderRadius: '6px'
                    }}
                    onClick={onConfirm}
                    disabled={loading}
                    className={`px-4 py-2 rounded text-white ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : confirmColor === "red"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                >
                    {loading ? "Processing..." : confirmText}
                </button>
            </div>
        </div>
    </div>
);

export default HostelAdminDetails;
