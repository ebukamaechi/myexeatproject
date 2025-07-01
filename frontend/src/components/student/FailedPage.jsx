import {useLocation} from 'react-router-dom';
const FailedPage = () => {
    const location = useLocation();
    const { reference, amount, quota, planName } = location.state || {};
    console.error('Payment failed:', {
        reference,
        amount,
        quota,
        planName
    });
    // You can also log this information to an external service for further analysis
    // e.g., Sentry, LogRocket, etc.    

    return (

        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-gray-700 mb-2">Your payment could not be processed.</p>
        <p className="text-gray-500 mb-2"><strong>Reference:</strong> {reference || 'Not available'}</p>
        <p className="text-gray-500 mb-2"><strong>Amount:</strong> {amount ? `₦${amount.toLocaleString()}` : 'Not available'}</p>
        <p className="text-gray-700 mb-6">Unfortunately, your payment could not be processed. Please try again.</p>
        <a href="/student-dashboard/pricing" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
            Go Back to Pricing
        </a>
        </div>
    );
    }
export default FailedPage;