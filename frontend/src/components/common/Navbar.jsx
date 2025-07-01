const Navbar = ({ role, handleLogout }) => {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white shadow sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-lg sm:text-xl">Dashboard ({role})</h1>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;