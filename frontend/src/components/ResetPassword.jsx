import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import ResetHeroImage from "../assets/undraw_enter-password_1kl4.svg";
import Logo from "../assets/vunalogos.png";
import Footer from "./common/Footer";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError('passwords must be the same');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_API}/api/auth/reset-password/${token}`, { newPassword: password }, { withCredentials: true });
      setSuccess(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="min-h-screen flex  items-center justify-center bg-gray-100 px-4 py-10">
        <div className="flex w-[900px] h-[350px] bg-white rounded-lg shadow-lg overflow-hidden">

          {/* Left Side: Hero Image */}
          <div className="w-1/2 hidden md:block relative p-4 ">
            <img
              src={ResetHeroImage}
              alt="Reset Password Visual"
              className="object-contain w-full h-full rounded-l-lg"
            />
          </div>

          {/* Right Side: Reset Password Form */}
          <div className="w-full md:w-1/2  md:p-8 login-form flex flex-col justify-center items-center">
            <div className="flex flex-col items-center">
              <img src={Logo} alt="Logo" className="w-24" />
              <h2 className="text-xl md:text-2xl font-bold text-[#19533d]">
                Reset Password
              </h2>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-2">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm text-center mb-2">{success}</p>
            )}

            <form onSubmit={handleReset} className="space-y-3">
              <label htmlFor="password" className="">Password</label>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <label htmlFor="confirmPassword" className="">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#19533d] text-white py-2 rounded hover:bg-[#076d46] transition duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mx-auto text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                ) : (
                  "Submit"
                )}
              </button>
            </form>

            {/* <p className="mt-4 text-sm text-center">
              Remembered your password?{" "}
              <Link to="/login" className="text-blue-600 underline">
                Login
              </Link>
            </p> */}
          </div>
        </div>
      </div>

      <Footer />
    </>

  );




};
export default ResetPassword;