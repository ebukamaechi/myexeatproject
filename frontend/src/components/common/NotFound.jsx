import {useNavigate} from 'react-router-dom';
import { Link } from "react-router-dom";

export const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="mt-4 text-lg text-gray-600">Page Not Found</p>
                <p className="mt-2 text-gray-500">The page you are looking for does not exist.</p>
                <button
                style={{padding:'10px 20px', margin:'20px'}} onClick={() => navigate('/')} className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Go back
                </button>
                <p className="mt-4 text-sm text-gray-500">If you think
                    this is a mistake, please contact support.</p>
                <p className="mt-2 text-sm text-gray-500">Error Code: 404</p>
                <p className="mt-2 text-sm text-gray-500">Timestamp: {
                    new Date().toLocaleString()
                }</p>
                <p className="mt-2 text-sm text-gray-500">Request ID: {Math.random().toString(36).substring(2, 15)}</p>
                <p className="mt-2 text-sm text-gray-500">Please try again
                    later or contact support if the issue persists.</p>
                <p className="mt-2 text-sm text-gray-500">Thank you for
                    your understanding.</p>
            </div>
        </div>
    );
}
export const Unauthorized = () => (
  <div className="text-center mt-10">
    <h2 className="text-2xl font-bold text-red-500">Unauthorized</h2>
    <p>You do not have permission to view this page.</p>
    <p>Please contact your administrator if you believe this is an error.</p>
    <p className="mt-4">If you need assistance, please reach out to support.</p>
    <p className="mt-2"><Link to="/login" className="text-blue-500 hover:underline">Go Back</Link></p>
  </div>
);


