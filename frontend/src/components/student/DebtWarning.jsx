// components/student/DebtWarning.jsx
// Drop this inside NewExeat.jsx — render it above the form if hasDebt is true

import { useEffect, useState } from "react";
import axios from "axios";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const DebtWarning = () => {
  const [debtInfo, setDebtInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${BACKEND_API}/api/debts/my-status`, {
          withCredentials: true,
        });
        setDebtInfo(res.data);
      } catch {
        // silently fail — don't block the form
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  if (loading || !debtInfo?.hasDebt) return null;

  const formatNaira = (n) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(n);

  return (
      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 " style={{ paddingLeft: '10px', paddingRight: '30px', paddingBottom: '5px', marginBottom: '10px', padding: '10px' }}   >
      <div className="flex items-start gap-3 ">
        {/* Warning icon */}
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>

        <div className="flex-1">
          <h3 className="font-semibold text-red-800">
            Outstanding debt — {formatNaira(debtInfo.totalOutstanding)}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            You have{" "}
            <strong>{debtInfo.activeDebts.length} unpaid late-return fine(s)</strong>{" "}
            on your account. You can still submit a request, but it will be
            visible to your dean for review.
          </p>

          {/* List individual debts */}
          <ul className="mt-3 space-y-1">
            {debtInfo.activeDebts.map((debt, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800" style={{ paddingLeft: '10px', marginBottom: '5px', paddingRight: '10px', padding: '10px' }}
              >
                <span>
                  Exeat to{" "}
                  <strong>{debt.exeat?.destination || "Unknown"}</strong> —{" "}
                  {debt.daysLate} day(s) late
                </span>
                <span className="font-semibold">
                  {formatNaira(debt.currentAmount)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs text-red-600" style={{marginTop:'5px', }}>
            Pay from My Debts dashboard or Contact your dean with necessary documentation to clear this balance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebtWarning;
