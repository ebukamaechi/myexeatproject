import DataTable from "react-data-table-component";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
import { Pencil, Book, Trash } from "lucide-react";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const ManagePaymentPlans = () => {
    // const navigate = useNavigate();
    const [paymentPlans, setPaymentPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addPricingModal, setAddPricingModal] = useState(false);
    const [editPricingModal, setEditPricingModal] = useState(false);
    const [deletePricingModal, setDeletePricingModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(
        () => {
            fetchPlans();
        }, []
    );
    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_API}/api/pricing`, { withCredentials: true });
            console.log(response.data);
            setPaymentPlans(response.data);
        } catch (error) {
            console.error(error);
            setError("error somewhere");
        } finally {
            setLoading(false);
        }
    };
    const handleAddPricing = async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
            name: form.name.value,
            description: form.description.value,
            quantity: parseInt(form.quantity.value),
            amount: parseFloat(form.amount.value),
            featured: form.featured.checked,
        };
        try {
            setLoading(true);
            const response = await axios.post(`${BACKEND_API}/api/pricing`, payload, {
                withCredentials: true,
            });
            console.log(response);
            toast.success("Plan created successfully");

            fetchPlans();
            setAddPricingModal(false);
        } catch (err) {
            console.error(err);
            toast.error("Error adding plan");
        } finally {
            setLoading(false);
        }
    };


    const handleEdit = async (e) => {
        console.log(e);
        e.preventDefault();
        const form = e.target;
        const payload = {
            name: form.name.value,
            description: form.description.value,
            quantity: parseInt(form.quantity.value),
            amount: parseFloat(form.amount.value),
            featured: form.featured.checked,
        };
        try {
            setLoading(true);
            await axios.put(`${BACKEND_API}/api/pricing/${selectedPlan._id}`, payload, {
                withCredentials: true,
            });
            toast.success("Plan updated");
            fetchPlans();
            setEditPricingModal(false);
        } catch (err) {
            console.error(err);
            toast.error("Error updating plan");
        } finally {
            setLoading(false);
        }
    };


const handleDelete = async (selectedPlan) => {
    setLoading(true);
    try {
        await axios.delete(`${BACKEND_API}/api/pricing/${selectedPlan}`, {
            withCredentials: true,
        });

        // Remove the deleted plan from state
        setPaymentPlans(prev => prev.filter(p => p._id !== selectedPlan));

        toast.success("Plan deleted successfully.");
        setDeletePricingModal(false);
    } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete the plan.");
    }finally{
        setLoading(false);
    }
};



    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            wrap: true,
        }, {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
            wrap: true,
        }, {
            name: 'Quota',
            selector: row => row.quantity,
            sortable: true,
            center: true,
        },
        {
            name: 'Featured',
            selector: row => row.featured ? 'Yes' : 'No',
            sortable: true,
            center: true,
        },
        {
            name: 'Amount',
            selector: row => row.amount.toLocaleString(),
            sortable: true,
            center: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex gap-2">
                    <button

                        onClick={(e) => {
                            e.stopPropagation(); // Prevent row click from triggering
                            console.log('Edit button clicked for row:', row._id);
                            // setEditPricingModal(true, row._id);
                            setSelectedPlan(row); // Set the entire plan object for editing
                            setEditPricingModal(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 transition duration-200"
                        title="Edit Plan"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent row click from triggering
                            console.log('Delete button clicked for row:', row._id);
                            setSelectedPlan(row._id);
                            setDeletePricingModal(true);
                        }}
                        className="p-2 text-red-600 hover:text-red-800 transition duration-200"
                        title="Delete Plan"
                    >
                        <Trash size={18} />
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Crucial to prevent row click when clicking actions
            // button: true, // Important for DataTable to render buttons correctly
            width: '120px', // Adjust width as needed
        },
    ]

    return (
        <section style={{ padding: '20px' }}>
            <div className="bg-white shadow rounded-xl" style={{ padding: '10px', animation: 'fadeIn 0.5s ease-in-out' }} >
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                    <div className="flex-start gap-2 w-full sm:w-auto">
                        {error && <div className="text-red-500 mb-2">{error}</div>}
                        <h2 className="text-2xl font-semibold mb-4 text-green-700" style={{ marginBottom: '10px' }}>| Manage Payment Plans</h2>
                        <p className="text-gray-600 mb-6">Here you can manage the payment plans for students.</p>
                    </div>

                    <div className="flex-end gap-2 w-full sm:w-auto">
                        <button
                            style={{ padding: '10px 10px' }}
                            className=" bg-green-600 text-white rounded hover:bg-green-700 transition"
                            onClick={() => {
                                setAddPricingModal(true);
                            }}
                        >
                            Add +
                        </button>
                    </div>
                </div>
                {/* Add your payment plan management components here */}
                <div className="overflow-x-auto max-w-full">
                    <DataTable
                        columns={columns}
                        data={paymentPlans}
                        progressPending={loading}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        // pointerOnHover
                        noDataComponent="No plans found"
                        // onRowClicked={(row) => navigate(`/super-admin-dashboard/pricing/${row._id}`)}
                    />
                </div>
            </div>

            {addPricingModal && (
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
                    onClick={() => setAddPricingModal(false)}
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
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3"
                    >
                        <h2 className="text-xl font-bold mb-4">Add Pricing Plan</h2>
                        <form
                            onSubmit={handleAddPricing}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input name="name" className="w-full border px-3 py-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea name="description" className="w-full border px-3 py-2 rounded" />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1">Quantity</label>
                                    <input type="number" name="quantity" className="w-full border px-3 py-2 rounded" required />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1">Amount</label>
                                    <input type="number" name="amount" className="w-full border px-3 py-2 rounded" required />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="featured" />
                                <label>Featured</label>
                            </div>
                            <div
                                style={{
                                    marginTop: '24px',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px'
                                }}
                                className="flex justify-end gap-2 pt-4">
                                <button
                                    style={{
                                        padding: '10px 16px',
                                        // backgroundColor: '#e5e7eb',
                                        borderRadius: '6px'
                                    }}
                                    type="button"
                                    onClick={() => setAddPricingModal(false)}
                                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
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
                                    // onClick={handleAddPricing}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {loading ? "Saving..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editPricingModal && selectedPlan && (
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
                    onClick={() => setEditPricingModal(false)}
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
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3"
                    >
                        <h2 className="text-xl font-bold mb-4">Edit Pricing Plan</h2>
                        <form
                            onSubmit={handleEdit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    name="name"
                                    defaultValue={selectedPlan.name}
                                    className="w-full border px-3 py-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={selectedPlan.description}
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        defaultValue={selectedPlan.quantity}
                                        className="w-full border px-3 py-2 rounded"
                                        required
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1">Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        defaultValue={selectedPlan.amount}
                                        className="w-full border px-3 py-2 rounded"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    defaultChecked={selectedPlan.featured}
                                />
                                <label>Featured</label>
                            </div>
                            <div
                                style={{
                                    marginTop: '24px',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px'
                                }}
                                className="flex justify-end gap-2 pt-4">
                                <button
                                    style={{
                                        padding: '10px 16px',
                                        // backgroundColor: '#e5e7eb',
                                        borderRadius: '6px'
                                    }}
                                    type="button"
                                    onClick={() => setEditPricingModal(false)}
                                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
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
                                    // onClick={handleEdit}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletePricingModal && selectedPlan && (
                <div
                    onClick={() => setDeletePricingModal(false)}
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
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animation: 'fadeIn 0.5s ease-in',
                            backgroundColor: '#fff',
                            padding: '24px',
                            borderRadius: '10px',
                            maxWidth: '700px',
                            width: '100%',
                            margin: '10px'
                        }}
                        className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
                        <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h2>
                        <p className="mb-4">Are you sure you want to delete the plan <strong>{selectedPlan.name}</strong>?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                style={{
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    padding: '10px 20px',
                                    backgroundColor: loading ? 'gray' : 'red',
                                    color: '#fff',
                                    borderRadius: '6px'
                                }}
                                onClick={() => {
                                    handleDelete(selectedPlan);
                                    // setDeletePricingModal(false);
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Yes, Delete
                            </button>
                            <button
                                style={{
                                    padding: '10px 16px',
                                    // backgroundColor: '#e5e7eb',
                                    borderRadius: '6px'
                                }}
                                onClick={() => setDeletePricingModal(false)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
};

export default ManagePaymentPlans;