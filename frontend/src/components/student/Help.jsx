import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const Help = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    message: '',
    additionalFeedback: '',
    rating: 0,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (value) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_API}/api/feedback`, formData, { withCredentials: true });
      toast.success(response.data.message);
      setFormData({
        name: user.name,
        email: user.email,
        message: '',
        additionalFeedback: '',
        rating: 0,
      });
      setSubmitted(true);
      console.log('Submitted:', response);
    } catch (error) {
      console.error(error);
      toast.error(error);

    } finally {
      setLoading(false);
    }



  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded" style={{ padding: '20px', margin: '20px auto', animation: 'fadeIn 0.5s ease-in-out' }}>
      <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
      <p className="mb-4 text-gray-700">
        Have a question or want to share feedback? Fill out the form below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Your Name</label>
          <input
            name="name"
            type="text"
            readOnly
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            readOnly
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Message / Complaint</label>
          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Rate Your Experience</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => handleRating(star)}
                className={`text-xl ${formData.rating >= star ? 'text-yellow-500' : 'text-gray-300'
                  }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Additional Feedback</label>
          <textarea
            name="additionalFeedback"
            rows="3"
            value={formData.feedback}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className={` text-white px-6 py-2 rounded hover:bg-blue-700 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
            style={{ cursor: 'pointer', padding: '10px 10px' }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {submitted && (
          <p className="text-green-600 font-medium mt-3">Thanks for your message. We'll get back to you!</p>
        )}
      </form>
    </div>
  );
};

export default Help;
