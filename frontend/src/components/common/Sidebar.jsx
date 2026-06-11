import { NavLink } from 'react-router-dom';
import Logo from '../../assets/vunalogos.png';
import {
  LayoutDashboard,
  User,
  ScrollText,
  DoorOpen,
  Menu,
  Cog,
  MessageCircleQuestionMark,
  CircleDollarSign,
  CreditCard,
  FileCheck,
  CircleEllipsis,
  UsersRound,
  Users,
  WalletCards,
  IdCard,
  ChartColumn,
  ChartNoAxesCombined,
  TrafficCone,
  DownloadCloudIcon,
  UploadCloudIcon,
  CopyPlus,
  DollarSignIcon,
} from 'lucide-react';


const Sidebar = ({ role, collapsed, toggleSidebar, handleLogout }) => {
  const navLinks = {
    superAdmin: [
      { path: '/super-admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/super-admin-dashboard/users', label: 'Manage Users', icon: <Users size={20} /> },
      { path: '/super-admin-dashboard/manage-payment-plans', label: 'Manage Payments & Plans', icon: <WalletCards size={20} /> },
      { path: '/super-admin-dashboard/manage-exeats', label: 'Manage Exeats', icon: <IdCard size={20} /> },
      { path: '/super-admin-dashboard/manage-reports', label: 'Manage Reports', icon: <ChartColumn size={20} /> },
      { path: '/super-admin-dashboard/feedback', label: 'Feedback', icon: <MessageCircleQuestionMark size={20} /> },
      { path: '/super-admin-dashboard/activity', label: 'Activity Logs', icon: <ChartNoAxesCombined size={20} /> },
      { path: '/super-admin-dashboard/profile', label: 'Profile', icon: <User size={20} /> },
      { path: '/super-admin-dashboard/settings', label: 'Settings', icon: <Cog size={20} /> },

    ],
    student: [
      { path: '/student-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/student-dashboard/exeats', label: 'Exeats', icon: <DoorOpen size={20} /> },
      { path: '/student-dashboard/profile', label: 'Profile', icon: <User size={20} /> },
      { path: '/student-dashboard/pricing', label: 'Pricing', icon: <CircleDollarSign size={20} /> },
      { label: "My Debts", path: "/student-dashboard/debts", icon: <DollarSignIcon size={20} /> },
      { path: '/student-dashboard/payments', label: 'Payments', icon: <CreditCard size={20} /> },
      { path: '/student-dashboard/help', label: 'Help & Support', icon: <MessageCircleQuestionMark size={20} /> },
      { path: '/student-dashboard/settings', label: 'Settings', icon: <Cog size={20} /> },
    ],
    security: [
      { path: '/security-dashboard', label: 'Security Panel', icon: <LayoutDashboard size={20} /> },
      { path: '/security-dashboard/scan', label: 'Scan Exeat', icon: <ScrollText size={20} /> },
      { path: '/security-dashboard/logs', label: 'Logs', icon: <Cog size={20} /> },
      { path: '/security-dashboard/report', label: 'Report', icon: <TrafficCone size={20} /> },
      { path: '/security-dashboard/settings', label: 'Settings', icon: <Cog size={20} /> },
    ],
    hostelAdmin: [
      { path: '/staff-dashboard', label: 'Staff Panel', icon: <LayoutDashboard size={20} /> },
      { path: '/staff-dashboard/pending', label: 'Pending', icon: <CircleEllipsis size={20} /> },
      { path: '/staff-dashboard/exeats', label: 'Exeats', icon: <FileCheck size={20} /> },
      { path: '/staff-dashboard/students', label: 'Students', icon: <UsersRound size={20} /> },
      { path: '/staff-dashboard/settings', label: 'Settings', icon: <Cog size={20} /> },
      { path: '/staff-dashboard/complaints', label: 'Complaints', icon: <MessageCircleQuestionMark size={20} /> },

    ],
    dean: [
      { path: '/dean-dashboard', label: 'Dean Panel', icon: <LayoutDashboard size={20} /> },
      { path: '/dean-dashboard/recommended', label: 'Recommended', icon: <ScrollText size={20} /> },
      { path: '/dean-dashboard/exeats', label: 'Exeats', icon: <FileCheck size={20} /> },
      { path: '/dean-dashboard/emergencies', label: 'Emergency Exeat', icon: <TrafficCone size={20} /> },
      { path: '/dean-dashboard/students', label: 'Students', icon: <UsersRound size={20} /> },
      { label: "Manage Debts", path: "/dean-dashboard/debts", icon: <DollarSignIcon size={20} /> },
      { path: '/dean-dashboard/quota', label: 'Student Quota', icon: <CopyPlus size={20} /> },
      { path: '/dean-dashboard/reports', label: 'Reports', icon: <DownloadCloudIcon size={20} /> },
      { path: '/dean-dashboard/feedback', label: 'Feedback', icon: <MessageCircleQuestionMark size={20} /> },
      { path: '/dean-dashboard/settings', label: 'Settings', icon: <Cog size={20} /> },


    ],
  };

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'
        } bg-gray-900 text-white h-screen transition-all duration-300 flex flex-col`}
    // style={{backgroundColor:'#19533d'}}
    >
      {/* Logo and Toggler */}
      <NavLink to='/student-dashboard' style={{ padding: '5px' }} >
        <img src={Logo} alt="Logo" className="" style={{ padding: '5px' }} />
      </NavLink>

      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        <div className="flex items-center gap-2">

          {!collapsed && (
            <span className="text-xl font-bold tracking-wide">MyExeatMS</span>
          )}
        </div>
        <button onClick={toggleSidebar} className="text-white" style={{ border: '2px solid #fff', borderRadius: '4px' }}>
          <Menu />
        </button>
      </div>

      {/* Nav Links */}
      <ul className="flex-1 space-y-1 p-3" style={{ margin: '10px 0', paddingLeft: '10px', paddingRight: '10px' }}>
        {role === 'student' ? (
          <p className="text-sm text-gray-500">Student</p>
        ) : role === 'dean' ? (
          <p className="text-sm text-gray-500">Dean</p>
        ) : role === 'hostelAdmin' ? (
          <p className="text-sm text-gray-500">Hostel Admin</p>
        ) : role === 'security' ? (
          <p className="text-sm text-gray-500">Security</p>
        ) : role === 'superAdmin' ? (
          <p className="text-sm text-gray-500">Super Admin</p>
        ) : (
          <p className="text-sm text-gray-500">Unknown Role</p>
        )}

        {navLinks[role]?.map(link => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${isActive
                  ? 'bg-gray-700 font-semibold'
                  : 'hover:bg-gray-800 text-gray-300'
                }`
              } style={{ display: 'flex', alignItems: 'center', padding: '10px', paddingLeft: '10px', paddingRight: '10px', textDecoration: 'none', margin: '5px 0', color: 'white', hover: { backgroundColor: '#19533d', color: 'white' } }}
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-700" style={{ padding: '10px', borderTop: '1px solid #4a5568' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm rounded-lg hover:bg-gray-800 transition-all duration-200" style={{ display: 'flex', alignItems: 'center', padding: '10px', paddingLeft: '10px', paddingRight: '10px', textDecoration: 'none', color: 'white' }}
        >
          <DoorOpen size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
