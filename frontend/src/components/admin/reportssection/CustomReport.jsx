import { useState } from "react";

const CustomReport = () => {
  const [range, setRange] = useState({ start: "", end: "" });

  const handleFetch = () => {
    if (!range.start || !range.end) return alert("Select date range");
    // Call backend with date range filter
    console.log("Fetching custom report from", range);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-green-600">Custom Date Report</h3>
      <div className="flex gap-4 flex-wrap">
        <input
          type="date"
          value={range.start}
          onChange={(e) => setRange({ ...range, start: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={range.end}
          onChange={(e) => setRange({ ...range, end: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={handleFetch}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Fetch Report
        </button>
      </div>
    </div>
  );
};

export default CustomReport;
