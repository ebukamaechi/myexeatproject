export default function Loader({ text = "Loading...", size = "h-8 w-8", color = "text-blue-600" }) {
  return (
    <div
      className="max-w-4xl mx-auto flex flex-col items-center justify-between bg-white px-10 py-5 my-5 rounded-lg shadow-lg text-sm text-gray-700"
      role="status"
      aria-live="polite"
      style={{margin:'auto'}}
    >
      <svg
        className={`animate-spin ${size} ${color} mb-2`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}
