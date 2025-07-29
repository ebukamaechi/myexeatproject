import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Logo from '../../assets/unnamed.png'; // Adjust the path as necessary

const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const SuperAdminStudentDetails = () => {
  const { userId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const navigate = useNavigate();

  const fetchStudent = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/api/students/${userId}/details`, {
        withCredentials: true,
      });
      setStudent(response.data.user);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load student details.");
      setError("Could not fetch student information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [userId]);

  const handleToggleClick = () => {
    setPendingAction(student?.isDisabled ? "enable" : "disable");
    setShowConfirmModal(true);
  };

  const handleConfirmedAction = async () => {
    setActionLoading(true);
    const action = pendingAction;

    try {
      await axios.put(`${BACKEND_API}/api/users/${action}-user/${student._id}`, {}, {
        withCredentials: true,
      });
      toast.success(`Student account ${action}d successfully.`);
      fetchStudent();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${action} account.`);
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
    }
  };
  const handleDeleteUser = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${BACKEND_API}/api/users/${student._id}`, {
        withCredentials: true,
        data: { password: confirmPassword },
      });
      toast.success("Student account deleted successfully.");
      navigate("/super-admin-dashboard/users/students"); // Or wherever you want to go
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete account: ${err.response?.data?.error || "Unknown error"}  `);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setConfirmPassword("");
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  const details = student?.studentDetails;

  return (
    <section className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-8"
      style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '20px', margin: '20px 10px' }}>
      <img src={Logo} alt="" style={{ height: '100px', width: '200px', maxWidth: '400px' }} />
      <h2 className="text-2xl font-semibold text-green-800 mb-6 border-b pb-2">Student Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name" value={student?.name} />
        <Field label="Matric Number" value={student?.matricNumber} />
        <Field label="Email" value={student?.email} />
        <Field label="Phone" value={details?.phone || "N/A"} />
        <Field label="Origin" value={details?.origin || "N/A"} />
        <Field label="Address" value={details?.address || "N/A"} />
      </div>

      <h3 className="text-xl font-semibold mt-8 text-gray-700">Academic Info</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <Field label="Department" value={details?.department || "N/A"} />
        <Field label="Faculty" value={details?.faculty || "N/A"} />
        <Field label="Hostel" value={details?.hostel || "N/A"} />
        <Field label="Quota" value={details?.quota ?? student?.quota ?? "N/A"} />
      </div>

      <h3 className="text-xl font-semibold mt-8 text-gray-700">Guardian Info</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <Field label="Guardian Name" value={details?.guardianName || "N/A"} />
        <Field label="Guardian Phone" value={details?.guardianPhone || "N/A"} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8"
        style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '10px', margin: '20px 10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          style={{ opacity: actionLoading ? 0.5 : 1, transition: 'opacity 0.3s ease', padding: '10px 20px', cursor: actionLoading ? 'not-allowed' : 'pointer' }}
          onClick={() => navigate(`/super-admin-dashboard/exeats/by-student/${student._id}`)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
        >
          View All Exeats
        </button>

        <button
          style={{ opacity: actionLoading ? 0.5 : 1, transition: 'opacity 0.3s ease', padding: '10px 20px', cursor: actionLoading ? 'not-allowed' : 'pointer' }}
          onClick={handleToggleClick}
          className={`px-4 py-2 text-white font-medium rounded ${student?.isDisabled
            ? "bg-orange-600 hover:bg-orange-700"
            : "bg-red-600 hover:bg-red-700"
            }`}
        >
          {student?.isDisabled ? "Enable Account" : "Disable Account"}
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-black text-white font-medium rounded hover:bg-red-900"
          style={{ opacity: actionLoading ? 0.5 : 1, cursor: actionLoading ? 'not-allowed' : 'pointer', padding: '10px 20px',transition: 'opacity 0.3s ease'  }}
        >
          Delete Account
        </button>

      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            animation: 'fadeIn 0.5s ease-in',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 className="text-xl font-semibold mb-2">Confirm Action</h2>
            <p>Are you sure you want to <strong>{pendingAction}</strong> this account?</p>
            <div className="flex justify-end gap-4 mt-6"
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button style={{ padding: '10px 20px' }} onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button
                style={{ opacity: actionLoading ? 0.5 : 1, transition: 'opacity 0.3s ease', padding: '10px 20px' }}
                onClick={handleConfirmedAction}
                disabled={actionLoading}
                className={`px-4 py-2 rounded text-white ${actionLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {actionLoading ? "Processing..." : `Yes, ${pendingAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <h2 className="text-xl font-semibold mb-2">Delete Account?</h2>
            <p>This action is permanent. Are you sure you want to delete this student account?</p>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your password to confirm"
                className="mt-4 px-4 py-2 border rounded w-full"
              />
            </div>
            <div
             style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}
            className="flex justify-end gap-4 mt-6">
              <button
              style={{ padding: '10px 20px' }}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
              
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                style={{ opacity: actionLoading ? 0.5 : 1, cursor: actionLoading ? 'not-allowed' : 'pointer', padding:'10px 20px' }}
              >
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
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

export default SuperAdminStudentDetails;
