import React from 'react';
import Layout from '../common/Layout';
import { Link, useNavigate } from 'react-router-dom';
import StudentExeats from './ExeatComponent';
import axios from 'axios';
import { useEffect, useState } from 'react';

const BACKEND_API = import.meta.env.VITE_API_BASE_URL;


const Exeats = ({ user }) => {
    const [recentExeat, setRecentExeat] = useState(null);
    const [quotaBalance, setQuotaBalance] = useState(0);
    const [isStudentDetails, setIsStudentDetails] = useState(false);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
    });
    const navigate = useNavigate();
    // const viewExeat = (id) => {
    //     navigate(`/student-dashboard/exeats/view/${id}`);
    // };



    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${BACKEND_API}/api/students/`, {
                    withCredentials: true,
                });
                const newStudentDetails = res.data.user.studentDetails;
                if (newStudentDetails) {
                    setIsStudentDetails(true);
                };

            } catch (err) {
                console.error('Error loading profile:', err);
                setIsStudentDetails(false);
                // toast.error('Failed to load profile.');
            }
        };

        const fetchMostRecentExeat = async () => {
            try {
                const res = await axios.get(`${BACKEND_API}/api/exeats/my-exeats`, { withCredentials: true });
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setRecentExeat(res.data[0]); // Most recent request
                    console.log(res.data[0]);
                }
                console.log(res);
                // setRecentExeat(res.data);
            } catch (err) {
                console.error('Failed to fetch recent exeat', err);
            }
        };
        const fetchQuotaBalance = async () => {
            try {
                const res = await axios.get(`${BACKEND_API}/api/quota/balance`, { withCredentials: true });
                setQuotaBalance(res.data.quota);
                console.log('Quota balance:', res);
            } catch (err) {
                console.error('Failed to fetch quota balance', err);
            }
        };
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${BACKEND_API}/api/exeats/stats`, { withCredentials: true });
                console.log('Stats response:', res);
                setStats({
                    totalRequests: res.data.totalRequests || 0,
                    pendingRequests: res.data.pendingRequests || 0,
                    approvedRequests: res.data.approvedRequests || 0,
                    rejectedRequests: res.data.rejectedRequests || 0,
                });
            } catch (err) {
                console.error('Failed to fetch stats', err);
            }
        };
        fetchProfile();
        fetchStats();
        fetchQuotaBalance();
        fetchMostRecentExeat();
    }, []);

    return (
        <div className="container mx-auto p-6" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
            <div className=' ' style={{ marginTop: '10px', marginBottom: '10px' }}>
                <h2 className="text-2xl font-bold main-title">|Exeats</h2>
                <p className="text-sm text-gray-500">{user?.name}, welcome back! </p>
            </div>

            <div className="p-4 space-y-6">
                {/* First Row - 4 Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 " style={{ marginBottom: '30px', animation: 'fadeIn ease-in-out 0.5s' }}>
                    {/* Example Card from First Row */}
                    <div className="bg-white shadow rounded-xl p-2 flex justify-between items-center transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '15px' }}>
                        <h2 className="text-lg text-green-500 font-semibold" style={{ margin: 'auto' }}>
                            {quotaBalance !== null ? quotaBalance : '...'}
                        </h2>
                        <div className="text-left" style={{ margin: 'auto' }}>
                            <p className="text-sm text-gray-500">Available<br />Quota</p>
                            {/* <span className="text-green-600 font-bold"></span> */}
                        </div>
                    </div>
                    {/* Example Card from First Row */}
                    <div className="bg-white shadow rounded-xl p-2 flex justify-between items-center transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '15px' }}>
                        <h2 className="text-lg text-blue-600 font-semibold" style={{ margin: 'auto' }}>{stats.totalRequests}</h2>
                        <div className="text-left" style={{ margin: 'auto' }}>
                            <p className="text-sm text-gray-500">Requests <br /> Made</p>
                            {/* <span className="text-green-600 font-bold">Quota</span> */}
                        </div>
                    </div>
                    {/* Example Card from First Row */}
                    <div className="bg-white shadow rounded-xl p-2 flex justify-between items-center transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '15px' }}>
                        <h2 className="text-lg text-yellow-400 font-semibold" style={{ margin: 'auto' }}>{stats.pendingRequests}</h2>
                        <div className="text-left" style={{ margin: 'auto' }}>
                            <p className="text-sm text-gray-500">Pending <br /> Requests</p>
                            {/* <span className="text-green-600 font-bold">Quota</span> */}
                        </div>
                    </div>
                    {/* Example Card from First Row */}
                    <div className="bg-white shadow rounded-xl p-2 flex justify-between items-center transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '15px' }}>
                        <h2 className="text-lg text-red-600 font-semibold" style={{ margin: 'auto' }}>{stats.rejectedRequests}</h2>
                        <div className="text-left" style={{ margin: 'auto' }}>
                            <p className="text-sm text-gray-500">Rejected <br /> Requests</p>
                            {/* <span className="text-green-600 font-bold">Quota</span> */}
                        </div>
                    </div>

                </div>

                {!isStudentDetails && (
                    <div className="bg-red-500 shadow rounded-xl p-4 text-white text-sm transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '20px', marginBottom: '20px' }}>
                        <p className='text-sm'>Please update your student details on the <Link to="/student-dashboard/profile" className='text-green-500'>Profile</Link> tab. you cannot request an Exeat until you do so</p>
                    </div>
                )}

                {/* Second Row - 2 Columns */}
                <div className="lg:flex gap-4" style={{ marginBottom: '30px' }}>
                    {/* <div className="bg-white shadow rounded-xl p-4 text-gray-500 text-sm transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '10px' }}>
                        No recent exeat request found.
                    </div> */}
                    {/* Left Column (8/12) */}
                    <div className="lg:w-9/12 flex flex-col gap-4 " style={{ marginTop: '10px', marginBottom: '10px' }}>
                        {/* First Card in Second Row */}
                        {recentExeat ? (
                            <div

                                className="bg-white shadow rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 transition-transform hover:scale-105 hover:shadow-lg duration-300"
                                style={{ animation: 'fadeIn ease-in-out 0.5s ', padding: "10px" }}
                            >
                                <div className="flex flex-col items-start">
                                    <div
                                        className="max-w-[180px] truncate text-sm text-gray-600 font-bold"
                                        title={`#${recentExeat._id}`}
                                    >
                                        #{recentExeat._id.substring(0, 8)}...
                                    </div>
                                </div>

                                <div className="flex flex-col items-start">
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <p
                                        className={`text-sm font-bold ${recentExeat.requestStatus === 'approved'
                                            ? 'text-green-600'
                                            : recentExeat.requestStatus === 'pending'
                                                ? 'text-yellow-600'
                                                : recentExeat.requestStatus === 'recommended'
                                                    ? 'text-orange-700'
                                                    : recentExeat.requestStatus === 'cancelled'
                                                        ? 'text-red-600'
                                                        : recentExeat.requestStatus === 'used'
                                                            ? 'text-blue-700'
                                                            : recentExeat.requestStatus === 'rejected'
                                                                ? 'text-red-700'
                                                                : 'text-gray-600'
                                            }`}
                                    >
                                        {recentExeat.requestStatus}
                                    </p>
                                </div>

                                <div className="self-start sm:self-center">
                                    <button
                                        onClick={() => navigate(`/student-dashboard/exeats/view/${recentExeat._id}`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded w-20 h-8"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>


                        ) : (
                            <div className="bg-white shadow rounded-xl p-4 text-gray-500 text-sm transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '10px' }}>
                                No recent exeat request found.
                            </div>
                        )}


                        <div
                            style={{ padding: "10px" }}
                            className="bg-white shadow rounded-xl p-6 flex flex-col sm:flex-row justify-center items-center gap-4 h-full transition-transform hover:scale-105 hover:shadow-lg duration-300 fadeIn text-center"

                        >
                            <div className='' style={{ marginRight: "35px" }}>
                                <p className="text-sm text-gray-600 mb-2">Eligibility</p>
                                <p className={`text-sm font-bold ${quotaBalance < 1 ? 'text-red-600' : 'text-green-600'}`}>
                                    {quotaBalance < 1 ? 'No' : 'Yes'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:items-end gap-2 sm:gap-4">
                                <Link to="/exeat/policy" className="text-sm text-gray-600 hover:underline">
                                    Read Exeat Policy
                                </Link>

                                {quotaBalance < 1 || ['pending', 'recommended'].includes(recentExeat?.requestStatus) ? (
                                    <button
                                        style={{ padding: "10px" }}
                                        disabled
                                        className="bg-gray-400 text-white text-sm py-2 px-4 rounded cursor-not-allowed"
                                    >
                                        {quotaBalance < 1 ? 'Low Quota' : 'Already Requested'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/student-dashboard/exeats/new')}
                                        style={{padding:'10px'}}
                                        className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded"
                                    >
                                        New Request
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (4/12) */}
                    <div className="w-full sm:w-6/12 md:w-4/12 lg:w-3/12 px-2 mb-4">
                        <div
                            style={{ padding: "10px" }}
                            className="bg-white shadow rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center min-h-full transition-transform hover:scale-105 hover:shadow-lg duration-300">
                            <div className="text-center mb-4 sm:mb-0 sm:mr-4">
                                <h2 className={`text-lg font-semibold qnum ${quotaBalance < 1 ? 'text-red-600' : 'text-green-600'}`}>
                                    {quotaBalance !== null ? quotaBalance : '...'}
                                </h2>
                                <p className="text-sm text-gray-600">Available</p>
                            </div>

                            <div className="text-center">
                                <p className="text-lg text-gray-600 mb-2">QUOTA</p>
                                <button
                                    style={{ padding: "10px", marginTop: "4px" }}
                                    onClick={() => navigate('/student-dashboard/pricing')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                >
                                    Purchase
                                </button>
                            </div>
                        </div>
                    </div>


                    {/*  */}
                </div>

                <div className="bg-white shadow rounded-xl p-4" style={{ padding: '15px', animation: 'fadeIn 0.5s ease-in' }}>
                    <StudentExeats />
                </div>



            </div>
        </div>


    );
};

export default Exeats;
