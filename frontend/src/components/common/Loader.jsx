export default function Loader({text = "Loading..."}) {
  return (
    <div className="flex flex-col items-center" style={{
              backgroundColor: '#fff',
              padding: '20px 40px',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#374151',
              boxShadow: '0 0 20px rgba(0,0,0,0.2)'
            }}>
      <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}

