import DataTable from "react-data-table-component";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { NotebookText } from "lucide-react";
// import { defaults } from "chart.js";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;


const HostelAdminExeats = () => {
    const [exeats, setExeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const navigate = useNavigate();

    useEffect(
        () => {
            fetchExeats();
        }, []
    );

    const fetchExeats = async () => {
        try {
            const result = await axios.get(`${BACKEND_API}/api/exeats`, { withCredentials: true });
            console.log(result);
            setExeats(result.data);

        } catch (error) {
            console.error('something failed: ', error);
            toast.error('systems error');
            setError('failed to load exeats');
        } finally {
            setLoading(false);
        }
    };

    const filteredExeats = exeats.filter(
        item =>
            item.matricNumber?.includes(filterText) ||
            item.purpose?.toLowerCase().includes(filterText.toLowerCase())
    );

    const columns = [
        {
            name: 'Matric',
            selector: row => row.matricNumber,
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
            name: 'Action',
            cell: row => (
                <button
                    className="btn bg-primary btn-sm text-blue-600"
                    //  style={{ padding: '15px' }}
                    onClick={() => navigate(`/staff-dashboard/exeats/view/${row._id}`)}
                >
                    <NotebookText size={16} />
                </button>
            ),
        },
    ];


    return (
        <section style={{ padding: '20px' }}>
            <div className="bg-white shadow rounded-xl" style={{ padding: '10px ', animation:'fadeIn 0.5s ease-in-out' }}>
            {error && <div className="text-red-500 mb-2">{error}</div>}

            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-semibold main-title">|Exeats</h2>
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
                        data={filteredExeats}
                        progressPending={loading}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                    />
                </div>
            </div>
            </div>
        </section>
    )
};

export default HostelAdminExeats;   