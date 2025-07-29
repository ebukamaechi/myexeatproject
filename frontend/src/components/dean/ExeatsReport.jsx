import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const demoExeats = [
  { id: 1, student: "John Doe", date: "2025-07-11", status: "approved" },
  { id: 2, student: "Jane Smith", date: "2025-07-10", status: "pending" },
  { id: 3, student: "Emeka Obi", date: "2025-07-10", status: "declined" },
  { id: 4, student: "Ada Ndu", date: "2025-07-11", status: "approved" },
  { id: 5, student: "Victor Eze", date: "2025-07-09", status: "pending" },
];

const getStatusCounts = (data) => {
  const counts = { approved: 0, pending: 0, declined: 0 };
  data.forEach((exeat) => {
    counts[exeat.status]++;
  });
  return counts;
};

const ExeatsReport = () => {
  const [exeats, setExeats] = useState(demoExeats);
  const [filter, setFilter] = useState("all");
  const [filteredExeats, setFilteredExeats] = useState(exeats);

  useEffect(() => {
    if (filter === "all") setFilteredExeats(exeats);
    else setFilteredExeats(exeats.filter((e) => e.status === filter));
  }, [filter, exeats]);

  const statusCounts = getStatusCounts(exeats);

  const chartData = {
    labels: ["Approved", "Pending", "Declined"],
    datasets: [
      {
        label: "Exeats by Status",
        data: [statusCounts.approved, statusCounts.pending, statusCounts.declined],
        backgroundColor: ["#16a34a", "#facc15", "#f43f5e"],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-green-700">Exeat Summary</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm text-left border">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Student</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredExeats.map((exeat, index) => (
              <tr key={exeat.id}>
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{exeat.student}</td>
                <td className="px-4 py-2 border">{exeat.date}</td>
                <td className={`px-4 py-2 border capitalize font-semibold ${
                  exeat.status === "approved"
                    ? "text-green-600"
                    : exeat.status === "pending"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}>
                  {exeat.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExeatsReport;
