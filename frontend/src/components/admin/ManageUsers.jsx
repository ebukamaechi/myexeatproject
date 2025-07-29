import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Users,
    ShieldCheck,
    School,
    UserCog,
    UserLock,
} from "lucide-react";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const ManageUsers = () => {
    const [roleCounts, setRoleCounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await axios.get(
                    `${BACKEND_API}/api/users/role-counts`, { withCredentials: true }
                );
                setRoleCounts(res.data);
            } catch (err) {
                console.error("Failed to fetch user counts", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    // Helper to get count by role
    const getCount = (role) => {
        const found = roleCounts.find((r) => r.role === role);
        return found ? found.count : 0;
    };

    const UserCard = ({ title, count, icon, bg = "bg-blue-600", onClick }) => {
        return (
            <div
                style={{ padding: "20px", margin: "20px auto", maxWidth: "500px" }}
                className={`rounded-xl p-5 shadow hover:shadow-md transition-transform hover:scale-105 duration-300 cursor-pointer text-white ${bg}`}
                onClick={onClick}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm uppercase opacity-80">{title}</h2>
                        <p className="text-2xl font-semibold">{loading ? "..." : count}</p>
                    </div>
                    <div className="text-4xl opacity-30">{icon}</div>
                </div>
            </div>
        );
    };

    const Students = () => (
        <UserCard
            title="Students"
            count={getCount("student")}
            icon={<Users />}
            bg="bg-blue-600"
            onClick={() => {
                navigate("/super-admin-dashboard/users/students");
            }}
        />
    );

    const HostelAdmins = () => (
        <UserCard
            title="Hostel Admins"
            count={getCount("hostelAdmin")}
            icon={<UserCog />}
            bg="bg-green-600"
            onClick={() => {
                navigate("/super-admin-dashboard/users/hostel-admins");
            }}
        />
    );

    const Deans = () => (
        <UserCard
            title="Deans"
            count={getCount("dean")}
            icon={<School />}
            bg="bg-yellow-500"
            onClick={() => {
                navigate("/super-admin-dashboard/users/deans");
            }}
        />
    );

    const Security = () => (
        <UserCard
            title="Security"
            count={getCount("security")}
            icon={<ShieldCheck />}
            bg="bg-red-600"
            onClick={() => {
                navigate("/super-admin-dashboard/users/security");
            }}
        />
    );

    const SuperAdmins = () => (
        <UserCard
            title="Super Admins"
            count={getCount("superAdmin")}
            icon={<UserLock />}
            bg="bg-purple-600"
            onClick={() => {
                navigate("/super-admin-dashboard/users/super-admins");
            }}
        />
    );

    return (
        <div
            className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl" style={{ padding: '20px', margin: '20px auto', animation: 'fadeIn 0.5s ease-in-out' }}>
            <h1 className="text-2xl font-bold mb-6" style={{ padding: "10px", borderBottom: "1px solid #eee", color: "#19533d" }}>| Manage Users</h1>
            <p className="text-sm text-gray-400">click card for more details</p>
            <Students />
            <HostelAdmins />
            <Security />
            <Deans />
            <SuperAdmins />
        </div>
    );
};

export default ManageUsers;
