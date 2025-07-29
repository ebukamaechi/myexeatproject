const ExeatReport = () => {
  // Assume data is fetched with useEffect
  const stats = {
    total: 120,
    approved: 80,
    rejected: 25,
    pending: 15,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-green-600">Exeat Reports</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="bg-gray-100 p-4 rounded text-center">
            <p className="text-sm capitalize">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExeatReport;
