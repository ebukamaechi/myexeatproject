const StudentReport = () => {
  const students = {
    total: 1500,
    active: 1300,
    inactive: 200,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-green-600">Student Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(students).map(([label, value]) => (
          <div key={label} className="bg-gray-100 p-4 rounded text-center">
            <p className="text-sm capitalize">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StudentReport;
