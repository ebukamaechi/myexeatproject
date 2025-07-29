import React from 'react';
import { Cpu, Users, Activity, AlertTriangle } from 'lucide-react';

const mockStats = {
  usersOnline: 12,
  uptime: '3 days 4 hrs',
  cpuUsage: 57,
  memoryUsage: 68,
};

const mockActivities = [
  { time: '10:45 AM', user: 'admin1', action: 'Login', details: 'Admin logged in' },
  { time: '11:02 AM', user: 'johnDoe', action: 'Created Plan', details: 'Plan: Gold' },
  { time: '11:12 AM', user: 'admin2', action: 'Deleted User', details: 'userID: 204' },
];

const mockOnlineUsers = [
  { name: 'admin1', role: 'Super Admin', status: 'Online', lastActive: '2 mins ago' },
  { name: 'johnDoe', role: 'User', status: 'Idle', lastActive: '10 mins ago' },
];

const ActivityMonitoring = () => {
  return (
    <section className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-green-700">| Activity Monitoring</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <Users className="text-blue-600" />
          <div>
            <p className="text-gray-500 text-sm">Users Online</p>
            <h3 className="text-lg font-semibold">{mockStats.usersOnline}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <Activity className="text-purple-600" />
          <div>
            <p className="text-gray-500 text-sm">System Uptime</p>
            <h3 className="text-lg font-semibold">{mockStats.uptime}</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <Cpu className="text-orange-500" />
          <div>
            <p className="text-gray-500 text-sm">CPU Usage</p>
            <h3 className="text-lg font-semibold">{mockStats.cpuUsage}%</h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <Cpu className="text-pink-600" />
          <div>
            <p className="text-gray-500 text-sm">RAM Usage</p>
            <h3 className="text-lg font-semibold">{mockStats.memoryUsage}%</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Logs */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Recent Activities</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {mockActivities.map((log, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2">{log.time}</td>
                <td>{log.user}</td>
                <td>{log.action}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Online Users */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Currently Online Users</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {mockOnlineUsers.map((user, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2">{user.name}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Alerts (Optional) */}
      <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow flex items-center gap-2">
        <AlertTriangle />
        <p>No recent system warnings.</p>
      </div>
    </section>
  );
};

export default ActivityMonitoring;
