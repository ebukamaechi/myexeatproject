import DataTable from "react-data-table-component";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;


const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [registerStudentModal, setRegisterStudentModal] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [form, setForm] = useState({
        matricNumber: "",
        name: "",
        email: "",
        role: "",
        // password: "password123",
    });
    const [activeTab, setActiveTab] = useState("account");
    const [department, setDepartment] = useState("");
    const [level, setLevel] = useState("");
    const [faculty, setFaculty] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [stateOfOrigin, setStateOfOrigin] = useState("");
    const [origin, setOrigin] = useState("");
    const [guardianName, setGuardianName] = useState("");
    const [guardianPhone, setGuardianPhone] = useState("");
    const [guardianAddress, setGuardianAddress] = useState("");


    const navigate = useNavigate();

    useEffect(
        () => {
            fetchStudents();
        }, []
    );
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedValue = name === "matricNumber" ? value.toUpperCase() : value;
        setForm({ ...form, [name]: updatedValue });
    };


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

    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        if (!form.matricNumber || !form.email || !form.role || !firstName || !lastName) {
            toast.error("Please fill in all required fields");
            setLoading(false);
            return;
        }
        


        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        const payload = {
            ...form,
            name: fullName,
        };
        // Ensure matric number is uppercase
        payload.matricNumber = payload.matricNumber.toUpperCase();

        try {
            // STEP 1: Register user
            const response = await axios.post(`${BACKEND_API}/api/users`, payload, { withCredentials: true });
            toast.success(`Student registered: ${response.data.message}`);

            // // STEP 2: Add student details (only if role is 'student')
            if (form.role === 'student') {
                const studentDetailsPayload = {
                    firstName,
                    lastName,
                    department,
                    origin,
                    level,
                    faculty,
                    phone,
                    address,
                    guardianName, // instead of guardian: { name }
                    guardianPhone, // instead of guardian: { phone }
                };

                await axios.post(
                    `${BACKEND_API}/api/students/${form.matricNumber}/details`,
                    studentDetailsPayload,
                    { withCredentials: true }
                );
            }

            // Cleanup
            setRegisterStudentModal(false);
            setForm({
                matricNumber: "",
                email: "",
                role: "",
                password: "password123",
                name: "",
            });
            setFirstName("");
            setLastName("");
            setDepartment("");
            setLevel("");
            setFaculty("");
            setPhone("");
            setAddress("");
            setGender("");
            setDob("");
            setStateOfOrigin("");
            setOrigin("");
            setGuardianName("");
            setGuardianPhone("");
            setGuardianAddress("");
            setActiveTab("account");

            fetchStudents();

        } catch (err) {
            console.error(err);
            toast.error(`Error: ${err.response?.data?.error}`);
            setError(err.response?.data?.error || 'Failed to register student');
        } finally {
            setLoading(false);
        }
    };




    return (
        <section style={{ padding: '20px' }}>
            <div className="bg-white shadow rounded-xl" style={{ padding: '10px ', animation: 'fadeIn 0.5s ease-in-out' }}>
                {error && <div className="text-red-500 mb-2">{error}</div>}

                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                    <h2 className="text-lg font-semibold main-title">Students</h2>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-3 py-2 border rounded w-full sm:w-60"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                        <button
                            style={{ padding: '10px 10px' }}
                            className=" bg-green-600 text-white rounded hover:bg-green-700 transition"
                            onClick={() => {
                                setError(null);
                                setRegisterStudentModal(true);
                            }}
                        >
                            Add +
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto max-w-full">
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
                            onRowClicked={(row) => navigate(`/super-admin-dashboard/students/view/${row._id}`)}

                        />
                    </div>
                </div>
            </div>
            {registerStudentModal && (
                <div
                onClick={() => setRegisterStudentModal(false)} // clicking outside closes modal
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
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">


                    <div
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside the modal
                        style={{
                            animation: 'fadeIn 0.5s ease-in',
                            backgroundColor: '#fff',
                            padding: '24px',
                            borderRadius: '10px',
                            maxWidth: '700px',
                            width: '100%',
                            margin: '10px'
                        }}
                        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
                        <h3 className="text-xl font-bold mb-4 text-center">Register Student</h3>

                        {/* Tabs */}
                        <div className="flex border-b mb-4">
                            <button
                                onClick={() => setActiveTab("account")}
                                className={`flex-1 py-2 px-4 text-center border-b-2 transition ${activeTab === "account"
                                    ? "border-green-600 font-bold text-green-700"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Account Info
                            </button>
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`flex-1 py-2 px-4 text-center border-b-2 transition ${activeTab === "details"
                                    ? "border-green-600 font-bold text-green-700"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Student Info
                            </button>
                        </div>


                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                            {/* your form elements */}
                            <form className="space-y-4" onSubmit={handleRegisterStudent}>
                                {activeTab === "account" && (
                                    <>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                name="matricNumber"
                                                placeholder="Matric Number"
                                                value={form.matricNumber}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                                required
                                            />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Email"
                                                value={form.email}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <select
                                                name="role"
                                                value={form.role}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                                required
                                            >
                                                <option value="">Select Role</option>
                                                <option value="student">Student</option>
                                                {/* <option value="hostelAdmin">Hostel Admin</option> */}
                                            </select>
                                            <input
                                                type="text"
                                                name="password"
                                                disabled
                                                placeholder="Default Password"
                                                value="password123"
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                        </div>


                                    </>
                                )}

                                {activeTab === "details" && (
                                    <>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                name="firstName"
                                                placeholder="First Name"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                                required
                                            />
                                            <input
                                                type="text"
                                                name="lastName"
                                                placeholder="Last Name"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                placeholder="Department"
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Level"
                                                value={level}
                                                onChange={(e) => setLevel(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                placeholder="Phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Faculty"
                                                value={faculty}
                                                onChange={(e) => setFaculty(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                        </div>

                                        <textarea
                                            placeholder="Address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-4 py-2"
                                            rows="2"
                                        />
                                        <hr className="my-4" />
                                        <h4 className="text-lg font-semibold text-gray-700">Bio Data</h4>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                            <input
                                                type="date"
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                placeholder="State of Origin"
                                                value={stateOfOrigin}
                                                onChange={(e) => setStateOfOrigin(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="LGA"
                                                value={origin}
                                                onChange={(e) => setOrigin(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                        </div>


                                        <hr className="my-4" />
                                        <h4 className="text-lg font-semibold text-gray-700">Guardian Info</h4>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                placeholder="Guardian Name"
                                                value={guardianName}
                                                onChange={(e) => setGuardianName(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Guardian Phone"
                                                value={guardianPhone}
                                                onChange={(e) => setGuardianPhone(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-4 py-2"
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Guardian Address"
                                            value={guardianAddress}
                                            onChange={(e) => setGuardianAddress(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-4 py-2"
                                            rows={2}
                                        />
                                    </>
                                )}

                                <div
                                    style={{
                                        marginTop: '24px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px'
                                    }}
                                    className="flex justify-between mt-6 gap-4">
                                    <button
                                        style={{
                                            padding: '10px 16px',
                                            // backgroundColor: '#e5e7eb',
                                            borderRadius: '6px'
                                        }}
                                        type="button"
                                        onClick={() => setRegisterStudentModal(false)}
                                        className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
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
                                        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                        disabled={loading}
                                    >
                                        {loading ? "Registering..." : "Register"}
                                    </button>
                                </div>
                            </form>
                        </div>



                    </div>
                </div>
            )}

        </section>
    )
};

export default ManageStudents;