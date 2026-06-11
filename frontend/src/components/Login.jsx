import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginHeroImage from "../assets/undraw_online-posts_avfn.svg";
import Logo from "../assets/vunalogos.png";
import { Typewriter } from 'react-simple-typewriter';
import Footer from "./common/Footer";
import axios from "axios";
import RegisterHeroImage from "../assets/undraw_portfolio-feedback_4iok.svg";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

export const Login = ({ login }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    let identifier = email.trim();
    const isEmail = identifier.includes('@');

    if (isEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        setError("Invalid email format.");
        setLoading(false);
        return;
      }
    } else {
      // Notify user about slashes before cleaning
      if (identifier.includes('/')) {
        setError('Please remove "/" from your username.');
        setLoading(false);
        return;
      }

      identifier = identifier.toUpperCase();

      const usernameRegex = /^[A-Z0-9]+$/;
      if (!usernameRegex.test(identifier)) {
        setError("Invalid username format. Only letters and numbers are allowed.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await login(identifier, password);

      if (!response || !response.success) {
        setError("Login failed: " + response.message);
        return;
      }

      const role = response.data.user.role;

      // Redirect based on role
      if (role === 'superAdmin') {
        navigate('/super-admin-dashboard');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/dashboard'); // fallback
      }
    } catch (error) {
      setError("An error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
        <div className="flex w-[800px] bg-white rounded-lg shadow-lg overflow-hidden">

          {/* Left: Hero Image */}
          <div className="w-1/2 hidden md:block  relative">
            <img
              src={LoginHeroImage} // replace with your own image path
              alt="Login"
              className="object-contain w-full h-full rounded-l-lg"
            />
          </div>

          {/* Right: Login Form */}
          <div className="w-full md:w-1/2 p-6 md:p-8 login-form">
            <div className="flex flex-col items-center mb-2 justify-center">
              <img src={Logo} alt="" className=" w-30 " />
              {/* <h2 className="text-2xl font-bold text-center">EXEATMS Login</h2> */}
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                <Typewriter
                  words={['Welcome Back!', 'Access Your Dashboard', 'Manage Your Exeats', 'Request Exeat on the Go', 'No Waiting in Line', 'Stay Connected!']}
                  loop={0}
                  cursor
                  cursorStyle="|"
                  typeSpeed={50}
                  deleteSpeed={40}
                  delaySpeed={3000}
                />
              </h2>
            </div>

            {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

            <form onSubmit={handleLogin} className="">
              <label htmlFor="email">Email/Username</label>
              <input
                id="email"
                type="text"
                placeholder="email@veritas.edu.ng/VUGCSC2310215" // Example format, adjust as needed
                // Note: Email is not strictly required, but username is
                required

                value={email}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setEmail(e.target.value)}
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 rounded transition duration-200 hover:bg-blue-700 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="mt-4 text-sm text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 ">Register</Link>
            </p>
            <p className="mt-2 text-sm text-center">
              Forgot password?{" "}
              <Link to="/forgot-password" className="text-blue-600">Reset</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

};




export const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    matricNumber: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password || !form.role) {
      setError("All fields are required.");
      return;
    }

    if (form.role === "student" && !form.matricNumber) {
      setError("Matric Number is required for students.");
      return;
    }

    try {
      const payload = { ...form };
      if (form.role !== "student") delete payload.matricNumber;

      const response = await axios.post(`${BACKEND_API}/api/auth/register`, payload);

      setSuccess(response.data.message);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        matricNumber: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
        <div className="flex w-[900px] h-[650px] bg-white rounded-lg shadow-lg overflow-hidden">

          {/* Left Side: Hero Image */}
          <div className="w-1/2 hidden md:block relative p-4">
            <img
              src={RegisterHeroImage}
              alt="Register Visual"
              className="object-contain w-full h-full rounded-l-lg"
            />
          </div>

          {/* Right Side: Register Form */}
          <div className="w-full md:w-1/2 md:p-8 register-form flex flex-col justify-center items-center">
            <div className="flex flex-col items-center">
              <img src={Logo} alt="Logo" className="w-24 mb-2" />
              <h2 className="text-xl md:text-2xl font-bold text-[#19533d] text-center mb-2">
                <Typewriter
                  words={[
                    'Create Your Account',
                    'Join the Platform',
                    'Get Started with ExeatMS',
                    'Track & Request Exeats',
                    'Your Dashboard Awaits!',
                  ]}
                  loop={0}
                  cursor
                  cursorStyle="|"
                  typeSpeed={50}
                  deleteSpeed={40}
                  delaySpeed={3000}
                />
              </h2>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-2">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm text-center mb-2">{success}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 w-full">
              <label htmlFor="name" className="">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <label htmlFor="email" className="">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
                <label htmlFor="password" className="">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

                <label htmlFor="role" className="">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="hostelAdmin">Hostel Admin</option>
                <option value="security">Security Account</option>
                <option value="superAdmin">Super Admin</option>
                <option value="dean">Dean</option>
              </select>

              {form.role === "student" && (
                <>
                  <label htmlFor="matricNumber" className="">Matric Number</label>
                  <input
                    type="text"
                    name="matricNumber"
                    placeholder="Matric Number"
                    value={form.matricNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}

              <button
                type="submit"
                className="w-full bg-[#19533d] text-white py-2 rounded hover:bg-[#076d46] transition duration-200"
              >
                Register
              </button>
            </form>

            <p className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
// export default Login;