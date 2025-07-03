import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import { Trash, NotebookText } from 'lucide-react'; 

const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const StudentPayments = ({ user }) => {
    console.log(user);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const deletePayment = async (paymentId)=>{
    setLoading(true);
    if (!paymentId) {
      toast.error('Payment ID is required');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }
    try {
      const res = await axios.delete(`${BACKEND_API}/api/payments/${paymentId}`, {
        withCredentials: true,
      });
      toast.success('Payment deleted successfully');
      console.log(res.data);
      setPayments(payments.filter(payment => payment._id !== paymentId));
    } catch (err) {
      toast.error('Failed to delete payment');
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${BACKEND_API}/api/payments/user/me`, {
        withCredentials: true,
      });
      setPayments(res.data || []);
    } catch (err) {
      toast.error('Failed to load payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns = [
    {
      name: 'Reference',
      selector: row => row.reference,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Quota',
      selector: row => row.quota,
      sortable: true,
      center: true,
    },
    {
      name: 'Amount (₦)',
      selector: row => row.amount.toLocaleString(),
      sortable: true,
      center: true,
    },
    {
      name: 'Status',
      cell: row => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            color: '#fff',
            backgroundColor:
              row.status === 'success'
                ? '#16a34a'
                : row.status === 'pending'
                ? '#facc15'
                : '#dc2626',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          {row.status}
        </span>
      ),
      sortable: true,
      center: true,
    },
    {
      name: 'Date',
      selector: row => new Date(row.paymentDate).toLocaleString(),
      sortable: true,
      wrap: true,
    },
    {
      name: 'Receipt',
      cell: row =>
        row.status === 'success' ? (
          <button
            onClick={() => alert(`Generate receipt for: ${row.reference}`)}
            className="text-blue-600"
          >
            <NotebookText size={16} />
          </button>
        ) : (
          <button
            onClick={() => deletePayment(row._id)}
            className="text-red-600"
          >
           <Trash size={16} />
          </button>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      center: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4" style={{ padding: '20px', margin: '20px auto' }}>
      <h2 className="text-2xl font-semibold mb-4 text-green-700" style={{marginBottom:'10px'}}>| Payment History</h2>

      <div className="bg-white rounded shadow p-4" style={{animation:'fadeIn 0.5s ease-in-out'}}>
        <DataTable
          columns={columns}
          data={payments}
          progressPending={loading}
          pagination
          highlightOnHover
          responsive
          striped
          persistTableHead
          noDataComponent="No payment records found."
        />
      </div>
    </div>
  );
};

export default StudentPayments;
