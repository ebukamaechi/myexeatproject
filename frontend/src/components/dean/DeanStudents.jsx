import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; 
import DataTable from "react-data-table-component";
import Logo from '../../assets/unnamed.png'; // Adjust the path as necessary
import { NotebookText } from "lucide-react";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;





export const DeanStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const navigate = useNavigate();

    useEffect(
        () => {
            fetchStudents();
        }, []
    );

    const fetchStudents = async () => {
        try {
            const result = await axios.get(`${BACKEND_API}/api/students/all`, { withCredentials: true });
            console.log(result);
            setStudents(result.data);

        } catch (error) {
            console.error('something failed: ', error);
            toast.error('systems error');
            setError('failed to load exeats');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(
        item =>
            item.matricNumber?.includes(filterText) ||
            item.studentDetails?.firstName?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.studentDetails?.lastName?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.studentDetails?.department?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.studentDetails?.email?.toLowerCase().includes(filterText.toLowerCase())
    );


    const columns = [
        {
            name: 'Matric',
            selector: row => row.matricNumber,
            sortable: true,
        },
        {
            name: 'First Name',
            selector: row => row.studentDetails?.firstName || 'N/A',
            sortable: true,
        },
        {
            name: 'Last Name',
            selector: row => row.studentDetails?.lastName || 'N/A',
            sortable: true,
        },
        {
            name: 'Department',
            selector: row => row.studentDetails?.department || 'N/A',
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
    ];



    return (
        <section style={{ padding: '20px' }}>
            <div className="bg-white shadow rounded-xl" style={{ padding: '10px ', animation: 'fadeIn 0.5s ease-in-out' }}>
                {error && <div className="text-red-500 mb-2">{error}</div>}

                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-lg font-semibold main-title">|Students</h2>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="px-3 py-2 border rounded w-full sm:w-auto"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                </div>
                <div className="overfolow-x-auto max-w-full">
                    <div >
                        <DataTable
                            columns={columns}
                            data={filteredStudents}
                            progressPending={loading}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            pointerOnHover
                            onRowClicked={(row) => navigate(`/dean-dashboard/students/view/${row._id}`)}

                        />
                    </div>
                </div>
            </div>
        </section>
    )
};


export const DeanStudentDetails = () => {
  const { userId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

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
          onClick={() => navigate(`/dean-dashboard/exeats/by-student/${student._id}`)}
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
              <button
                style={{ padding: '10px 20px' }} onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
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
    </section>
  );
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base font-medium text-gray-800">{value}</p>
  </div>
);

// export default DeanStudentDetails;
