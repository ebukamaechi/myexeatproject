import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="text-center mt-10">
    <h2 className="text-2xl font-bold text-red-500">Unauthorized</h2>
    <p>You do not have permission to view this page.</p>
    <p>Please contact your administrator if you believe this is an error.</p>
    <p className="mt-4">If you need assistance, please reach out to support.</p>
    <p className="mt-2"><Link to="/login" className="text-blue-500 hover:underline">Go Back</Link></p>
  </div>
);

export default Unauthorized;
