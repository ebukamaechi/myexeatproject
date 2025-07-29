import DataTable from "react-data-table-component";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const ManageSecurityAccounts = () => {
    const [securityAccounts, setSecurityAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const navigate = useNavigate();
    const [registerSecurityAccountModal, setRegisterSecurityAccountModal] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: ''
    });

    useEffect(() => {
        fetchSecurityAccounts();
    }, []);

    const fetchSecurityAccounts = async () => {
        try {
            setLoading(true);
            const result = await axios.get(`${BACKEND_API}/api/users?role=security`, { withCredentials: true });
            console.log(result);
            setSecurityAccounts(result.data);
        } catch (error) {
            console.error('something failed: ', error);
            toast.error('systems error');
            setError('failed to load security accounts');
        } finally {
            setLoading(false);
        }
    };

    const filteredSecurityAccounts = securityAccounts.filter(
        item =>
            item.name?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.email?.toLowerCase().includes(filterText.toLowerCase())
    );

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Disabled',
            selector: row => row.isDisabled ? 'Yes' : 'No',
            sortable: true,
        },
    ];

    const handleRegisterSecurityAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // const formData = new FormData(e.target);
            // const data = {
            //     name: formData.get('name'),
            //     email: formData.get('email'),
            //     password: formData.get('password'),
            //     role: 'hostelAdmin'
            // };
            const response = await axios.post(`${BACKEND_API}/api/users`, form, { withCredentials: true });
            console.log('Security account registered:', response.data);
            toast.success('Security account registered successfully');
            setError(null);
            // Optionally, you can reset the form or close the modal here
            e.target.reset();
            setRegisterSecurityAccountModal(false);
            setForm({ name: "", email: "", role: "security" });
            fetchSecurityAccounts(); // Refresh the list after adding a new security account

        } catch (error) {
            console.error('Error registering security account:', error);
            // setError('Failed to register security account. Please try again.');
            if (error.response?.data?.error || error.response?.data?.message) {
                toast.error(error.response.data.error || error.response.data.message);
            } else {
                toast.error("Failed to register security account.");
            }
        } finally {
            setLoading(false);
            // setRegisterSecurityAccountModal(false);
            fetchSecurityAccounts(); // Refresh the list after adding a new security account
        }
    };

    return (
        <section style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>


            <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl" style={{ padding: '20px', margin: '20px auto', animation: 'fadeIn 0.5s ease-in-out' }}>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                    <h2 className="text-2xl font-bold mb-6" style={{ padding: "10px", borderBottom: "1px solid #eee", color: "#19533d" }}>| Manage Security Accounts</h2>

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
                                setForm({ name: "", email: "", role: "security" });
                                setError(null);
                                setRegisterSecurityAccountModal(true);
                            }}
                        // disabled={loading}
                        >
                            Add +
                        </button>
                    </div>

                </div>

                <div className="overflow-x-auto max-w-full mb-4">
                    <div>
                        <DataTable
                            // title="Security Accounts"
                            columns={columns}
                            data={filteredSecurityAccounts}
                            progressPending={loading}
                            pagination
                            highlightOnHover
                            responsive
                            striped
                            pointerOnHover
                            onRowClicked={(row) => navigate(`/super-admin-dashboard/security/${row._id}`)}
                            noDataComponent="No security accounts found."

                        // subHeader
                        // subHeaderComponent={
                        //     <input
                        //         type="text"
                        //         placeholder="Filter by name or email"
                        //         value={filterText}
                        //         onChange={e => setFilterText(e.target.value)}
                        //         className="p-2 border border-gray-300 rounded"
                        //     />
                        // }
                        />
                    </div>
                </div>
            </div>


            {/* Modal for Registering Security Account */}
            {registerSecurityAccountModal && (
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
                    // onClick={() => setRegisterHostelAdminModal(false)} // clicking outside closes modal
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
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
                        // onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside the modal
                        className="bg-white p-6 rounded shadow-lg w-full max-w-md"
                    >
                        <h3 className="text-xl font-semibold mb-4">Register Security</h3>
                        {/* Registration form goes here */}
                        <p>Password should be changed immediately after registration</p>
                        <form onSubmit={handleRegisterSecurityAccount} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                    placeholder="Enter name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                    placeholder="Enter email"
                                />
                            </div>
                            {/* disabled input showing default password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="text"
                                    name="password"
                                    value="password123"
                                    disabled
                                    readOnly
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                    placeholder="Enter role (hostelAdmin)"
                                />
                            </div>

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
                                    onClick={() => setRegisterSecurityAccountModal(false)}
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
                                    // onClick={handleRegisterHostelAdmin}
                                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add"}
                                </button>
                            </div>
                        </form>


                    </div>
                </div>
            )}
        </section>
    );
};

export default ManageSecurityAccounts;
