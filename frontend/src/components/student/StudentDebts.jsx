// components/student/StudentDebts.jsx
// Add route: /student/debts

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
// import paystackImage from '../../assets/SBP Tag - Payment Channels - NG (1).png';
import { toast } from 'react-toastify';

const BACKEND_API = import.meta.env.VITE_API_BASE_URL;
const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const formatNaira = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "—";

const StudentDebts = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BACKEND_API}/api/debts/my-debts`, { withCredentials: true })
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePayDebt = (debt) => {
    setSelectedDebt(debt);
    setShowModal(true);
  };

  const confirmPayment = async () => {
    setShowModal(false);
    setPaymentLoading(true);
    try {


      const res = await axios.post(
        `${BACKEND_API}/api/payments/initiate`,
        {
          type: "debt",
          debtId: selectedDebt._id,
          amount: selectedDebt.currentAmount,
          reference: `DEBT-${Date.now()}-${Math.floor(
            Math.random() * 10000
          )}`,
        },
        {
          withCredentials: true,
        }
      );

      const reference = res.data.payment.reference;
      const paymentId = res.data.paymentId;
      // setShowModal(false);

      launchPaystack(
        reference,
        selectedDebt,
        paymentId
      );

    } catch (err) {
      console.error(err);
      toast.error("Unable to initiate payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const deletePayment = async (paymentId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${BACKEND_API}/api/payments/${paymentId}`,
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const launchPaystack = (reference, debt, paymentId) => {
    const handler =
      window.PaystackPop &&
      window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user.email,
        amount: debt.currentAmount * 100,
        ref: reference,

        callback: (response) => {
          verifyTransaction(response.reference);
        },

        onClose: () => {
          deletePayment(paymentId);
        },
      });

    if (handler) {
      handler.openIframe();
    } else {
      console.error(handler);
      toast.error("Failed to load Paystack");
    }
  };

  const verifyTransaction = async (reference) => {
    setVerifyLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_API}/api/payments/verify`,
        {
          reference,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.status === "success") {
        toast.success("Debt payment successful");

        navigate("/student-dashboard/payment-success", {
          state: {
            reference,
            type: "debt",
            amount: selectedDebt.currentAmount,
          },
        });
      }
    } catch (err) {
      console.error(err);
      navigate("/student-dashboard/payment-failed");

    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400">
        Loading debts...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6" style={{animation:'fadeIn 0.5s ease-in-out', padding:'10px', margin:'10px'}}>
      <h1 className="mb-1 text-2xl font-semibold text-gray-800" style={{margin:'10px'}}>My Debts</h1>
      <p className="mb-6 text-sm text-gray-500" style={{ margin: '10px' }}>
        Late-return fines are charged at ₦10,000 per day.
      </p>

      {/* Summary card */}
      {data?.totalOutstanding > 0 ? (
        <div className="mb-6 rounded-xl bg-white border border-red-200 p-4 flex items-center justify-between" style={{ padding: '10px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}>
          <div>
            <p className="text-sm text-red-700 font-medium">Total outstanding</p>
            <p className="text-3xl font-bold text-red-800">
              {formatNaira(data.totalOutstanding)}
            </p>
          </div>
          <svg
            className="h-12 w-12 text-red-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z"
            />
          </svg>
        </div>
      ) : (
        <div className="mb-6 rounded-xl bg-white border border-green-200 p-4 flex items-center justify-between" style={{ padding: '10px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '10px' }}>
          <div>
            <p className="text-sm text-green-700 font-medium">Total outstanding</p>
            <p className="text-3xl font-bold text-green-800">
              {formatNaira(Number(data.totalOutstanding).toFixed(2))}
            </p>
          </div>
          <svg
            className="h-12 w-12 text-green-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z"
            />
          </svg>
        </div>
      )
      }

      {!data?.debts?.length ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400" style={{ padding: '10px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}>

          <p className="text-lg">No debts 🎉</p>
          <p className="mt-1 text-sm">You have always returned on time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.debts.map((debt) => (
            <div
              key={debt._id}
              style={{ padding: "10px", marginBottom: '5px', paddingLeft: '10px', paddingRight: '10px', margin: '5px' }}
              className={`rounded-xl border p-4 ${debt.status === "settled"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${debt.status === "settled"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                      style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}
                    >
                      {debt.status === "settled" ? "Settled" : "Active"}
                    </span>
                    <span className="text-sm text-gray-500" style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}>
                      {debt.daysLate} day(s) late
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700" style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}>
                    <strong>Trip to:</strong>{" "}
                    {debt.exeat?.destination || "Unknown destination"}
                  </p>
                  <p className="text-sm text-gray-500" style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}>
                    Should have returned:{" "}
                    <strong>{formatDate(debt.returnDate)}</strong>
                    {debt.checkedInAt && (
                      <>
                        {" "}
                        · Checked in:{" "}
                        <strong>{formatDate(debt.checkedInAt)}</strong>
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${debt.status === "settled"
                      ? "text-green-700"
                      : "text-red-700"
                      }`}
                    style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}
                  >
                    {formatNaira(debt.currentAmount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    ₦10,000 × {debt.daysLate} days
                  </p>
                </div>
              </div>
              {debt.status === "active" && (
                <button
                  onClick={() => handlePayDebt(debt)}
                  className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}
                >
                  Pay Debt
                </button>
              )}
            </div>

          ))}

        </div>
      )}
      {showModal && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" >
          <div className="w-full max-w-md rounded-lg bg-white p-6" style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}>
              Confirm Debt Payment
            </h3>

            <p>
              Amount:
              <strong>
                {" "}
                {formatNaira(selectedDebt.currentAmount)}
              </strong>
            </p>

            <p>
              Days Late:
              <strong> {selectedDebt.daysLate}</strong>
            </p>

            <div className="mt-6 flex justify-end gap-3" style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}>
              <button
                onClick={() => setShowModal(false)}
                className="rounded bg-gray-200 px-4 py-2"
                style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}
              >
                Cancel
              </button>

              <button
                onClick={confirmPayment}
                className="rounded bg-green-600 px-4 py-2 text-white"
                style={{ padding: '5px', margin: '5px', paddingLeft: '10px', paddingRight: '10px', marginBottom: '5px' }}
              >
                {paymentLoading ? (
                  <div>
                    <p>Processing...</p>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                    <p>Confirm & Pay</p>
                )}
                {/* {paymentLoading
                  ? "Processing..."
                  : "Confirm & Pay"} */}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loading Overlay */}
      {verifyLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px 40px',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#374151',
            boxShadow: '0 0 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #16a34a',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }} />
            Verifying transaction...
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDebts;
