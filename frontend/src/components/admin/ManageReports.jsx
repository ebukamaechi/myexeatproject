import React, { useState } from "react";
import ExeatReport from "./reportssection/ExeatReport";
import PaymentReport from "./reportssection/PaymentReport";
import StudentReport from "./reportssection/StudentReport";
import CustomReport from "./reportssection/CustomReport";

const ManageReports = () => {
  const [tab, setTab] = useState("exeats");

  const tabs = [
    { key: "exeats", label: "Exeats" },
    { key: "payments", label: "Payments" },
    { key: "students", label: "Students" },
    { key: "custom", label: "Custom Range" },
  ];

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-green-700 mb-4">| Reports Dashboard</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-t ${
              tab === t.key
                ? "bg-green-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Render Section */}
      <div className="bg-white rounded shadow p-4">
        {tab === "exeats" && <ExeatReport />}
        {tab === "payments" && <PaymentReport />}
        {tab === "students" && <StudentReport />}
        {tab === "custom" && <CustomReport />}
      </div>
    </section>
  );
};

export default ManageReports;
