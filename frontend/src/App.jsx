import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

// common
import { Login, Register } from './components/Login';
// import Register from './components/Register';
import { ResetPassword, ForgotPassword } from './components/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { Unauthorized } from './components/common/NotFound';
import Loader from './components/common/Loader';
import Layout from './components/common/Layout';
import LogoutModal from './components/common/LogoutModal';
import Settings from './components/student/Settings';
import Help from './components/student/Help';
import { NotFound } from './components/common/NotFound';

// student
import StudentDashboard from './components/student/StudentDashboard';
import StudentProfile from './components/student/StudentProfile';
import StudentPayments from './components/student/Payments';
import Exeats from './components/student/Exeats';
import Profile from './components/student/StudentProfile';
import ExeatDetails from './components/student/ExeatDetails';
import NewExeat from './components/student/NewExeat';
import Pricing from './components/student/Pricing';
import SuccessPage from './components/student/SuccessPage';
import FailedPage from './components/student/FailedPage';

// Dean
import DeanDashboard from './components/dean/deanDashboard';
import DeanRecommended from './components/dean/Recommended';
import { DeanExeatsPage, DeanExeatDetails, DeanExeatByStudent } from './components/dean/Exeats';
import { DeanStudentDetails, DeanStudents } from './components/dean/DeanStudents';
import { EmergencyExeat } from './components/dean/Emergencies';
import DeanReports from './components/dean/Reports';


// Hostel Admin
import HostelAdminDashboard from './components/hostelAdmin/hostelAdminDashboard';
import HostelAdminExeats from './components/hostelAdmin/Exeats';
import HostelAdminExeatDetails from './components/hostelAdmin/HostelAdminExeatDetails';
import { StudentDetails, HostelAdminStudents } from './components/hostelAdmin/Students';
import ExeatByStudent from './components/hostelAdmin/ExeatsByStudent';
import PendingExeats from './components/hostelAdmin/PendingExeats';
import ManagePaymentPlans from './components/admin/ManagePaymentPlans';
import ManageExeats from './components/admin/ManageExeats';
import ManageUsers from './components/admin/ManageUsers';
import ManageReports from './components/admin/ManageReports';
import ActivityMonitoring from './components/admin/ActivityMonitoring';

// SuperAdmin
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import AdminProfile from './components/admin/AdminProfile';
import ManageStudents from './components/admin/ManageStudents';
import ManageHostelAdmins from './components/admin/ManageHostelAdmins';
import ManageDeans from './components/admin/ManageDeans';
import ManageSuperAdmins from './components/admin/ManageSuperAdmins';
import ManageSecurityAccounts from './components/admin/ManageSecurityAccount';
import SuperAdminStudentDetails from './components/admin/StudentDetails';
import SuperAdminExeatByStudent from './components/admin/ExeatsByStudent';
import SuperAdminExeatDetails from './components/admin/ExeatDetails';
import UserDetails from './components/admin/UserDetails';
import QuotaPage from './components/dean/Quota';




// security
import SecurityDashboard from './components/security/SecurityDashboard';
import ScanExeatPage from './components/security/Scan';





