import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const QuotaPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [incrementValue, setIncrementValue] = useState("");
    const [studentChecked, setStudentChecked] = useState(false);
    const [matricNumber, setMatricNumber] = useState("");
    const [newQuota, setNewQuota] = useState("");
    const [student, setStudent] = useState({ matricNumber: "" });

    const checkStudent = async (matric) => {
        if (!matric.trim()) return;
        setLoading(true);
        setStudentChecked(false);
        try {
            const response = await axios.get(`${BACKEND_API}/api/students/onestudent/${matric.toUpperCase()}`, { withCredentials: true });
            setStudent({
                matric: response.data.matricNumber,
                fullName: `${response.data.studentDetails.firstName} ${response.data.studentDetails.middleName} ${response.data.studentDetails.lastName}`,
                name: response.data.name
            });
            setStudentChecked(true);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.error || "Student not found");
            setStudent({ matric: "", name: "", fullName: "" });
            setStudentChecked(false);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setLoading(false);
        setStudentChecked(false);
        setError(null);
        setMatricNumber("");
        setNewQuota("");
        setStudent({ matric: '', name: '', fullName: '' });
    };

    const submitQuotaUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const matric = matricNumber.toUpperCase();
            const newNumericValue = Number(newQuota);
            if (isNaN(newNumericValue) || newNumericValue <= 0) {
                toast.error("Please enter a valid positive number");
                setLoading(false);
                return;
            }
            // const payload = {
            //     newQuota: Number(newQuota),
            // };
            if (!studentChecked || !newNumericValue || !matricNumber) {
                toast.error("Fill all fields and verify student first.");
                return;
            }

            const response = await axios.put(`${BACKEND_API}/api/quota/onboarding/${matric}`, { quota: newNumericValue }, { withCredentials: true });
            console.log(response.data);
            toast.success(`Quota updated successfully for ${matric}`);
            handleReset();
        } catch (error) {
            console.error(error);
            toast.error("Error updating quota");
        } finally {
            setLoading(false);
        }
    };

    const submitQuotaIncrement = async (e) => {
        e.preventDefault();
        setLoading(true);
        const numericValue = Number(incrementValue);
        if (isNaN(numericValue) || numericValue <= 0) {
            toast.error("Please enter a valid positive number");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.put(`${BACKEND_API}/api/quota/increment`, { incrementValue: numericValue }, { withCredentials: true });
            toast.success(res.data.message || "Quota incremented");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.error || "Failed to increment quota");
        } finally {
            setLoading(false);
            setIncrementValue("");
        }
    };

    return (
        <section className="p-4 space-y-8" style={{ padding: '10px' }}>
            <h1 className="text-2xl font-bold text-green-800 mb-6" style={{ padding: '10px', marginBottom: '20px' }}>Quota Management</h1>
            {/* Update Specific Student */}
            <div className="bg-white rounded-xl shadow p-6" style={{ padding: '10px' }}>
                <h2 className="text-xl font-semibold text-green-700 mb-4" style={{ padding: '10px', marginBottom: '10px' }}>Update Student Quota</h2>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

                <form onSubmit={submitQuotaUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Matric Number:</label>
                            <input
                                type="text"
                                name="matricNumber"
                                value={matricNumber}
                                style={{ textTransform: 'uppercase' }}
                                onChange={(e) => setMatricNumber(e.target.value)}
                                onKeyUp={(e) => {
                                    const value = e.target.value.trim();
                                    if (value.length >= 5) checkStudent(value); // Minimum chars to reduce calls
                                }}

                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter Matric Number"
                            />
                        </div>
                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">New Quota:</label>
                            <input
                                type="number"
                                name="newQuota"
                                value={newQuota}
                                onChange={(e) => setNewQuota(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter New Quota"
                            />
                        </div>
                    </div>

                    {student.fullName && (
                        <div style={{ padding: '10px 5px' }} className="text-green-600 font-medium border-l-4 border-green-500 pl-4">
                            {student.fullName}
                        </div>
                    )}

                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading || !studentChecked}
                            style={{ padding: '10px 20px' }}
                            className={`px-4 py-2 rounded text-white ${loading || !studentChecked
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {loading ? "Updating..." : "Update Quota"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Increment All Students */}
            <div className="bg-white rounded-xl shadow p-6" style={{ padding: '10px', marginTop: '20px' }}>
                <h2 className="text-xl font-semibold text-green-700 mb-4" style={{ padding: '10px', marginBottom: '10px' }}>Increment All Students' Quota</h2>
                <form onSubmit={submitQuotaIncrement} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Increment By:</label>
                            <input
                                type="number"
                                value={incrementValue}
                                onChange={(e) => setIncrementValue(e.target.value)}
                                placeholder="e.g. 1"
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: '10px 20px' }}
                            className={`px-4 py-2 rounded text-white ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default QuotaPage;
