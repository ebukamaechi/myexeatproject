import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

export const EmergencyExeat = () => {
    const [loading, setLoading] = useState(false);
    const [studentChecked, setStudentChecked] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        matric: '',
        purpose: '',
        destination: '',
        departureDate: '',
        returnDate: ''
    });

    const [student, setStudent] = useState({
        matricNumber: '',
    });

    const checkStudent = async (matricNumber) => {
        setLoading(true);
        setStudentChecked(false);
        matricNumber = matricNumber.toUpperCase();
        try {
            const response = await axios.get(`${BACKEND_API}/api/students/onestudent/${matricNumber}`, { withCredentials: true });
            setError(null);
            setStudent({
                matric: response.data.matricNumber,
                fullName: `${response.data.studentDetails.firstName} ${response.data.studentDetails.middleName} ${response.data.studentDetails.lastName}`,
                name: response.data.name
            });
            setStudentChecked(true);
        } catch (error) {
            console.error(error?.response?.data?.error);
            setError(error?.response?.data?.error);
            setStudent({ matric: '', name: '', fullName: '' });
            setStudentChecked(false);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setLoading(false);
        setForm({
            matric: '',
            purpose: '',
            destination: '',
            departureDate: '',
            returnDate: ''
        });
        setStudentChecked(false);
        setError(null);
        setStudent({ matric: '', name: '', fullName: '' });
    };

    const submitEmergencyExeat = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                matricNumber: form.matric.toUpperCase(),
                purpose: form.purpose,
                destination: form.destination,
                departureDate: form.departureDate,
                returnDate: form.returnDate,
                // isEmergency: true
            };
            // console.log(payload);

            const response = await axios.post(`${BACKEND_API}/api/exeats/emergency`, payload, { withCredentials: true });
            console.log(response.data);
            toast.success("Emergency exeat submitted successfully!");
            handleReset();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error || "Failed to submit emergency exeat");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{ padding: '20px' }} className="p-4 md:p-6 lg:p-8">
            <h2 className=" text-xl md:text-2xl font-semibold mb-4 text-gray-800">Emergency Situations</h2>
            <div style={{ padding: '10px' }} className="bg-white shadow-md rounded-lg p-4 md:p-6">
                {error && <div className="text-red-500 mb-3">{error}</div>}

                <form onSubmit={submitEmergencyExeat} onReset={handleReset} className="space-y-6">
                    {/* Matric and Student Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Matric Number</label>
                            <input
                                type="text"
                                name="matric"
                                placeholder="Enter Matric"
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                style={{ textTransform: 'uppercase' }}
                                value={form.matric}
                                onKeyUp={(e) => checkStudent(e.target.value)}
                                onChange={(e) => setForm({ ...form, matric: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center justify-center md:justify-start">
                            {student.fullName && <span className="text-green-600 font-lg text-center" style={{ padding: '10px', borderBottom: '2px solid green',animation:'fadeIn 0.5s ease-in-out' }}>{student.fullName}</span>}
                        </div>
                    </div>

                    {/* Purpose and Destination */}
                    <div div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Purpose</label>
                            <input
                                type="text"
                                name="purpose"
                                placeholder="Purpose for Exeat"
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                value={form.purpose}
                                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Destination</label>
                            <input
                                type="text"
                                name="destination"
                                placeholder="Destination"
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                value={form.destination}
                                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Departure Date</label>
                            <input
                                type="date"
                                name="departureDate"
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                value={form.departureDate}
                                onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Return Date</label>
                            <input
                                type="date"
                                name="returnDate"
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                value={form.returnDate}
                                onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                            />
                        </div>
                    </div>




                    {/* Actions */}
                    <div className="flex flex-col md:flex-row gap-4 justify-end"
                        style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}
                    >
                        <button
                            style={{ padding: '10px 20px' }}
                            type="reset"
                            className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            style={{ padding: '10px 20px' }}
                            disabled={loading || !studentChecked}
                            className={`w-full md:w-auto px-4 py-2 text-white rounded transition ${loading || !studentChecked ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div >
        </section >
    );
};
