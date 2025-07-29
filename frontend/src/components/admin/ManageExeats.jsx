import DataTable from "react-data-table-component";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;




const ManageExeats = () => {
    const navigate = useNavigate();
    const [exeats, setExeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');

    useEffect(
        () => {
            fetchExeats();
        }, []
    );

    const fetchExeats = async () => {
        try {
            const response = await axios.get(`${BACKEND_API}/api/exeats`, { withCredentials: true });
            console.log(response);
            setExeats(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Systems Error: ");
            setError("something is failing");
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
            name: 'Return Date',
            selector: row => new Date(row.returnDate).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.requestStatus,
            sortable: true,
            cell: row => <span className={`badge status-${row.requestStatus}`}>{row.requestStatus}</span>,
        },
    ]




    return (
        <section style={{ padding: '20px' }}>
            <div className="bg-white p-4 rounded shadow" style={{ padding: '10px', animation: 'fadeIn 0.5s ease-in-out' }}>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <h2 className="text-lg font-semibold main-title">Exeats</h2>
                    <input
                        type="text"
                        placeholder="search..."
                        className="px-3 py-2 border rounded w-full sm:w-auto"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto max-w-full">
                    <DataTable 
                    columns={columns}
                    data={filteredExeats}
                    progressPending={loading}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    pointerOnHover
                    noDataComponent="No exeats found"
                    onRowClicked={(row)=>navigate(`/super-admin-dashboard/exeats/view/${row._id}`)}
                    />
                </div>
            </div>
        </section>
    );
};
export default ManageExeats;