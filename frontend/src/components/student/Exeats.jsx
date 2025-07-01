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
        const fetchMostRecentExeat = async () => {
            try {
                const res = await axios.get(`${BACKEND_API}/api/exeats/my-exeats`, { withCredentials: true });
                if (Array.isArray(res.data) && res.data.length > 0) {
                    // Sort by departureDate descending
                    const sorted = [...res.data].sort(
                        (a, b) => new Date(b.departureDate) - new Date(a.departureDate)
                    );
                    setRecentExeat(sorted[0]); // Most recent request
                }
            } catch (err) {
                console.error('Failed to fetch recent exeat', err);
            }
        };
        const fetchQuotaBalance = async () => {
            try {
                const res = await axios.get(`${BACKEND_API}/api/quota/balance`, { withCredentials: true });
                setQuotaBalance(res.data.quota); // adjust if response shape differs
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

        fetchStats();
        fetchQuotaBalance();
        fetchMostRecentExeat();
    }, []);

    return (
            <div className="container mx-auto p-6" style={{ paddingLeft: '30px', paddingRight: '30px'}}>
                <div className=' ' style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <h2 className="text-2xl font-bold main-title">|Exeats</h2>
                    <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur adipisicing. {user?.name}</p>
                </div>

                <div className="p-4 space-y-6">
                    {/* First Row - 4 Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 " style={{ marginBottom: '30px', animation:'fadeIn ease-in-out 0.5s' }}>
                        {/* Example Card from First Row */}
                        <div className="bg-white shadow rounded-xl p-2 flex justify-between items-center transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '15px'}}>
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

                    {/* Second Row - 2 Columns */}
                    <div className="lg:flex gap-4" style={{ marginBottom: '30px' }}>
                        {/* Left Column (8/12) */}
                        <div className="lg:w-9/12 flex flex-col gap-4 " style={{ marginTop: '10px', marginBottom: '10px' }}>
                            {/* First Card in Second Row */}
                            {recentExeat ? (
                                <div className="bg-white shadow rounded-xl p-4 flex justify-between items-center h-full transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '15px', animation:'fadeIn ease-in-out 0.7s' }}>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">ExeatID</p>
                                        <p className="text-sm text-gray-600 font-bold">#{recentExeat._id}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">Status</p>
                                        <p className={`text-sm font-bold ${recentExeat.requestStatus === 'approved' ? 'text-green-600' :
                                            recentExeat.requestStatus === 'pending' ? 'text-yellow-600' :
                                                recentExeat.requestStatus === 'recommended' ? 'text-orange-700' :
                                                    recentExeat.requestStatus === 'cancelled' ? 'text-red-600' :
                                                        recentExeat.requestStatus === 'used' ? 'text-blue-700' :
                                                            recentExeat.requestStatus === 'rejected' ? 'text-red-700' :
                                                                'text-gray-600'
                                            }`}>
                                            {recentExeat.requestStatus}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/student-dashboard/exeats/view/${recentExeat._id}`)}
                                        className="mt-4 self-start bg-blue-600 hover:bg-blue-700 text-white text-center p-1 rounded w-20 h-8"
                                    >
                                        Details
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white shadow rounded-xl p-4 text-gray-500 text-sm transition-transform hover:scale-105 hover:shadow-lg duration-300">
                                    No recent exeat request found.
                                </div>
                            )}


                            <div className="bg-white shadow rounded-xl p-4 flex justify-between items-center h-full transition-transform hover:scale-105 hover:shadow-lg duration-300"  style={{ padding: '15px', animation:'fadeIn ease-in 1s' }}>
                                <div>
                                    <p className="text-sm text-gray-600 mb-4">Eligibility</p>
                                    {
                                        quotaBalance < 1 ? (<p className="text-sm text-red-600 font-bold">No</p>
                                        ) : (
                                            <p className="text-sm text-green-600 font-bold">Yes</p>
                                        )
                                    }
                                </div>

                                <div>
                                    <Link to='/exeat/policy' className="text-sm text-gray-600 mb-4">Read Exeat Policy</Link>
                                </div>
                                {
                                    quotaBalance < 1 || ['pending', 'recommended'].includes(recentExeat?.requestStatus) ? (
                                        <button
                                            disabled
                                            className="mt-4 self-start bg-gray-400 text-white text-center p-1 rounded cursor-not-allowed"
                                            style={{ padding: '15px' }}
                                        >
                                            {quotaBalance < 1 ? 'Low Quota' : 'Already Requested'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/student-dashboard/exeats/new')}
                                            className="mt-4 self-start bg-green-600 hover:bg-green-700 text-white text-center p-1 rounded"
                                            style={{ padding: '15px' }}
                                        >
                                            New Request
                                        </button>
                                    )
                                }

                            </div>
                        </div>

                        {/* Right Column (4/12) */}
                        <div className="lg:w-3/12 " style={{ marginTop: '10px', marginBottom: '10px' }}>
                            <div className="bg-white shadow rounded-xl p-5 flex justify-between items-center min-h-full transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '15px', animation:'fadeIn 0.5s ease-in'}}>
                                <div style={{ margin: 'auto' }}>
                                    {quotaBalance < 1 ? (
                                        <h2 className="text-lg font-semibold qnum text-red-600" >
                                            {quotaBalance !== null ? quotaBalance : '...'}
                                        </h2>
                                    ) : (
                                        <h2 className="text-lg font-semibold qnum text-green-600" >
                                            {quotaBalance !== null ? quotaBalance : '...'}
                                        </h2>
                                    )}
                                    <p className="text-sm text-center text-gray-600" >Available</p>
                                </div>

                                <div className="text-center" style={{ margin: 'auto' }}>
                                    <p className="text-lg text-gray-600" style={{ marginBottom: '15px' }}>QUOTA</p>
                                    {/* <p className="text-sm text-gray-600 mb-4">You can purchase more quota if needed.</p> */}

                                    <button
                                    onClick={() => navigate('/student-dashboard/pricing')}
                                        className="mt-4 self-start bg-green-600 hover:bg-green-700 text-white text-center p-1 rounded w-30 h-10"
                                    >
                                        Purchase
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Third Row - Table Card */}
                    {/* <div className="bg-white shadow rounded-xl p-4" style={{ padding: '15px' }}>
                        <div className="overflow-x-auto">
                            <StudentExeats />
                        </div>
                    </div> */}

                    <div className="bg-white shadow rounded-xl p-4" style={{ padding: '15px', animation:'fadeIn 0.5s ease-in' }}>
                        <StudentExeats />
                    </div>



                </div>
            </div>


    );
};

export default Exeats;
