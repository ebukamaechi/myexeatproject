import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RegisterHeroImage from "../assets/undraw_portfolio-feedback_4iok.svg";
import Logo from "../assets/vunalogos.png";
import Footer from "./common/Footer";
import { Typewriter } from 'react-simple-typewriter';
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
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

export default Register;
