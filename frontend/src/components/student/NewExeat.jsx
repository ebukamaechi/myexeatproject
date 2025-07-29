import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;
const NewExeat = () => {
    // console.log();


    // State for form fields
    const [form, setForm] = useState({
        purpose: '',
        destination: '',
        departureDate: '',
        returnDate: '',
    });
    // const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [showModal, setShowModal] = useState(false);


    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (name === 'terms') {
            setIsChecked(checked);
        }

    };

    // Handle form submission
    const handleSubmit = async (e) => {
        setLoading(true);
        // setError(null);
        e.preventDefault();
        // You can add API call here
        if (!form.purpose || !form.destination || !form.departureDate || !form.returnDate || !isChecked) {
            // setError('Please fill out all fields and agree to the terms.');
            toast.error('Please fill out all fields and agree to the terms.');
            setLoading(false);
            return;
        }
        if (new Date(form.departureDate) >= new Date(form.returnDate)) {
            // setError('Return date must be after departure date.');
            toast.error('Return date must be after departure date.');
            setLoading(false);
            return;
        }
        // Simulate API call
        try {
            const res = await axios.post(`${BACKEND_API}/api/exeats/request`, {
                purpose: form.purpose,
                destination: form.destination,
                departureDate: form.departureDate,
                returnDate: form.returnDate,
            }, { withCredentials: true });
            console.log('Exeat created: ', res.data);
            // setError('');
            setForm(
                {
                    purpose: '',
                    destination: '',
                    departureDate: '',
                    returnDate: '',
                }
            );
            setIsChecked(false);
            setShowModal(false);
            toast.success('Exeat request submitted successfully!');



        } catch (error) {
            console.error(error);
            toast.error('Failed to submit exeat request. Please try again.');
            // setError('Error: ' + error?.response);
        } finally {
            setLoading(false);
        }
    };

    // Handle form reset
    const handleReset = () => {
        setLoading(false);
        setForm({
            purpose: '',
            destination: '',
            departureDate: '',
            returnDate: '',
        });
        // setError(null);
        setIsChecked(false);
    };

    return (
        <div className='container mx-auto p-4 bg-gray-100 min-h-screen flex flex-col ' style={{ minHeight: '100vh', padding: '20px' }}>
            <h1 className='text-2xl font-bold mb-4 main-title' >|Create New Exeat</h1>
            <div className='bg-white p-6 rounded-lg shadow-md' style={{ maxWidth: '800px', margin: '10px auto', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                <form onReset={handleReset}>
                    <div className='grid grid-cols-2 gap-4 mb-4' style={{ marginBottom: '10px' }}>
                        <div>
                            <label htmlFor="purpose">Purpose for Exeat:</label>
                            <input
                                type="text"
                                id="purpose"
                                name="purpose"
                                placeholder="Purpose for Exeat"
                                required
                                value={form.purpose}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="destination">Destination:</label>
                            <input
                                type="text"
                                id="destination"
                                name="destination"
                                placeholder="Destination"
                                required
                                value={form.destination}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4' style={{ marginBottom: '10px' }}>
                        <div>
                            <label htmlFor="departureDate">Departure Date:</label>
                            <input
                                type="date"
                                id="departureDate"
                                name="departureDate"
                                placeholder="Departure Date"
                                required
                                value={form.departureDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="returnDate">Return Date:</label>
                            <input
                                type="date"
                                id="returnDate"
                                name="returnDate"
                                placeholder="Return Date"
                                required
                                value={form.returnDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        <label htmlFor="notes">Note:</label>
                        <div className='col-span-2 '>
                            <ul className='list-disc pl-5' style={{ marginLeft: '20px' }}>
                                <li className="text-sm text-gray-700">Please ensure all details are correct before submitting.</li>
                                <li className="">Exeat requests are subject to approval by the school administration.</li>
                                <li>Ensure that your reason for the exeat is valid and clearly stated.</li>
                                <li>Exeat requests must be submitted at least 24 hours in advance.</li>
                                <li>Your exeat quota will be reduced by one upon approval.</li>
                                <li>All details must be filled out accurately to avoid delays.</li>
                            </ul>
                        </div>
                        <p>By submitting this form, you agree to the terms and conditions outlined above.</p>
                    </div>
                    <div className='flex items-center mt-4'>
                        <label htmlFor="terms" className='flex items-center'>
                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                required
                                checked={isChecked}
                                onChange={handleChange}
                                className="mr-2 leading-tight "
                                style={{ width: '20px', height: '20px', borderRadius: '4px', borderColor: '#ccc', cursor: 'pointer', backgroundColor: '#fff', marginRight: '10px' }}
                            />
                            I agree to the terms and conditions
                        </label>
                    </div>
                    {/* {error && <p className='text-red-500'>{error}</p>} */}
                    <div className='flex justify-end gap-4 mt-4'>
                        <button type="button" onClick={handleReset} className='bg-gray-300 px-4 py-2 rounded ' style={{ cursor: 'pointer', padding: '10px 20px' }}>Reset</button>
                        {/* submit button disabled too if not checked. disabled button color */}
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            disabled={loading || !isChecked}
                            className={`px-4 py-2 rounded ${loading || !isChecked ? 'bg-gray-400' : 'bg-green-600 text-white'}`}
                            style={{ cursor: loading || !isChecked ? 'not-allowed' : 'pointer', padding: '10px 20px', backgroundColor: loading || !isChecked ? '#d1d5db' : '#16a34a', color: '#fff', borderRadius: '6px' }}
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>

                    </div>
                    {/* Modal */}
                    {showModal && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '10px',
                                maxWidth: '400px',
                                width: '90%'
                            }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Confirm Request</h3>
                                   <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>1 Quota will be deducted from your available balance, this is Irreversible!</p>
                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button onClick={() => setShowModal(false)} style={{ padding: '10px 16px', backgroundColor: '#e5e7eb', borderRadius: '6px' }}>Cancel</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !isChecked}
                                        className={`px-4 py-2 rounded ${loading || !isChecked ? 'bg-gray-400' : 'bg-green-600 text-white'}`}
                                        style={{ cursor: loading || !isChecked ? 'not-allowed' : 'pointer', padding: '10px 20px', backgroundColor: loading || !isChecked ? '#d1d5db' : '#16a34a', color: '#fff', borderRadius: '6px' }}
                                    >
                                        {loading ? 'Submitting...' : 'Submit'}
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default NewExeat;
