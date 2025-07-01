import { NavLink } from 'react-router-dom';
import Logo from '../../assets/vunalogos.png';
import {
  LayoutDashboard,
  User,
  ScrollText,
  DoorOpen,
  LogOut,
  Menu,
  Cog,
  MessageCircleQuestionMark,
  CircleDollarSign,
   CreditCard
} from 'lucide-react';


const Sidebar = ({ role, collapsed, toggleSidebar, handleLogout }) => {
  const navLinks = {
    superAdmin: [
      { path: '/super-admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/super-admin-dashboard/manage-users', label: 'Manage Users', icon: <User size={20} /> },
    ],
    student: [
      { path: '/student-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/student-dashboard/exeats', label: 'Exeats', icon: <DoorOpen size={20} /> },
      { path: '/student-dashboard/profile', label: 'Profile', icon: <User size={20} /> },
      { path: '/student-dashboard/pricing', label: 'Pricing', icon: <CircleDollarSign size={20} /> },
      { path: '/student-dashboard/payments', label: 'Payments', icon: <CreditCard size={20} /> },
      { path: '/student-dashboard/settings', label: 'Settings', icon: <Cog size={20} /> },
      { path: '/student-dashboard/help', label: 'Help & Support', icon: <MessageCircleQuestionMark size={20} /> },
    ],
    staff: [
      { path: '/staff-dashboard', label: 'Staff Panel', icon: <LayoutDashboard size={20} /> },
      { path: '/schedule', label: 'Schedule', icon: <ScrollText size={20} /> },
    ],
  };

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'
        } bg-gray-900 text-white h-screen transition-all duration-300 flex flex-col`}
        // style={{backgroundColor:'#19533d'}}
    >
      {/* Logo and Toggler */}
      <img src={Logo} alt="Logo" className="" style={{ padding: '5px' }} />
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        <div className="flex items-center gap-2">

          {!collapsed && (
            <span className="text-xl font-bold tracking-wide">ExeatMS</span>
          )}
        </div>
        <button onClick={toggleSidebar} className="text-white" style={{border:'1px solid #fff', borderRadius:'3px'}}>
          <Menu />
        </button>
      </div>

      {/* Nav Links */}
      <ul className="flex-1 space-y-1 p-3" style={{ margin: '10px 0', paddingLeft: '10px', paddingRight: '10px' }}>
        <p className="text-sm text-gray-500 ">Student</p>
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
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
