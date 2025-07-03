import Layout from '../common/Layout';


const SuperAdminDashboard = ({ user }) => {

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen" style={{}}>
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name} (Super Admin)</h2>
            <p>This is your super admin dashboard.</p>
            <p>You can manage users, view reports, and perform administrative tasks here.</p>
            {/* <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded logout-button">Logout</button> */}
        </div>
    )
};

export default SuperAdminDashboard;
