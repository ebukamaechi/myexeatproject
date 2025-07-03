
const HostelAdminDashboard = ({ user }) => {

    return (
        <section className="p-4 sm:p-6 bg-gray-50 min-h-screen" style={{padding: '20px'}}>
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name} (Hostel Admin)</h2>
            <p>This is your Hostel Admin dashboard.</p>
            <p>You can manage users, approve exeats, view reports, and perform Hostel administrative tasks here.</p>
        </section>
    )
};

export default HostelAdminDashboard;
