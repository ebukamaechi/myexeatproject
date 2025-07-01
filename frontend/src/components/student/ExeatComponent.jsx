import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const StudentExeats = () => {
    const [exeats, setExeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');



    useEffect(() => {
        const fetchExeats = async () => {
            try {
                const res = await axios.get(`${BACKEND_API}/api/exeats/my-exeats`, { withCredentials: true });
                console.log('API response:', res);
                setExeats(res.data);
            } catch (err) {
                console.error('Failed to fetch exeats', err);
                setError('Failed to load your exeats.');
            } finally {
                setLoading(false);
            }
        };

        fetchExeats();
    }, []);

    const filteredExeats = exeats.filter(
        item =>
            item.destination?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.purpose?.toLowerCase().includes(filterText.toLowerCase())
    );

    const columns = [
        {
            name: 'Destination',
            selector: row => row.destination,
            sortable: true,
        },
        {
            name: 'Purpose',
            selector: row => row.purpose,
            sortable: true,
        },
        {
            name: 'Departure Date',
            selector: row => new Date(row.departureDate).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.requestStatus,
            sortable: true,
            cell: row => <span className={`badge status-${row.requestStatus}`}>{row.requestStatus}</span>,
        },
        {
            name: 'Used',
            selector: row => (row.isUsed ? 'Yes' : 'No'),
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <button
                    className="btn bg-primary btn-sm"
                    //  style={{ padding: '15px' }}
                    onClick={() => navigate(`/student-dashboard/exeats/view/${row._id}`)}
                >
                    View
                </button>
            ),
        },
    ];

    return (
        <div className="p-4">
            {error && <div className="text-red-500 mb-2">{error}</div>}

            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-semibold">Previous Exeats</h2>
                <input
                    type="text"
                    placeholder="Search destination or purpose"
                    className="px-3 py-2 border rounded w-full sm:w-auto"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                />
            </div>

            {/* Wrap table in a scroll container */}
            <div className="overflow-x-auto max-w-full">
                <div className="min-w-[700px]">
                    <DataTable
                        columns={columns}
                        data={filteredExeats}
                        progressPending={loading}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                    />
                </div>
            </div>

            {exeats.length === 0 && !loading && (
                <div className="text-center text-gray-500 mt-4">No exeats found.</div>
            )}
        </div>
    );

};

export default StudentExeats;
