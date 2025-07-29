const PaymentReport = () => {
  const payments = {
    total: 500000,
    paid: 420000,
    unpaid: 80000,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-green-600">Payment Reports</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(payments).map(([label, value]) => (
          <div key={label} className="bg-gray-100 p-4 rounded text-center">
            <p className="text-sm capitalize">{label}</p>
            <p className="text-lg font-bold">₦{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PaymentReport;