function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);



  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_API}/api/auth/login`, {
        identifier: email,
        password,
      }, {
        withCredentials: true,
      });

      setUser(response.data.user);
      setLoggedIn(true);
      return { success: true, data: response.data };

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const Logout = async () => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_API}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setLoggedIn(false);
      setShowLogoutModal(false);
      setLoading(false);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoading(false);
      setShowLogoutModal(false);
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BACKEND_API}/api/auth/me`, {
          withCredentials: true,
        });
        // console.log("Fetched user:", response.data);

        if (response.data?.user) {
          setUser(response.data.user);
          setLoggedIn(true);
        } else {
          setUser(null);
          setLoggedIn(false);
        }
        if (response.data?.user?.isDisabled === true) {
          setUser(null);
          setLoggedIn(false);
        }
      } catch (err) {
        console.error("Authentication check failed", err);
        setUser(null);
        setLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);


  if (authLoading) return <Loader text="Checking authentication..." />;




  const redirectToRoleDashboard = () => {
    switch (user?.role) {
      case "superAdmin":
        return <Navigate to="/super-admin-dashboard" />;
      case "student":
        return <Navigate to="/student-dashboard" />;
      case "hostelAdmin":
        return <Navigate to="/staff-dashboard" />;
      case "dean":
        return <Navigate to="/dean-dashboard" />;
      case "security":
        return <Navigate to="/security-dashboard" />;
      // Add more roles here
      default:
        return <Navigate to="/unauthorized" />; // or /login
    }
  };
  // console.log({ loggedIn, user, authLoading });

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {showLogoutModal && (
        <LogoutModal
          loading={loading}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={Logout}
        />
      )}

      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <p>Checking authentication...</p>
        </div>
      ) : (

        <Routes>

          <Route path="/" element={loggedIn ? redirectToRoleDashboard() : <Navigate to="/login" />} />

          <Route
            path="/login"
            element={loggedIn ? redirectToRoleDashboard() : <Login login={login} />}
          />

          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />


          {/*---- Super Admin Routes----------- */}
          <Route
            path="/super-admin-dashboard"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <SuperAdminDashboard user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/users"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManageUsers user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/users/students"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManageStudents user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/students/view/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <SuperAdminStudentDetails user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/exeats/by-student/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <SuperAdminExeatByStudent user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/exeats/view/:exeatId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <SuperAdminExeatDetails user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/users/hostel-admins"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManageHostelAdmins user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/hostel-admins/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <UserDetails user={user} role="hostelAdmin" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/users/deans"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManageDeans user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/deans/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <UserDetails user={user} role="dean" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/users/security"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManageSecurityAccounts user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/security/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <UserDetails user={user} role="security" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/users/super-admins"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManageSuperAdmins user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/super-admins/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <UserDetails user={user} role="superAdmin" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/manage-payment-plans"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManagePaymentPlans user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/manage-exeats"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManageExeats user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />     <Route
            path="/super-admin-dashboard/manage-reports"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ManageReports user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/activity"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ActivityMonitoring user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/settings"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <Settings user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard/profile"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <Layout role="superAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <AdminProfile user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* ------------------Student Routes------------------ */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <StudentDashboard user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard/exeats"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <Exeats user={user}
                  />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard/pricing"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <Pricing user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard/settings"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <Settings user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-dashboard/profile"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <StudentProfile user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard/payments"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <StudentPayments user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard/exeats/view/:exeatId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ExeatDetails user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard/help"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <Help user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-dashboard/exeats/new"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <NewExeat user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard/payment-success"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <SuccessPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard/payment-failed"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <FailedPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-dashboard/test"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="student">
                <Layout role="student" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <Test />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Dean Routes */}
          <Route
            path="/dean-dashboard"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <DeanDashboard user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/recommended"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <DeanRecommended user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/exeats"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <DeanExeatsPage user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/exeats/view/:exeatId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <DeanExeatDetails user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/exeats/by-student/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <DeanExeatByStudent user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/settings"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <Settings user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/students"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <DeanStudents user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/students/view/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <DeanStudentDetails user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/emergencies"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <EmergencyExeat user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/quota"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <QuotaPage user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-dashboard/reports"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="dean">
                <Layout role="dean" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <DeanReports user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />




          {/* Hostel Admin Routes */}
          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="hostelAdmin">
                <Layout role="hostelAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <HostelAdminDashboard user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard/exeats"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="hostelAdmin">
                <Layout role="hostelAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <HostelAdminExeats user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard/exeats/view/:exeatId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="hostelAdmin">
                <Layout role="hostelAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <HostelAdminExeatDetails user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard/settings"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="hostelAdmin">
                <Layout role="hostelAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <Settings user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard/students"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="hostelAdmin">
                <Layout role="hostelAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <HostelAdminStudents user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard/students/view/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="hostelAdmin">
                <Layout role="hostelAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <StudentDetails user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard/exeats/by-student/:userId"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="hostelAdmin">
                <Layout role="hostelAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ExeatByStudent user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard/pending"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="hostelAdmin">
                <Layout role="hostelAdmin" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <PendingExeats user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/*---------------- Security------------ */}

          <Route
            path="/security-dashboard"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="security">
                <Layout role="security" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <SecurityDashboard user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/security-dashboard/scan"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="security">
                <Layout role="security" handleLogout={handleLogout} collapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(prev => !prev)}>
                  <ScanExeatPage user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* ---------------------------------------------- */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Fallback route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      )}
    </>
  );

}

export default App;
