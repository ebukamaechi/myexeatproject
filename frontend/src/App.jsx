import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from 'react-toastify';
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/common/Unauthorized';
import Loader from './components/common/Loader';
import Layout from './components/common/Layout';
import Exeats from './components/student/Exeats';
import Profile from './components/student/StudentProfile';
import ExeatDetails from './components/student/ExeatDetails';
import NewExeat from './components/student/NewExeat';
import Pricing from './components/student/Pricing';
import SuccessPage from './components/student/SuccessPage';
import FailedPage from './components/student/FailedPage';

import Test from './components/student/test';
import Settings from './components/student/Settings';
import Help from './components/student/Help';


import './App.css';
import NotFound from './components/common/NotFound';
import StudentProfile from './components/student/StudentProfile';
import StudentPayments from './components/student/Payments';


function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    try {
      await axios.post(`${BACKEND_API}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setLoggedIn(false);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BACKEND_API}/api/auth/me`, {
          withCredentials: true,
        });
        console.log("Fetched user:", response.data);
        if (response.data?.user) {
          setUser(response.data.user);
          setLoggedIn(true);
        } else {
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
      // Add more roles here
      default:
        return <Navigate to="/unauthorized" />; // or /login
    }
  };
  console.log({ loggedIn, user, authLoading });

  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} theme="colored"/>
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

          <Route
            path="/super-admin-dashboard"
            element={
              <ProtectedRoute user={user} loggedIn={loggedIn} role="superAdmin">
                <SuperAdminDashboard user={user} handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

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
