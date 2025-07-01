const NotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="mt-4 text-lg text-gray-600">Page Not Found</p>
                <p className="mt-2 text-gray-500">The page you are looking for does not exist.</p>
                <a href="/" className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Go to Home
                </a>
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

export default NotFound;
