import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [recentExeat, setRecentExeat] = useState(null);
  const [quotaBalance, setQuotaBalance] = useState(0);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    monthlyCounts: [2, 1, 3, 2, 4], // fallback if backend doesn't provide
  });
  const [exeatHistory, setExeatHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exeatsRes, quotaRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/exeats/my-exeats', { withCredentials: true }),
          axios.get('http://localhost:5000/api/quota/balance', { withCredentials: true }),
          axios.get('http://localhost:5000/api/exeats/stats', { withCredentials: true }),
        ]);

        const exeats = exeatsRes.data || [];
        if (exeats.length > 0) {
          const sorted = exeats.sort((a, b) => new Date(b.departureDate) - new Date(a.departureDate));
          setRecentExeat(sorted[0]);
          setExeatHistory(sorted);
        }

        setQuotaBalance(quotaRes.data.quota || 0);
        setStats({
          totalRequests: statsRes.data.totalRequests || 0,
          pendingRequests: statsRes.data.pendingRequests || 0,
          approvedRequests: statsRes.data.approvedRequests || 0,
          rejectedRequests: statsRes.data.rejectedRequests || 0,
          monthlyCounts: statsRes.data.monthlyCounts || [2, 1, 3, 2, 4],
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };

    fetchData();
  }, []);

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Exeats',
        data: stats.monthlyCounts,
        backgroundColor: '#10b981',
      },
    ],
  };

  const donutChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          stats.approvedRequests,
          stats.pendingRequests,
          stats.rejectedRequests,
        ],
        backgroundColor: ['#10b981', '#facc15', '#ef4444'],
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen" style={{}}>
     
      <div style={{ padding: '10px' }}>
         <h2 className="text-xl font-bold main-title">|Student Dashboard</h2>
        {/* Top Summary Cards */}
        <div
          className="grid grid-cols-12 gap-4 mb-6 px-4"
          style={{
            marginBottom: '20px',
            paddingTop: '10px',
            paddingBottom: '10px',
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          {/* Welcome Card */}
          <div
            className="bg-white rounded-xl p-6 shadow col-span-12 sm:col-span-6 transition-transform hover:scale-105 hover:shadow-lg duration-300"
            style={{ padding: '20px' }}
          >
            <p className="text-gray-500 mb-1">Welcome back,</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{user?.name}</h3>

            <p className="text-sm text-gray-600 mb-1">
              <strong>Role:</strong> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>

            <p className="text-sm text-gray-600 mb-3">
              <strong>Date:</strong> {new Date().toLocaleDateString('en-NG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {/* <div className="text-sm text-gray-700 leading-relaxed">
            <p className="mb-1">You're doing great! Remember to:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Check your quota before requesting a new exeat.</li>
              <li>Keep track of your previous requests.</li>
              <li>Reach out to support if you need help.</li>
            </ul>
          </div> */}
          </div>


          {/* Total Exeats Card */}
          <div
            className="bg-white rounded-xl p-6 shadow col-span-12 sm:col-span-3 transition-transform hover:scale-105 hover:shadow-lg duration-300"
            style={{ padding: '20px' }}
          >
            <p className="text-gray-500 mb-1">Total Exeats</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.totalRequests}</h3>
          </div>

          {/* Current Exeat Card */}
          <div
            className="bg-white rounded-xl p-6 shadow col-span-12 sm:col-span-3 transition-transform hover:scale-105 hover:shadow-lg duration-300"
            style={{ padding: '20px' }}
          >
            <p className="text-gray-500 mb-1">Current Exeat</p>
            <h3
              className={`text-lg font-semibold ${recentExeat?.requestStatus === 'approved'
                ? 'text-green-600'
                : recentExeat?.requestStatus === 'pending'
                  ? 'text-yellow-600'
                  : recentExeat?.requestStatus === 'rejected'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
            >
              {recentExeat?.requestStatus || 'None'}
            </h3>
            <p>Departure: <span className="font-medium">{new Date(recentExeat?.departureDate).toLocaleDateString()}</span></p>
          </div>
        </div>



        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" style={{ marginBottom: '20px' }}>
          <div className="bg-white rounded-xl p-4 shadow lg:col-span-2 transition-transform hover:scale-105 hover:shadow-lg duration-300 " style={{ padding: '10px' }}>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Exeats Over Time</h4>
            <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </div>
          <div className="bg-white rounded-xl p-4 shadow transition-transform hover:scale-105 hover:shadow-lg duration-300" style={{ padding: '10px' }}>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Exeats Breakdown</h4>
            <Doughnut data={donutChartData} />
          </div>
        </div>

        {/* Quick Exeat Action */}
        <div className="bg-white rounded-xl p-6 shadow flex flex-col sm:flex-row justify-between items-center mb-6" style={{ marginBottom: '20px', padding: '10px' }}>
          <div className="mb-4 sm:mb-0">
            <h4 className="text-lg font-semibold text-gray-800">Need to go out?</h4>
            <p className="text-gray-500">Submit a new exeat request quickly.</p>
          </div>
          {
            quotaBalance < 1 || ['pending', 'recommended'].includes(recentExeat?.requestStatus) ? (
              <button
                disabled
                className="mt-2 sm:mt-0 bg-gray-400 text-white px-2 rounded cursor-not-allowed w-30 h-8"
              >
                {quotaBalance < 1 ? 'Low Quota' : 'Already Requested'}
              </button>
            ) : (
              <button
                onClick={() => navigate('/student-dashboard/exeats/new')}
                className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded w-20 h-8"
              >
                Request Exeat
              </button>
            )
          }
        </div>

        {/* Full History */}
        <div className="bg-white rounded-xl p-6 shadow" style={{ padding: '20px' }}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Exeat History</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Used</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Destination</th>
                </tr>
              </thead>
              <tbody>
                {exeatHistory.length === 0 ? (
                  <tr>
                    <td className="py-4 px-4 text-center" colSpan="4">No exeat history found.</td>
                  </tr>
                ) : exeatHistory.map((exeat, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{new Date(exeat.departureDate).toLocaleDateString()}</td>
                    <td className="py-2 px-4 capitalize">{exeat.isUsed || 'N/A'}</td>
                    <td className="py-2 px-4 capitalize">
                      <span className={
                        exeat.requestStatus === 'approved' ? 'text-green-600' :
                          exeat.requestStatus === 'pending' ? 'text-yellow-600' :
                            exeat.requestStatus === 'rejected' ? 'text-red-600' : 'text-gray-600'}>
                        {exeat.requestStatus}
                      </span>
                    </td>
                    <td className="py-2 px-4">{exeat.destination || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


    </div>
  );
};

export default StudentDashboard;
