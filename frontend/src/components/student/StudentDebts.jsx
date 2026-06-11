// components/student/StudentDebts.jsx
// Add route: /student/debts

import { useEffect, useState } from "react";
import axios from "axios";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const formatNaira = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "—";

const StudentDebts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BACKEND_API}/api/debts/my-debts`, { withCredentials: true })
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400">
        Loading debts...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-2xl font-semibold text-gray-800">My Debts</h1>
      <p className="mb-6 text-sm text-gray-500">
        Late-return fines are charged at ₦10,000 per day.
      </p>

      {/* Summary card */}
      {data?.totalOutstanding > 0 && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between">
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
      )}

      {!data?.debts?.length ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
          <p className="text-lg">No debts 🎉</p>
          <p className="mt-1 text-sm">You have always returned on time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.debts.map((debt) => (
            <div
              key={debt._id}
              className={`rounded-xl border p-4 ${
                debt.status === "settled"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        debt.status === "settled"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {debt.status === "settled" ? "Settled" : "Active"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {debt.daysLate} day(s) late
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    <strong>Trip to:</strong>{" "}
                    {debt.exeat?.destination || "Unknown destination"}
                  </p>
                  <p className="text-sm text-gray-500">
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
                    className={`text-xl font-bold ${
                      debt.status === "settled"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {formatNaira(debt.currentAmount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    ₦10,000 × {debt.daysLate} days
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDebts;
